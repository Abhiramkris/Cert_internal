import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AttendanceClient from './attendance-client'

export default async function AttendancePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
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

  const isHR = profile?.role === 'HR' || profile?.role === 'Admin' || profile?.role === 'Super Admin'
  const isManager = profile?.role === 'Manager'

  // Fetch attendance records
  let query = supabase
    .from('attendance')
    .select('*, profiles(full_name, role, email)')
    .order('date', { ascending: false })

  let targetUserId = user.id
  if ((isHR || isManager) && searchParams?.userId) {
    targetUserId = searchParams.userId as string
  }
  query = query.eq('user_id', targetUserId)

  const { data: records, error: recordsError } = await query

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Attendance</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isHR || isManager ? 'Manage team attendance and adjustments.' : 'View your attendance records and check out.'}
            </p>
          </div>
        </div>
        
        <AttendanceClient 
          initialRecords={records || []} 
          userId={user.id}
          isHR={isHR}
          isManager={isManager}
        />
      </div>
    </div>
  )
}
