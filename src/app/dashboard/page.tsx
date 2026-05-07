import { getUserProfile, getProjects, getStaff } from '@/utils/supabase/queries'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight } from 'lucide-react'
import { AddProjectModal } from '@/components/projects/add-project-modal'
import { MobileActivityTimeline } from '@/components/dashboard/mobile-activity-timeline'
import { ProjectPipelineTracker } from '@/components/dashboard/project-pipeline-tracker'
import Link from 'next/link'
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting'

export default async function DashboardPage() {
  const user = await getUserProfile()
  if (!user) return null

  const { data: projects } = await getProjects(user.profile.role, user.id)
  const { data: staff } = await getStaff()

  const manualGreetings = [
    { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
    { morning: "Buenos días", afternoon: "Buenas tardes", evening: "Buenas noches" },
    { morning: "Bonjour", afternoon: "Bon après-midi", evening: "Bonsoir" },
    { morning: "Guten Morgen", afternoon: "Guten Tag", evening: "Guten Abend" },
    { morning: "സുപ്രഭാതം", afternoon: "ശുഭദിനം", evening: "ശുഭസായാഹ്നം" },
    { morning: "おはよう", afternoon: "こんにちは", evening: "こんばんは" },
    { morning: "नमस्ते", afternoon: "नमस्ते", evening: "शुभ संध्या" }
  ]

  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const initialGreeting = manualGreetings[Math.floor(Math.random() * manualGreetings.length)][timeOfDay]
  const userName = user.profile.full_name?.split(' ')[0] || ''

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 px-2 md:px-6 pt-2 md:pt-0 pb-10 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <p className="text-[10px] md:text-[12px] font-semibold text-zinc-600 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            Portal <ArrowRight className="w-3 h-3 text-zinc-600" /> Dashboard
          </p>
          <DashboardGreeting initialGreeting={initialGreeting} userName={userName} />
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {(user.profile.role === 'Sales' || user.profile.role === 'Admin' || user.profile.role === 'Manager') && (
            <AddProjectModal staff={staff || []} />
          )}
        </div>
      </div>




      <ProjectPipelineTracker
        initialProjects={projects || []}
        staff={staff || []}
        currentUserId={user.id}
        currentUserRole={user.profile.role}
      />

      {/* Mobile Activity Timeline */}
      {/* <MobileActivityTimeline userId={user.id} /> */}
    </div>
  )
}
