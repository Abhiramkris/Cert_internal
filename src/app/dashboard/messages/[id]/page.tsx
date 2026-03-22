import { getUserProfile, getProjects } from '@/utils/supabase/queries'
import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { RealtimeDMs } from './realtime-dms'

export default async function DirectMessagesPage({ params }: { params: { id: string } }) {
  const { id: receiverId } = await params
  const user = await getUserProfile()
  if (!user) return <div className="p-8 text-zinc-400">Not authenticated</div>

  const supabase = await createClient()
  
  // Fetch target user 
  const { data: receiverProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', receiverId)
    .single()

  if (!receiverProfile) {
    return <div className="p-8 text-zinc-400">Target user not found</div>
  }

  // Fetch initial messages between these two users
  const { data: initialMessages } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  // Fetch active projects for @ mentions
  const { data: allProjects } = await getProjects(user.profile.role, user.id)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans">
      {/* Header */}
      <div className="flex items-center gap-6 border-b border-zinc-200 pb-8">
        <Link 
          href="/dashboard"
          className="flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl h-12 w-12 transition-all border border-zinc-100 shadow-sm shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-200 shadow-sm shrink-0">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${receiverProfile.full_name}`} alt={receiverProfile.full_name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              {receiverProfile.full_name}
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200">
                {receiverProfile.role}
              </span>
            </h1>
            <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Secure Internal Chat
            </p>
          </div>
        </div>
      </div>

      <RealtimeDMs 
        senderId={user.id}
        receiverId={receiverId}
        initialMessages={initialMessages || []}
        projects={allProjects || []}
      />
    </div>
  )
}
