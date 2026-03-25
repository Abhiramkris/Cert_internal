import { getUserProfile, getProjects, getStaff } from '@/utils/supabase/queries'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, Mail, Calendar, LayoutDashboard, ArrowRight } from 'lucide-react'
import { AddProjectModal } from '@/components/projects/add-project-modal'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { TeamChatCard } from '@/components/dashboard/team-chat-card'
import { WeeklyTimeline } from '@/components/dashboard/weekly-timeline'
import { ProjectPipelineTracker } from '@/components/dashboard/project-pipeline-tracker'
import { AdminStats } from '@/components/dashboard/admin-stats'

export default async function DashboardPage() {
  const user = await getUserProfile()
  if (!user) return null

  const { data: projects } = await getProjects(user.profile.role, user.id)
  const { data: staff } = await getStaff()

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <p className="text-[12px] font-bold text-zinc-400 capitalize tracking-wide mb-1 flex items-center gap-2">
            Portal <ArrowRight className="w-3 h-3 text-zinc-300" /> Dashboard
          </p>
          <h1 className="text-[32px] font-bold tracking-tight text-zinc-900">Good morning {user.profile.full_name?.split(' ')[0]}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-2xl border-zinc-200 font-semibold px-4 py-6 text-zinc-600 h-auto text-[13px] bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:bg-zinc-50 border-none">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Add widget
          </Button>
          <Button variant="outline" className="rounded-2xl border-zinc-200 font-semibold px-4 py-6 text-zinc-600 h-auto text-[13px] bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:bg-zinc-50 border-none">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Button>
          {(user.profile.role === 'Sales' || user.profile.role === 'Admin' || user.profile.role === 'Manager') && (
            <AddProjectModal staff={staff || []} />
          )}
        </div>
      </div>

      {user.profile.role === 'Admin' && (
        <AdminStats projects={projects || []} staff={staff || []} />
      )}

      <ProjectPipelineTracker
        initialProjects={projects || []}
        staff={staff || []}
        currentUserId={user.id}
      />

      {/* Secondary Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (Span 3): Profile */}
        <div className="lg:col-span-3">
          <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-[#E6FFFA] to-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden group h-full">
            <div className="relative w-full h-[240px] rounded-[1.5rem] overflow-hidden mb-6 bg-zinc-100 shadow-inner">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.profile.full_name}`} alt="Profile" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
            </div>
            <div className="flex flex-col items-start px-2">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{user.profile.full_name}</h2>
              <p className="text-[12px] font-semibold text-zinc-500 mb-6 font-medium capitalize">
                {{ 'Admin': 'System Administrator', 'Manager': 'Project Manager', 'SEO': 'SEO Specialist', 'Developer': 'Software Engineer', 'Sales': 'Sales Executive', 'HR': 'Human Resources', 'Designer': 'Creative Designer' }[user.profile.role as string] || user.profile.role}
              </p>
            </div>
            <div className="absolute bottom-6 right-6 flex gap-2">
              <Button size="icon" className="w-10 h-10 rounded-full bg-white text-zinc-900 shadow-md hover:scale-110 transition-transform"><Phone className="w-4 h-4" /></Button>
              <Button size="icon" className="w-10 h-10 rounded-full bg-zinc-900 text-white shadow-md hover:scale-110 transition-transform"><Mail className="w-4 h-4" /></Button>
            </div>
          </Card>
        </div>

        {/* Center Column (Span 6): Collaboration & Events */}
        <div className="lg:col-span-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamChatCard staff={staff || []} currentUserId={user.id} />

            <Card className="rounded-[2.5rem] border-none bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col h-[350px]">
              <Button variant="ghost" size="icon" className="absolute top-6 right-6 w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400">
                <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Upcoming Events</p>
              <h3 className="text-2xl font-bold text-zinc-900 mb-6 tracking-tight">Timeline</h3>

              <WeeklyTimeline projects={projects || []} userRole={user.profile.role} currentUserId={user.id} />
            </Card>
          </div>
        </div>

        {/* Right Column (Span 3): Activity Feed */}
        <div className="lg:col-span-3">
          <ActivityFeed userId={user.id} />
        </div>
      </div>
    </div>
  )
}
