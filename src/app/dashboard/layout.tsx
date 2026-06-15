import { getUserProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { RefreshHandler } from '@/components/layout/refresh-handler'
import { ProjectProvider } from '@/context/ProjectContext'
import { MobileFloatingControls } from '@/components/dashboard/mobile-floating-controls'
import { NotificationProvider } from '@/context/NotificationContext'
import { AttendancePopup } from '@/components/dashboard/attendance-popup'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserProfile()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <NotificationProvider userId={user.profile.id}>
      <ProjectProvider>
        <div className="flex h-screen overflow-hidden bg-white text-zinc-950">
          <Sidebar user={user.profile} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar user={user.profile} />
            <main className="flex-1 overflow-y-auto p-0 md:p-4 bg-[#F3F4F6]/50">
              <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </main>
          </div>
          <RefreshHandler />
          <AttendancePopup userId={user.profile.id} userRole={user.profile.role as string} />
        </div>
      </ProjectProvider>
    </NotificationProvider>
  )
}
