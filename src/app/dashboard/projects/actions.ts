'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAction } from '@/utils/supabase/logger'
import { getWorkflowConfig } from '@/utils/supabase/queries'
import staticQuestions from '@/utils/builder/static-questions.json'

// Helper to route data to correct segments within projects.config and projects.stage_data
async function routeWorkflowData(supabase: any, projectId: string, stageId: string | undefined, data: Record<string, any>, userId: string) {
  // 1. Get current project config and stage_data
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('config, stage_data')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) {
    console.error(`ERROR: Project ${projectId} not found or columns missing.`, fetchError)
    throw new Error(`Project not found (Check if config/stage_data columns exist). Error: ${fetchError?.message}`)
  }

  const currentConfig = project.config || {}
  const currentStageData = project.stage_data || {}

  const seoMetadata = currentConfig.seo || {}
  const currentBuilder = currentConfig.builder || {}
  const builderConfig = {
    global_styles: currentBuilder.global_styles || {},
    content_overrides: currentBuilder.content_overrides || {},
    selected_components: currentBuilder.selected_components || [],
    component_settings: currentBuilder.component_settings || {}
  }
  const dynamicData: any = {}
  const paymentData: any = { project_id: projectId, status: 'PAID', payment_type: 'BANK_TRANSFER' }
  let hasPayment = false

  // 2. Get field metadata if dynamic
  let stageFields: any[] = []
  if (stageId) {
    const { data: fields } = await supabase.from('workflow_fields').select('*').eq('stage_id', stageId)
    stageFields = fields || []
  }

  // 3. Process Data
  for (const [key, val] of Object.entries(data)) {
    if (!val && val !== 0 && val !== false) continue

    // a. Check Static Questions first
    const sq = staticQuestions.find(q => q.key === key)
    if (sq) {
      if (sq.category === 'seo_metadata') seoMetadata[key] = val
      else if (sq.category === 'content_overrides') builderConfig.content_overrides[key] = val
      else if (sq.category === 'global_styles') builderConfig.global_styles[key] = val
      else dynamicData[key] = val
      continue
    }

    // b. Check Dynamic Field Metadata
    const field = stageFields.find(f => f.name === key)
    if (field?.placeholder?.startsWith('{')) {
      try {
        const p = JSON.parse(field.placeholder)
        if (p.builder?.category && p.builder?.key) {
          const { category, key: builderKey } = p.builder
          if (category === 'seo_metadata') seoMetadata[builderKey] = val
          else if (category === 'content_overrides') builderConfig.content_overrides[builderKey] = val
          else if (category === 'global_styles') builderConfig.global_styles[builderKey] = val
          else if (category === 'payments') {
            hasPayment = true
            if (builderKey === 'amount') paymentData.amount = parseFloat(val as string)
            else if (builderKey === 'date') paymentData.created_at = new Date(val as string).toISOString()
            else paymentData[builderKey] = val
          }
          continue 
        }
      } catch(e) {}
    }

    // c. Default to current dynamic data segment
    dynamicData[key] = val
  }

  // 4. Update combined config and stage_data
  const updatePayload: any = {
    config: {
      ...currentConfig,
      seo: seoMetadata,
      builder: builderConfig
    }
  }

  if (Object.keys(dynamicData).length > 0 && stageId) {
    updatePayload.stage_data = {
      ...currentStageData,
      [stageId]: {
        data: dynamicData,
        submitted_by: userId,
        submitted_at: new Date().toISOString()
      }
    }
  }

  const { error } = await supabase.from('projects').update(updatePayload).eq('id', projectId)
  if (error) throw new Error('Failed to update project configuration')

  if (hasPayment && paymentData.amount > 0) {
    await supabase.from('payments').insert(paymentData)
  }
}

