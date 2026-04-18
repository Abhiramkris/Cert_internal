import { createClient } from './server'

export async function getUserProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}

export async function getProjectsMinimal() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('id, client_name, status')
    .order('client_name')
  return { data, error }
}

export async function getProjects(role?: string, userId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('projects')
    .select('*, project_team(*), comments(*), payments(amount), workflow_templates(*, workflow_stages(*, workflow_fields(*)))')

  if (role && userId && role !== 'Admin' && role !== 'Manager') {
    query = query.eq('current_assignee_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  return { data, error }
}

export async function getProjectDetail(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_team(*), dev_config(*), comments(*), payments(*), workflow_templates(*, workflow_stages(*, workflow_fields(*)))')
    .eq('id', id)
    .single()

  if (data?.comments) {
    data.comments = data.comments.sort((a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  return { data, error }
}

export async function getStaff() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
  return { data, error }
}

export async function getWorkflowConfig(statusKey?: string, templateId?: string) {
  const supabase = await createClient()
  let query = supabase.from('workflow_stages').select('*, workflow_fields(*)')

  if (statusKey) {
    query = query.eq('status_key', statusKey)
  }

  if (templateId) {
    query = query.eq('template_id', templateId)
  }

  const { data, error } = await query.order('created_at', { ascending: true })
  return { data, error }
}

export async function getProjectStageData(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('stage_data')
    .eq('id', projectId)
    .single()
  
  // Format stage_data object into an array for compatibility with older UI components if needed
  const formatted = data?.stage_data ? Object.entries(data.stage_data).map(([id, val]: [string, any]) => ({
    stage_id: id,
    ...val
  })) : []

  return { data: formatted, error }
}

export async function getWebsiteConfig(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('config')
    .eq('id', projectId)
    .single()
  return { data: data?.config?.builder, error }
}
