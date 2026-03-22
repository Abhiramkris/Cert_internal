'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, MessageSquare, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  receiver_id: string
  is_read: boolean
}

interface RealtimeDMsProps {
  senderId: string
  receiverId: string
  initialMessages: any[]
  projects: any[]
}

export function RealtimeDMs({ senderId, receiverId, initialMessages, projects = [] }: RealtimeDMsProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Mentions State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`direct-messages-${senderId}-${receiverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          const msg = payload.new as Message
          if (
            (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === senderId)
          ) {
            setMessages((prev) => {
              if (prev.find(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [senderId, receiverId, supabase])

  // Mentions Dropdown Trigger Search
  useEffect(() => {
    if (mentionQuery !== null) {
      const filtered = projects.filter(p => p.client_name.toLowerCase().includes(mentionQuery))
      setFilteredProjects(filtered.slice(0, 5))
      setSelectedIndex(0)
    } else {
      setFilteredProjects([])
    }
  }, [mentionQuery, projects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Immediately push optimistic update visually
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
    setIsSubmitting(true)

    const { error, data } = await supabase.from('direct_messages').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: optimisticMsg.content
    }).select().single()

    if (error) {
      toast.error('Failed to send message')
      setMessages(prev => prev.filter(m => m.id !== tempId)) // rollback
    } else {
      setMessages(prev => {
        // If the realtime subscription fired first, drop the optimistic stub
        const realtimeCaughtItFirst = prev.some(m => m.id === data.id)
        if (realtimeCaughtItFirst) {
          return prev.filter(m => m.id !== tempId)
        }
        // Otherwise properly upgrade the optimistic stub
        return prev.map(m => m.id === tempId ? data as Message : m)
      })
    }
    setIsSubmitting(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setNewMessage(val)

    const cursor = e.target.selectionStart
    const textBefore = val.slice(0, cursor)
    const words = textBefore.split(' ')
    const lastWord = words[words.length - 1]

    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase())
    } else {
      setMentionQuery(null)
    }
  }

  const insertMention = (projectDesc: string) => {
    const cursor = (document.querySelector('textarea') as HTMLTextAreaElement)?.selectionStart || newMessage.length
    const textBefore = newMessage.slice(0, cursor)
    const textAfter = newMessage.slice(cursor)
    const words = textBefore.split(' ')
    
    // Replace the last word
    words[words.length - 1] = `@${projectDesc.replace(/\s+/g, '')} `
    
    const newText = words.join(' ') + textAfter
    setNewMessage(newText)
    setMentionQuery(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && filteredProjects.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredProjects.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredProjects.length) % filteredProjects.length)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        insertMention(filteredProjects[selectedIndex].client_name)
        return
      }
      if (e.key === 'Escape') {
        setMentionQuery(null)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && mentionQuery === null) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Card className="bg-white border-none text-zinc-900 rounded-[2.5rem] flex flex-col h-[600px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden font-sans">
      <CardContent 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar bg-slate-50/50"
      >
        {messages?.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.sender_id === senderId
            return (
              <div key={msg.id} className={cn(
                "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500",
                isMe ? "flex-row-reverse" : ""
              )}>
                <div className={cn("space-y-1.5 max-w-[70%]", isMe ? "items-end flex flex-col" : "")}>
                  <div className={cn("flex items-center gap-3", isMe ? "flex-row-reverse" : "")}>
                    <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={cn(
                    "p-5 rounded-2xl border transition-all text-[13px] leading-relaxed font-bold shadow-sm whitespace-pre-wrap",
                    isMe
                      ? "bg-zinc-900 border-zinc-900 text-white rounded-tr-none shadow-lg shadow-zinc-950/20" 
                      : "bg-white border-zinc-100 text-zinc-900 rounded-tl-none shadow-sm"
                  )}>
                    {msg.content.split(/(@\w+)/g).map((chunk, chunkIdx) => {
                      if (chunk.startsWith('@')) {
                        return <span key={chunkIdx} className={cn("px-1.5 py-0.5 rounded-md", isMe ? "bg-zinc-800 text-zinc-100" : "bg-emerald-100 text-emerald-700")}>{chunk}</span>
                      }
                      return chunk
                    })}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 text-zinc-300">
            <div className="w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 opacity-20 text-zinc-800" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-60 text-zinc-500">No Chat History</p>
            <p className="text-[10px] font-bold mt-2 opacity-40 uppercase tracking-tight text-zinc-400">Say hello to get this timeline started</p>
          </div>
        )}
      </CardContent>

      <div className="p-8 bg-white border-t border-zinc-50 shrink-0 relative">
        {/* Mentions Dropdown */}
        {mentionQuery !== null && (
          <div className="absolute bottom-[80%] mb-4 left-8 w-64 bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl overflow-hidden z-50">
            {filteredProjects.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Tag Project Reference
                </div>
                {filteredProjects.map((p, idx) => (
                  <div 
                    key={p.id} 
                    onClick={() => insertMention(p.client_name)}
                    className={cn(
                      "flex flex-col px-5 py-3 cursor-pointer transition-colors border-b border-zinc-50 last:border-none",
                      idx === selectedIndex ? "bg-zinc-100" : "hover:bg-zinc-50"
                    )}
                  >
                    <span className="text-[12px] font-bold text-zinc-900 tracking-tight">{p.client_name}</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{p.status.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">No matching projects.</div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <Textarea 
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message here... (Use @ to tag active projects)"
            className="min-h-[70px] bg-zinc-50 border-zinc-100 rounded-3xl pr-16 pl-6 py-5 focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981]/50 text-[13px] font-bold transition-all resize-none placeholder:text-zinc-400 text-zinc-900 shadow-inner"
            onKeyDown={handleKeyDown}
          />
          <Button 
            disabled={!newMessage.trim() || isSubmitting}
            size="icon" 
            className="absolute bottom-4 right-4 w-11 h-11 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-950/20 transition-all hover:scale-105"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}