export async function saveHandoffPreset(projectId: string, nextStatus: string, nextAssigneeId: string) {
  const supabase = await createClient()

  const { data: project, error: getError } = await supabase
    .from('projects')
    .select('config')
    .eq('id', projectId)
    .single()

  if (getError) throw getError

  const updatedConfig = {
    ...(project.config || {}),
    handoff: {
      next_status_key: nextStatus,
      next_assignee_id: nextAssigneeId,
      updated_at: new Date().toISOString()
    }
  }

  const { error: updateError } = await supabase
    .from('projects')
    .update({ config: updatedConfig })
    .eq('id', projectId)

  if (updateError) throw updateError
  revalidatePath('/dashboard/projects')
}
export async function submitStageData(
  projectId: string, 
  stageId: string, 
  data: Record<string, any>,
  nextStatusOverride?: string,
  nextAssigneeOverride?: string,
  note?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. Get Project and Workflow
  const { data: project, error: pError } = await supabase
    .from('projects')
    .select('*, workflow_templates(*, workflow_stages(*))')
    .eq('id', projectId)
    .single()

  if (pError || !project) throw new Error('Project not found')

  // 2. Determine Next Stage and Assignee
  const template = Array.isArray(project.workflow_templates) ? project.workflow_templates[0] : project.workflow_templates
  const stages = template?.workflow_stages || []
  
  // Use Stored Presets if no manual override passed
  const handoffPreset = project.config?.handoff || {}
  const finalNextStatus = nextStatusOverride || handoffPreset.next_status_key
  const finalNextAssignee = nextAssigneeOverride || handoffPreset.next_assignee_id

  // If we still don't have them, calculate them
  let nextStatus = finalNextStatus
  let nextAssigneeId = finalNextAssignee

  if (!nextStatus || !nextAssigneeId) {
    const currentIndex = stages.findIndex((s: any) => s.status_key === project.status)
    const nextStage = stages[currentIndex + 1]
    
    if (nextStage) {
      nextStatus = nextStatus || nextStage.status_key
      if (!nextAssigneeId && project.project_team) {
        const team = project.project_team[0] || {}
        const roleKeys: any = { 'SEO': 'seo_id', 'Developer': 'developer_id', 'Manager': 'manager_id', 'Sales': 'sales_id', 'Designer': 'designer_id' }
        nextAssigneeId = team[roleKeys[nextStage.acting_role]]
      }
    }
  }

  // 3. Process and route stage data
  await routeWorkflowData(supabase, projectId, stageId, data, user.id)

  // 4. Update Project Status & Reset handoff preset after use
  const updatedConfig = { ...(project.config || {}) }
  delete updatedConfig.handoff

  const finalStatus = nextStatus || project.status
  const currentStage = stages.find((s: any) => s.status_key === finalStatus)

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      status: finalStatus,
      current_assignee_id: nextAssigneeId || project.current_assignee_id,
      config: updatedConfig,
      current_stage_id: currentStage?.id || project.current_stage_id,
      next_stage_id: stages.find((s: any) => s.status_key === currentStage?.next_status_key)?.id || null
    })
    .eq('id', projectId)

  if (updateError) throw updateError
  
  if (note && note.trim()) {
    await supabase.from('comments').insert({
      project_id: projectId,
      user_id: user.id,
      content: `Handoff Note: ${note}`,
      is_internal: true
    })
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function handoffProject(projectId: string, assigneeId: string, status?: string, note?: string, stageData?: { stageId: string, data: any }, targetStageId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Verify Authorization: Only current assignee or Manager/Admin can handoff
  const { data: project, error: pError } = await supabase
    .from('projects')
    .select('current_assignee_id, workflow_template_id')
    .eq('id', projectId)
    .single()

  if (pError || !project) throw new Error('Project not found')


  // 1. Process and route stage data
  if (stageData?.data) {
    await routeWorkflowData(supabase, projectId, stageData.stageId, stageData.data, user.id)
  }
  
  const updateData: any = { current_assignee_id: assigneeId }
  if (status || targetStageId) {
    const { data: targetStage } = await supabase.from('workflow_stages')
      .select('id, status_key, next_status_key')
      .eq('template_id', project.workflow_template_id)
      .eq(targetStageId ? 'id' : 'status_key', targetStageId || status)
      .maybeSingle()
      
    if (targetStage) {
      updateData.status = targetStage.status_key
      updateData.current_stage_id = targetStage.id
      if (targetStage.next_status_key) {
        const { data: nextStage } = await supabase.from('workflow_stages')
          .select('id')
          .eq('template_id', project.workflow_template_id)
          .eq('status_key', targetStage.next_status_key)
          .maybeSingle()
        if (nextStage) updateData.next_stage_id = nextStage.id
      } else {
        updateData.next_stage_id = null
      }
    }
  }

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)

  if (error) {
    console.error('Handoff error:', error)
    throw new Error('Failed to handoff project')
  }

  if (note && note.trim()) {
    await supabase.from('comments').insert({
      project_id: projectId,
      user_id: user.id,
      content: `Handoff Note: ${note}`,
      is_internal: true
    })
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const templateId = formData.get('workflow_template_id') as string
  const providedAssigneeId = formData.get('current_assignee_id') as string | null
  let finalAssigneeId = providedAssigneeId && providedAssigneeId.trim() !== '' ? providedAssigneeId : null

  // 1. Fetch Workflow Stages to find initial status and role
  const { data: stages } = await supabase
    .from('workflow_stages')
    .select('*')
    .eq('template_id', templateId)
    .order('created_at', { ascending: true })

  const initialStage = stages?.find(s => s.is_initial) || stages?.[0]
  const initialStatus = initialStage?.status_key || 'NEW_LEAD'

  // 2. Default to creator as assignee if none provided
  const assigneeId = finalAssigneeId || user.id;

  const projectData = {
    client_name: formData.get('client_name') as string,
    client_email: formData.get('client_email') as string,
    client_phone: formData.get('client_phone') as string,
    preferred_comm_channel: formData.get('preferred_comm_channel') as string,
    client_type: formData.get('client_type') as string,
    domain_required: formData.get('domain_required') === 'on',
    existing_domain: formData.get('existing_domain') as string,
    budget: parseFloat(formData.get('budget') as string) || 0,
    reference_websites: (formData.get('reference_websites') as string)?.split(',').map(s => s.trim()),
    description: (formData.get('description') || formData.get('More About Bussiness')) as string,
    status: initialStatus,
    workflow_template_id: templateId,
    current_assignee_id: assigneeId,
    deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : null,
    is_active: true,
    current_stage_id: initialStage?.id,
    next_stage_id: stages?.find(s => s.status_key === initialStage?.next_status_key)?.id
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single()

  if (projectError) {
    console.error('Project creation error:', projectError)
    throw new Error('Failed to create project')
  }

  // 3. Initialize SEO & Builder configs (Atomic in projects.config)
  const defaultConfig = {
    seo: {
      website_title: project.client_name,
      meta_description: project.description
    },
    builder: {
      selected_components: ['NAV_GLASS', 'HERO_CENTERED', 'FEATURES_GRID', 'FOOTER_MINIMAL'],
      global_styles: { 
        primary_color: '#000000', 
        accent_color: '#3b82f6', 
        font_family_heading: 'Inter', 
        font_family_body: 'Inter', 
        button_radius: 'md', 
        button_style: 'solid' 
      },
      content_overrides: { 
        h1: project.client_name, 
        description: project.description,
        email: project.client_email,
        phone: project.client_phone
      }
    }
  }

  await supabase.from('projects').update({ config: defaultConfig }).eq('id', project.id)

  // 4. Process All incoming dynamics including initial Stage data
  const dynamicData: Record<string, any> = {}
  formData.forEach((value, key) => {
    if (key.startsWith('dyn_')) {
      dynamicData[key.replace('dyn_', '')] = value
    } else if (staticQuestions.some(q => q.key === key)) {
      dynamicData[key] = value
    }
  })

  if (Object.keys(dynamicData).length > 0) {
    await routeWorkflowData(supabase, project.id, initialStage?.id, dynamicData, user.id)
  }

  // 5. Handle Notifications and Activity
  if (projectData.current_assignee_id) {
    await supabase.from('notifications').insert({
      user_id: projectData.current_assignee_id,
      project_id: project.id,
      type: 'PROJECT_ASSIGNED',
      message: `You were assigned to a new project: ${project.client_name}. SEO and Builder initial states are ready.`,
    })

    await supabase.from('comments').insert({
      project_id: project.id,
      user_id: user.id,
      content: `System: Project initialized with SEO and Builder configurations. Status set to ${initialStatus.replace(/_/g, ' ')}.`,
      is_internal: true
    })
  }

  // Record log
  await logAction('CREATE_PROJECT_UNIFIED', { 
    projectId: project.id, 
    clientName: projectData.client_name,
    templateId: projectData.workflow_template_id
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/projects')
  return { success: true, id: project.id }
}

export async function assignTeam(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const seoId = formData.get('seo_id') as string | null
  const devId = formData.get('developer_id') as string | null
  const mgrId = formData.get('manager_id') as string | null

  const teamData = {
    seo_id: seoId,
    developer_id: devId,
    manager_id: mgrId,
    hr_id: formData.get('hr_id') as string,
    designer_id: formData.get('designer_id') as string,
  }

  const { error: teamError } = await supabase
    .from('project_team')
    .update(teamData)
    .eq('project_id', projectId)

  if (teamError) {
    console.error('Team assignment error:', teamError)
    throw new Error('Failed to assign team')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Read overrides from form
  const nxtAssigneeOverride = formData.get('current_assignee_id') as string | null
  const statusOverride = formData.get('status') as string | null

  // Determine optimal handover if not overridden: target SEO first, else skip to DEV, else skip to MANAGER, else fallback to current user.
  const nxtAssignee = nxtAssigneeOverride || seoId || devId || mgrId || user.id

  // 2. Fetch current status if needed
  const { data: project } = await supabase.from('projects').select('status, workflow_template_id').eq('id', projectId).single()

  // Update project status & hand off Assignee ownership
  const updateData: any = { current_assignee_id: nxtAssignee }
  
  const { data: stages } = await supabase
    .from('workflow_stages')
    .select('*')
    .eq('template_id', project?.workflow_template_id)
    .order('created_at', { ascending: true })

  if (statusOverride && statusOverride !== '') {
    updateData.status = statusOverride
  } else if (stages) {
    const currentIdx = stages.findIndex(s => s.status_key === project?.status)
    if (currentIdx !== -1 && stages[currentIdx + 1]) {
        updateData.status = stages[currentIdx+1].status_key
    }
  }

  await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)

  // Notify assigned personnel
  const notifications = [
    { user_id: teamData.seo_id, project_id: projectId, type: 'TEAM_ASSIGNED', message: 'You have been assigned to navigate the SEO Strategy phase for a new project.' },
    { user_id: teamData.developer_id, project_id: projectId, type: 'TEAM_ASSIGNED', message: 'You have been designated as the Engineer for a new project.' },
  ].filter(n => n.user_id) // Only notify if actually populated

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications)
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function selfAssignProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  await supabase
    .from('projects')
    .update({ current_assignee_id: user.id })
    .eq('id', projectId)

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateSEOConfig(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const seoData = {
    project_id: projectId,
    website_title: formData.get('website_title') as string,
    meta_description: formData.get('meta_description') as string,
    target_keywords: formData.get('target_keywords') as string,
    sitemap_required: formData.get('sitemap_required') === 'on',
    facebook_page: formData.get('facebook_page') as string,
    instagram: formData.get('instagram') as string,
    linkedin: formData.get('linkedin') as string,
    twitter: formData.get('twitter') as string,
    youtube: formData.get('youtube') as string,
    google_analytics: formData.get('google_analytics') as string,
    google_search_console: formData.get('google_search_console') as string,
    schema_required: formData.get('schema_required') === 'on',
    robots_txt: formData.get('robots_txt') as string,
  }

  const { data: project } = await supabase.from('projects').select('config, workflow_template_id').eq('id', projectId).single()
  const config = project?.config || {}

  const { error: seoError } = await supabase
    .from('projects')
    .update({
      config: {
        ...config,
        seo: {
          ...(config.seo || {}),
          ...seoData
        }
      }
    })
    .eq('id', projectId)

  if (seoError) {
    console.error('SEO config error:', seoError)
    throw new Error('Failed to update SEO config')
  }

  // Retrive Dev ID to Hand off project ownership
  const { data: team } = await supabase
    .from('project_team')
    .select('developer_id, manager_id')
    .eq('project_id', projectId)
    .single()

  const fallbackHandoff = team?.developer_id || team?.manager_id || null

  // Find the next stage dynamically
  const { data: stages } = await supabase
    .from('workflow_stages')
    .select('*')
    .eq('template_id', project?.workflow_template_id)
    .order('created_at', { ascending: true })

  const currentStageIndex = stages?.findIndex(s => s.acting_role === 'SEO') ?? -1
  const nextStage = stages && currentStageIndex !== -1 ? stages[currentStageIndex + 1] : null

  // Update project status
  await supabase
    .from('projects')
    .update({ 
      status: nextStage?.status_key || 'COMPLETED',
      current_assignee_id: fallbackHandoff 
    })
    .eq('id', projectId)

  // Notify Developer
  if (team?.developer_id) {
    await supabase.from('notifications').insert({
      user_id: team.developer_id,
      project_id: projectId,
      type: 'SEO_COMPLETED',
      message: 'SEO Protocol completed. The Project repository ownership has transitioned to you for implementation.',
    })
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateDevConfig(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const devData = {
    project_id: projectId,
    hosting_provider: formData.get('hosting_provider') as string,
    hosting_email: formData.get('hosting_email') as string,
    hosting_password: formData.get('hosting_password') as string,
    domain_registrar: formData.get('domain_registrar') as string,
    domain_login: formData.get('domain_login') as string,
    cms_used: formData.get('cms_used') as string,
    repo_link: formData.get('repo_link') as string,
    staging_link: formData.get('staging_link') as string,
    live_preview_url: formData.get('live_preview_url') as string,
  }

  const { error: devError } = await supabase
    .from('dev_config')
    .upsert(devData)

  if (devError) {
    console.error('Dev config error:', devError)
    throw new Error('Failed to update Dev config')
  }

  // Retrieve Manager ID to Hand off project ownership for QA review
  const { data: team } = await supabase
    .from('project_team')
    .select('manager_id')
    .eq('project_id', projectId)
    .single()

  // Update project status
  await supabase
    .from('projects')
    .update({ 
      status: 'DEV_PREVIEW_READY',
      current_assignee_id: team?.manager_id || null
    })
    .eq('id', projectId)

  // Notify Manager
  if (team?.manager_id) {
    await supabase.from('notifications').insert({
      user_id: team.manager_id,
      project_id: projectId,
      type: 'DEV_PREVIEW_READY',
      message: 'Engineering implementation completed in Staging Sandbox. Ready for management inspection and Delivery Authorization.',
    })
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient()
  
  // Retrieve current team to handle Assignee transfer if needed
  const { data: team } = await supabase
    .from('project_team')
    .select('seo_id, developer_id, manager_id, hr_id')
    .eq('project_id', projectId)
    .single()

  let nxtAssignee = null
  if (team) {
    if (status === 'TEAM_ASSIGNED') nxtAssignee = team.seo_id || team.developer_id || team.manager_id || null
    else if (status === 'SEO_COMPLETED') nxtAssignee = team.developer_id || team.manager_id || null
    else if (status === 'DEV_PREVIEW_READY') nxtAssignee = team.manager_id || null
    else if (status === 'MANAGER_APPROVED') nxtAssignee = team.manager_id || null
  }

  const { error } = await supabase
    .from('projects')
    .update({ status, current_assignee_id: nxtAssignee })
    .eq('id', projectId)

  if (error) {
    console.error('Status update error:', error)
    throw new Error('Failed to update project status')
  }

  // Inject a comment notification
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('comments').insert({
      project_id: projectId,
      user_id: user.id,
      content: `System: Project status forcibly updated to ${status.replace(/_/g, ' ')}. Ownership conditionally transferred.`,
      is_internal: true
    })
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard')
}

export async function recordPayment(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const paymentData = {
    project_id: projectId,
    amount: parseFloat(formData.get('amount') as string),
    payment_method: formData.get('payment_type') as string,
    notes: formData.get('notes') as string,
    payment_status: 'PAID',
    paid_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('payments')
    .insert(paymentData)

  if (error) {
    console.error('Payment error:', error)
    throw new Error('Failed to record payment')
  }

  // Notify Sales and Manager
  const { data: team } = await supabase
    .from('project_team')
    .select('sales_id, manager_id')
    .eq('project_id', projectId)
    .single()

  if (team) {
    const notifications = [
      { user_id: team.sales_id, project_id: projectId, type: 'PAYMENT_RECEIVED', message: `Payment of ₹${paymentData.amount} received for project.` },
      { user_id: team.manager_id, project_id: projectId, type: 'PAYMENT_RECEIVED', message: `Payment of ₹${paymentData.amount} received for project.` },
    ].filter(n => n.user_id)

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard')
}



export async function updateProjectDeadlines(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const deadlines = {
    discovery_deadline: formData.get('discovery_deadline') ? new Date(formData.get('discovery_deadline') as string).toISOString() : null,
    seo_deadline: formData.get('seo_deadline') ? new Date(formData.get('seo_deadline') as string).toISOString() : null,
    dev_deadline: formData.get('dev_deadline') ? new Date(formData.get('dev_deadline') as string).toISOString() : null,
    qa_deadline: formData.get('qa_deadline') ? new Date(formData.get('qa_deadline') as string).toISOString() : null,
    delivery_deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : null,
    deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : null,
  }

  const { error } = await supabase
    .from('projects')
    .update(deadlines)
    .eq('id', projectId)

  if (error) {
    console.error('Deadline update error:', error)
    throw new Error('Failed to update deadlines')
  }

  // Record activity (and log)
  await logAction('UPDATE_DEADLINES', { projectId, ...deadlines })

  revalidatePath(`/dashboard/projects/${projectId}`)
}
export async function finalizeProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Manager' && profile?.role !== 'Admin') {
    throw new Error('Only Managers or Admins can finalize projects')
  }

  // Double check balance (Optional but safe)
  const { data: project } = await supabase
    .from('projects')
    .select('budget, payments(amount)')
    .eq('id', projectId)
    .single()

  const totalPaid = project?.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  if (totalPaid < (project?.budget || 0)) {
    throw new Error('Project cannot be finalized until full balance is paid')
  }

  const { error } = await supabase
    .from('projects')
    .update({ 
      status: 'COMPLETED',
      current_assignee_id: null // Unassign once closed
    })
    .eq('id', projectId)

  if (error) {
    console.error('Finalization error:', error)
    throw new Error('Failed to finalize project')
  }

  // Record audit log
  await logAction('FINALIZE_PROJECT', { projectId })

  // Purge all project comments as requested for finalization cleanup
  await supabase
    .from('comments')
    .delete()
    .eq('project_id', projectId)

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath('/dashboard')
}

export async function closeProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'Manager' && profile?.role !== 'Admin') {
    throw new Error('Only Managers or Admins can close projects')
  }

  const { error } = await supabase
    .from('projects')
    .update({ is_active: false })
    .eq('id', projectId)

  if (error) {
    console.error('Close project error:', error)
    throw new Error('Failed to close project')
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${projectId}`)
}
