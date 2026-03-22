import { getUserProfile, getProjects } from '@/utils/supabase/queries'
import { CalendarView } from '@/components/calendar/calendar-view'
import { ArrowRight } from 'lucide-react'

export default async function CalendarPage() {
  const user = await getUserProfile()
  if (!user) return null

  const { data: projects } = await getProjects(user.profile.role, user.id)

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 font-sans">
      <div className="flex flex-col mb-8">
        <p className="text-[12px] font-bold text-zinc-400 capitalize tracking-wide mb-1 flex items-center gap-2">
          Portal <ArrowRight className="w-3 h-3 text-zinc-300" /> Dashboard <ArrowRight className="w-3 h-3 text-zinc-300" /> Calendar
        </p>
        <h1 className="text-[32px] font-bold tracking-tight text-zinc-900">Project Deadlines</h1>
      </div>
      
      <CalendarView projects={projects || []} />
    </div>
  )
}
