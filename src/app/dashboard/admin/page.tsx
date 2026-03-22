import { WorkflowManager } from '@/components/admin/workflow-manager'
import { getUserProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getUserProfile()
  
  if (!user || user.profile.role !== 'Admin') {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 font-sans mt-8">
      <div className="flex flex-col gap-2 mb-8 px-2">
        <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-zinc-400">System Architecture</h2>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Admin Control Panel</h1>
        <p className="text-zinc-500 font-medium max-w-2xl mt-2">
          Manage the project lifecycle, define dynamic workflows, and configure custom data fields for each stage of the pipeline.
        </p>
      </div>

      <WorkflowManager />
    </div>
  )
}
