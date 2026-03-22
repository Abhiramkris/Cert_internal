'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitComment(projectId: string, token: string, formData: FormData) {
  const supabase = await createClient()
  const content = formData.get('content') as string
  
  if (!content) return

  const { error } = await supabase
    .from('comments')
    .insert({
      project_id: projectId,
      content: content,
      // user_id is null for client comments
    })

  if (error) {
    console.error('Comment submission error:', error)
    throw new Error('Failed to submit comment')
  }

  // Notify team (Manager, SEO, Dev)
  const { data: team } = await supabase
    .from('project_team')
    .select('manager_id, seo_id, developer_id')
    .eq('project_id', projectId)
    .single()

  if (team) {
    const notifications = [
      { user_id: team.manager_id, project_id: projectId, type: 'NEW_COMMENT', message: 'Client posted a new comment on the review portal.' },
      { user_id: team.seo_id, project_id: projectId, type: 'NEW_COMMENT', message: 'Client posted a new comment on the review portal.' },
      { user_id: team.developer_id, project_id: projectId, type: 'NEW_COMMENT', message: 'Client posted a new comment on the review portal.' },
    ].filter(n => n.user_id)

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }
  }

  revalidatePath(`/review/${token}`)
}

export async function approveProject(projectId: string, token: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({ status: 'CLIENT_APPROVED' })
    .eq('id', projectId)

  if (error) {
    console.error('Project approval error:', error)
    throw new Error('Failed to approve project')
  }

  // Notify team
  const { data: team } = await supabase
    .from('project_team')
    .select('manager_id, sales_id')
    .eq('project_id', projectId)
    .single()

  if (team) {
    const notifications = [
      { user_id: team.manager_id, project_id: projectId, type: 'CLIENT_APPROVED', message: 'GOOD NEWS! Client has given final approval.' },
      { user_id: team.sales_id, project_id: projectId, type: 'CLIENT_APPROVED', message: 'GOOD NEWS! Client has given final approval.' },
    ].filter(n => n.user_id)

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }
  }

  revalidatePath(`/review/${token}`)
}
