import { getUserProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { NotificationsHandler } from '@/components/layout/notifications-handler'
import { RefreshHandler } from '@/components/layout/refresh-handler'
import { ChatProvider } from '@/components/chat/chat-context'
import { FloatingChat } from '@/components/chat/floating-chat'

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
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-white text-zinc-950">
        <NotificationsHandler userId={user.profile.id} />
        <Sidebar user={user.profile} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar user={user.profile} />
          <main className="flex-1 overflow-y-auto p-8 bg-[#F3F4F6]/50">
            <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
        <FloatingChat />
        <RefreshHandler />
      </div>
    </ChatProvider>
  )
}
