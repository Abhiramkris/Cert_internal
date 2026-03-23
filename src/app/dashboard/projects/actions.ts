'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAction } from '@/utils/supabase/logger'
import { getWorkflowConfig } from '@/utils/supabase/queries'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const assigneeId = formData.get('current_assignee_id') as string | null

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
    description: formData.get('description') as string,
    status: (formData.get('status') as string) || 'NEW_LEAD',
    workflow_template_id: formData.get('workflow_template_id') as string,
    current_assignee_id: assigneeId && assigneeId.trim() !== '' ? assigneeId : user.id,
    discovery_deadline: formData.get('discovery_deadline') ? new Date(formData.get('discovery_deadline') as string).toISOString() : null,
    seo_deadline: formData.get('seo_deadline') ? new Date(formData.get('seo_deadline') as string).toISOString() : null,
    dev_deadline: formData.get('dev_deadline') ? new Date(formData.get('dev_deadline') as string).toISOString() : null,
    qa_deadline: formData.get('qa_deadline') ? new Date(formData.get('qa_deadline') as string).toISOString() : null,
    delivery_deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : null,
    deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : null,
  }

  // Extract dynamic fields (anything starting with 'dyn_')
  const dynamicFields: Record<string, any> = {}
  formData.forEach((value, key) => {
    if (key.startsWith('dyn_')) {
      dynamicFields[key.replace('dyn_', '')] = value
    }
  })

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single()

  if (projectError) {
    console.error('Project creation error:', projectError)
    throw new Error('Failed to create project')
  }

  // Create initial team entry (Sales agent who created it)
  const { error: teamError } = await supabase
    .from('project_team')
    .insert({
      project_id: project.id,
      sales_id: user.id,
    })

  if (teamError) {
    console.error('Team assignment error:', teamError)
  }

  // Save dynamic fields for the initial stage
  if (Object.keys(dynamicFields).length > 0) {
    // Find the actual initial stage for THIS template
    const { data: templateStage } = await supabase
      .from('workflow_stages')
      .select('id')
      .eq('status_key', projectData.status)
      .eq('template_id', projectData.workflow_template_id)
      .single()

    if (templateStage) {
      await supabase.from('project_stage_data').insert({
        project_id: project.id,
        stage_id: templateStage.id,
        data: dynamicFields,
        submitted_by: user.id
      })
    }
  }

  // Handle Notifications, Emails, and Chat Pings for Assignee
  if (projectData.current_assignee_id) {
    // 1. Push Notification
    await supabase.from('notifications').insert({
      user_id: projectData.current_assignee_id,
      project_id: project.id,
      type: 'PROJECT_ASSIGNED',
      message: `You were assigned to a new project: ${project.client_name} in stage ${projectData.status.replace(/_/g, ' ')}`,
    })

    // 2. Chat Injection Ping
    await supabase.from('comments').insert({
      project_id: project.id,
      user_id: user.id,
      content: `System: Project initiated and routed to stage ${projectData.status.replace(/_/g, ' ')}. Assigned to UUID ${projectData.current_assignee_id}.`,
      is_internal: true
    })

    // 3. Email Simulation Stub
    console.log(`\n[EMAIL DISPATCH STUB]\n=> To User UUID: ${projectData.current_assignee_id}\n=> Subject: Action Required - New Project Assignment!\n=> Body: You have been assigned to ${project.client_name} for the ${projectData.status} phase.\n`)
  } else {
    // Trigger generic Notifications to Managers if unassigned
    const { data: staff } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['Manager', 'HR', 'Admin'])

    if (staff) {
      const notifications = staff.map(s => ({
        user_id: s.id,
        project_id: project.id,
        type: 'NEW_PROJECT',
        message: `New unassigned lead created: ${project.client_name}`,
      }))
      
      await supabase.from('notifications').insert(notifications)
    }
  }

  // Record log
  await logAction('CREATE_PROJECT', { 
    projectId: project.id, 
    clientName: projectData.client_name,
    templateId: projectData.workflow_template_id
  })

  revalidatePath('/dashboard')
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
  const { data: project } = await supabase.from('projects').select('status').eq('id', projectId).single()

  // Update project status & hand off Assignee ownership
  const updateData: any = { current_assignee_id: nxtAssignee }
  
  if (statusOverride && statusOverride !== '') {
    updateData.status = statusOverride
  } else if (project?.status === 'NEW_LEAD') {
    updateData.status = 'TEAM_ASSIGNED'
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

  const { error: seoError } = await supabase
    .from('seo_config')
    .upsert(seoData)

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

  // Update project status
  await supabase
    .from('projects')
    .update({ 
      status: 'SEO_COMPLETED',
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
    payment_type: formData.get('payment_type') as string,
    notes: formData.get('notes') as string,
    status: 'PAID'
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

export async function submitStageData(projectId: string, stageId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Extract dynamic data
  const dynamicData: Record<string, any> = {}
  formData.forEach((value, key) => {
    if (key.startsWith('dyn_')) {
      dynamicData[key.replace('dyn_', '')] = value
    }
  })

  // 2. Save stage data
  const { error: dataError } = await supabase
    .from('project_stage_data')
    .upsert(
      {
        project_id: projectId,
        stage_id: stageId,
        data: dynamicData,
        submitted_by: user.id,
        submitted_at: new Date().toISOString()
      },
      { onConflict: 'project_id,stage_id' }
    )

  if (dataError) {
    console.error('Stage data upsert error:', dataError)
    throw new Error(`Failed to save stage data: ${dataError.message}`)
  }

  // 3. Trigger Transition
  const { data: currentStage } = await supabase
    .from('workflow_stages')
    .select('*')
    .eq('id', stageId)
    .single()

  if (currentStage && currentStage.next_status_key) {
    // Determine next assignee (Manager or specific role based on next stage)
    const { data: nextStage } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('status_key', currentStage.next_status_key)
      .eq('template_id', currentStage.template_id)
      .single()

    // Find if someone in the team already has that role
    const { data: team } = await supabase
      .from('project_team')
      .select('*')
      .eq('project_id', projectId)
      .single()

    let nextAssignee = null
    if (nextStage && team) {
      const roleToKey: Record<string, string> = {
        'SEO': 'seo_id',
        'Developer': 'developer_id',
        'Manager': 'manager_id',
        'HR': 'hr_id',
        'Sales': 'sales_id',
        'Designer': 'designer_id'
      }
      const teamKey = roleToKey[nextStage.acting_role]
      if (teamKey) {
        nextAssignee = team[teamKey as keyof typeof team]
      }
    }

    // Capture next assignee from form
    const nextAssigneeId = formData.get('next_assignee_id') as string

    // Update project status
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        status: currentStage.next_status_key,
        current_assignee_id: nextAssigneeId || team?.manager_id || user.id
      })
      .eq('id', projectId)

    if (projectError) {
      console.error('Project update error:', projectError)
      throw new Error(`Failed to advance project: ${projectError.message}`)
    }

    // Update Project Team if a specific role was assigned
    if (nextAssigneeId && nextStage) {
      const roleToKey: Record<string, string> = {
        'SEO': 'seo_id',
        'Developer': 'developer_id',
        'Manager': 'manager_id',
        'HR': 'hr_id',
        'Sales': 'sales_id',
        'Designer': 'designer_id'
      }
      const teamKey = roleToKey[nextStage.acting_role]
      if (teamKey) {
        const { error: teamError } = await supabase
          .from('project_team')
          .update({ [teamKey]: nextAssigneeId })
          .eq('project_id', projectId)
        
        if (teamError) {
          console.error('Team update error:', teamError)
          // We don't necessarily want to block the whole transition if only team update fails, 
          // but for consistency we should probably throw or at least log.
          // In this industrial standard setup, let's be strict.
          throw new Error(`Failed to update project team: ${teamError.message}`)
        }
      }
    }

    // Record log
    await logAction('SUBMIT_STAGE_DATA', {
      projectId,
      stageId,
      nextStage: nextStage?.status_key
    })

    // Notify
    if (nextAssignee) {
      await supabase.from('notifications').insert({
        user_id: nextAssignee,
        project_id: projectId,
        type: 'STAGE_ADVANCED',
        message: `Project ${projectId} advanced to ${nextStage?.display_name}. Action required.`
      })
    }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
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
      status: 'CLIENT_APPROVED',
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
