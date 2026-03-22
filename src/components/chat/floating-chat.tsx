'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, MessageSquare, X, Minus, Maximize2, ChevronUp, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useChat } from './chat-context'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  receiver_id: string
  is_read: boolean
}

// Single Chat Window Component
function ChatWindow({ receiverId, senderId, onClose, staff, projects }: { receiverId: string, senderId: string, onClose: () => void, staff: any[], projects: any[] }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const supabase = createClient()

  const receiver = staff.find(s => s.id === receiverId)

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }
    fetchMessages()

    const channel = supabase
      .channel(`floating-dm-${senderId}-${receiverId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const msg = payload.new as Message
          if ((msg.sender_id === senderId && msg.receiver_id === receiverId) || (msg.sender_id === receiverId && msg.receiver_id === senderId)) {
            setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [receiverId, senderId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isMinimized])

  useEffect(() => {
    if (mentionQuery !== null) {
      setFilteredProjects(projects.filter(p => p.client_name.toLowerCase().includes(mentionQuery)).slice(0, 3))
    }
  }, [mentionQuery, projects])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newMessage.trim()) return

    const tempId = crypto.randomUUID()
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: newMessage,
      created_at: new Date().toISOString(),
      is_read: false
    }
    setMessages(prev => [...prev, optimisticMsg])
    setNewMessage('')
    setMentionQuery(null)

    const { error, data } = await supabase.from('direct_messages').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: optimisticMsg.content
    }).select().single()

    if (error) {
       setMessages(prev => prev.filter(m => m.id !== tempId))
       toast.error('Failed to send')
    } else {
       setMessages(prev => prev.some(m => m.id === data.id) ? prev.filter(m => m.id !== tempId) : prev.map(m => m.id === tempId ? data : m))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setNewMessage(val)
    const cursor = e.target.selectionStart
    const words = val.slice(0, cursor).split(' ')
    const lastWord = words[words.length - 1]
    setMentionQuery(lastWord.startsWith('@') ? lastWord.slice(1).toLowerCase() : null)
  }

  return (
    <Card className={cn(
      "w-72 bg-white shadow-2xl border border-zinc-200 transition-all flex flex-col pointer-events-auto rounded-t-xl overflow-hidden",
      isMinimized ? "h-12" : "h-96"
    )}>
      {/* Header */}
      <div 
        className="px-4 py-2 bg-zinc-900 text-white flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-full bg-zinc-700 flex-shrink-0 border border-zinc-600 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${receiver?.full_name}`} className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] font-bold truncate">{receiver?.full_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }} className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400">
             {isMinimized ? <ChevronUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose() }} className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400">
             <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <CardContent 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 custom-scrollbar"
          >
            {messages.map(msg => {
              const isMe = msg.sender_id === senderId
              return (
                <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-3 py-2 rounded-2xl text-[11px] font-bold max-w-[85%] break-words shadow-sm",
                    isMe ? "bg-[#10B981] text-white rounded-tr-none" : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[8px] text-zinc-400 mt-1 uppercase font-bold tracking-tighter">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )
            })}
          </CardContent>

          <div className="p-3 bg-white border-t border-zinc-100 relative">
            {mentionQuery !== null && filteredProjects.length > 0 && (
              <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-zinc-100 shadow-xl rounded-lg overflow-hidden z-50">
                {filteredProjects.map((p, i) => (
                  <div 
                    key={p.id} 
                    className="px-3 py-2 hover:bg-zinc-50 cursor-pointer text-[10px] font-bold border-b border-zinc-50 last:border-none"
                    onClick={() => {
                        const words = newMessage.split(' ');
                        words[words.length - 1] = `@${p.client_name.replace(/\s+/g,'')} `;
                        setNewMessage(words.join(' '));
                        setMentionQuery(null);
                    }}
                  >
                    {p.client_name}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Textarea 
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Message..."
                className="min-h-[36px] max-h-[100px] h-9 bg-zinc-50 border-zinc-100 rounded-xl px-3 py-2 text-[11px] font-bold transition-all resize-none shadow-inner flex-1"
              />
              <Button size="icon" onClick={() => handleSubmit()} className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-md">
                 <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

export function FloatingChat() {
  const { openChats, closeChat, isMinimized, setIsMinimized } = useChat()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showMessagingList, setShowMessagingList] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      const { data: staffData } = await supabase.from('profiles').select('*')
      if (staffData) setStaff(staffData)
      
      const { data: projectsData } = await supabase.from('projects').select('*')
      if (projectsData) setProjects(projectsData)
    }
    loadData()
  }, [])

  if (!currentUser) return null

  return (
    <div className="fixed bottom-0 right-6 flex items-end gap-3 z-50 pointer-events-none pb-0">
      {/* Active Windows */}
      {openChats.map(receiverId => (
        <ChatWindow 
          key={receiverId} 
          receiverId={receiverId} 
          senderId={currentUser.id} 
          onClose={() => closeChat(receiverId)}
          staff={staff}
          projects={projects}
        />
      ))}

      {/* Messaging Bar (LinkedIn style) */}
      <div className={cn(
        "w-72 bg-white shadow-2xl border border-zinc-200 rounded-t-xl flex flex-col pointer-events-auto transition-all duration-300",
        isMinimized ? "h-12" : "h-[450px]"
      )}>
        <div 
          className="px-4 py-3 bg-zinc-900 border-zinc-800 text-white flex items-center justify-between cursor-pointer rounded-t-xl"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-bold tracking-tight">Messaging</span>
          </div>
          <ChevronUp className={cn("w-4 h-4 text-zinc-400 transition-transform", !isMinimized && "rotate-180")} />
        </div>

        {!isMinimized && (
          <>
            <div className="p-3 border-b border-zinc-100 bg-zinc-50/50">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                 <input 
                   placeholder="Search messages"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-[11px] font-bold focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
                 />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {staff.filter(s => s.id !== currentUser.id && (s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.role?.toLowerCase().includes(searchQuery.toLowerCase()))).map(s => (
                 <ChatListItem key={s.id} person={s} />
               ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ChatListItem({ person }: { person: any }) {
  const { openChat } = useChat()
  return (
    <div 
      onClick={() => openChat(person.id)}
      className="p-3 flex items-center gap-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50/50 group transition-colors"
    >
       <div className="w-10 h-10 rounded-full border border-zinc-100 overflow-hidden shrink-0 relative">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.full_name}`} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
       </div>
       <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-bold text-zinc-900 group-hover:text-[#10B981] transition-colors truncate">{person.full_name}</span>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{person.role}</span>
       </div>
    </div>
  )
}
