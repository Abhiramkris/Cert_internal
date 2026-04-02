'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function clearAllProjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'Admin') throw new Error('Forbidden')

  // Deleting from projects will cascade to all related tables:
  // project_team, dev_config, comments, notifications, payments
  const { error } = await supabase
    .from('projects')
    .delete()
    .neq('client_name', '_INTERNAL_SYSTEM_PROTECTED_') // Broad filter to catch all real projects

  if (error) {
    console.error('Cleanup error:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/projects')
  return { success: true }
}

export async function clearWorkflowConfig() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'Admin') throw new Error('Forbidden')

  // Clear templates, which cascades to stages and fields
  const { error } = await supabase
    .from('workflow_templates')
    .delete()
    .neq('name', '_INTERNAL_SYSTEM_PROTECTED_')

  if (error) {
    console.error('Workflow cleanup error:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}
