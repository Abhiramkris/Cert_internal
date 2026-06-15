import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TeamManagementClient from './team-management-client'

export default async function TeamsPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const isEditable = profile?.role === 'Admin' || profile?.role === 'Super Admin' || profile?.role === 'HR'

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <TeamManagementClient 
          profiles={profiles || []} 
          isEditable={isEditable} 
          currentUserRole={profile?.role} 
        />
      </div>
    </div>
  )
}
