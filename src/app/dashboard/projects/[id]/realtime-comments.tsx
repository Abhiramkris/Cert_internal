'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Textarea } from '@/components/ui/textarea'
import { Send, MessageSquare, User, Lock, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string | null
  is_internal: boolean
}

interface RealtimeCommentsProps {
  projectId: string
  initialComments: any[]
  userId: string
  projects?: any[]
  staff?: any[]
}

export function RealtimeComments({ projectId, initialComments, userId, projects = [], staff = [] }: RealtimeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isInternal, setIsInternal] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Mentions State
  const [mentionQuery, setMentionQuery] = useState<{ type: 'project' | 'staff', query: string } | null>(null)
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`project-comments-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment])
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  useEffect(() => {
    if (mentionQuery !== null) {
      if (mentionQuery.type === 'project') {
        const filtered = projects.filter(p => p.client_name.toLowerCase().includes(mentionQuery.query))
        setFilteredItems(filtered.slice(0, 5))
      } else {
        const filtered = staff.filter(s => s.full_name?.toLowerCase().includes(mentionQuery.query))
        setFilteredItems(filtered.slice(0, 5))
      }
      setSelectedIndex(0)
    } else {
      setFilteredItems([])
    }
  }, [mentionQuery, projects, staff])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { postComment } = await import('@/app/dashboard/projects/actions')
      await postComment(projectId, userId, newComment, isInternal)
      setNewComment('')
      setMentionQuery(null)
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setNewComment(val)

    const cursor = e.target.selectionStart
    const textBefore = val.slice(0, cursor)
    const words = textBefore.split(/\s+/)
    const lastWord = words[words.length - 1]

    if (lastWord.startsWith('@')) {
      setMentionQuery({ type: 'staff', query: lastWord.slice(1).toLowerCase() })
    } else if (lastWord.startsWith('#')) {
      setMentionQuery({ type: 'project', query: lastWord.slice(1).toLowerCase() })
    } else {
      setMentionQuery(null)
    }
  }

  const insertMention = (item: any) => {
    const cursor = (document.querySelector('textarea') as HTMLTextAreaElement)?.selectionStart || newComment.length
    const textBefore = newComment.slice(0, cursor)
    const textAfter = newComment.slice(cursor)
    const words = textBefore.split(/\s+/)
    
    const prefix = mentionQuery?.type === 'staff' ? '@' : '#'
    const label = mentionQuery?.type === 'staff' ? item.full_name : item.client_name
    
    // Replace the last word
    words[words.length - 1] = `${prefix}${label.replace(/\s+/g, '')} `
    
    const newText = words.join(' ') + textAfter
    setNewComment(newText)
    setMentionQuery(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && filteredItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredItems.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        insertMention(filteredItems[selectedIndex])
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
    <Card className="bg-white border-2 border-zinc-200 text-zinc-900 rounded-none flex flex-col h-[700px] overflow-hidden shadow-none">
      <CardHeader className="bg-white border-b border-zinc-100 py-6 px-8 flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-zinc-100 bg-zinc-50 flex items-center justify-center rounded-none shadow-sm">
            <MessageSquare className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Communication Hub</span>
            <CardTitle className="text-lg font-black text-zinc-900 uppercase tracking-[0.1em] italic">Project Activity</CardTitle>
          </div>
        </div>
        <div className="flex bg-zinc-50 p-1 border border-zinc-100 rounded-none">
          <button 
            onClick={() => setIsInternal(true)}
            className={cn(
              "px-6 py-2.5 rounded-none text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
              isInternal ? "bg-zinc-950 text-white shadow-md" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            Internal
          </button>
          <button 
            onClick={() => setIsInternal(false)}
            className={cn(
              "px-6 py-2.5 rounded-none text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
              !isInternal ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            Client
          </button>
        </div>
      </CardHeader>
      
      <CardContent 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-zinc-50/30"
      >
        {comments?.length > 0 ? (
          comments.map((comment, i) => (
            <div key={i} className={cn(
               "flex gap-6 group animate-in fade-in slide-in-from-bottom-4 duration-500",
               comment.user_id === userId ? "flex-row-reverse" : ""
            )}>
               <div className={cn(
                 "w-12 h-12 border flex items-center justify-center text-[10px] font-black uppercase tracking-widest shrink-0 rounded-none transition-all group-hover:bg-zinc-950 group-hover:text-white",
                 comment.user_id ? "bg-white text-zinc-400 border-zinc-100" : "bg-blue-50 text-blue-600 border-blue-100"
               )}>
                 {comment.user_id ? (comment.user_id === userId ? 'AUTH' : 'TM') : 'CLNT'}
               </div>
               <div className={cn("space-y-3 max-w-[75%]", comment.user_id === userId ? "items-end flex flex-col" : "")}>
                 <div className={cn("flex items-center gap-4", comment.user_id === userId ? "flex-row-reverse" : "")}>
                   <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                     {comment.user_id === userId ? 'Authorizing Agent' : comment.user_id ? 'Team Proxy' : 'Client Terminal'}
                   </span>
                   <span className="text-[8px] text-zinc-300 font-black uppercase tracking-widest tabular-nums">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   {comment.is_internal ? (
                     <Badge variant="outline" className="text-[8px] h-5 border-zinc-100 text-zinc-300 font-black bg-zinc-50 rounded-none px-3 tracking-[0.2em]">INTERNAL</Badge>
                   ) : (
                     <Badge variant="outline" className="text-[8px] h-5 border-blue-100 text-blue-400 font-black bg-blue-50 rounded-none px-3 tracking-[0.2em]">EXTERNAL</Badge>
                   )}
                 </div>
                 <div className={cn(
                   "p-6 border transition-all text-[11px] font-black tracking-widest uppercase leading-relaxed rounded-none shadow-sm whitespace-pre-wrap",
                   comment.user_id === userId 
                     ? "bg-zinc-950 border-zinc-900 text-white" 
                     : "bg-white border-zinc-100 text-zinc-900"
                 )}>
                   {/* Highlight @mentions and #mentions in UI visually */}
                   {(comment.content || '').split(/((?:@|#)\w+)/g).map((chunk, chunkIdx) => {
                     if (chunk.startsWith('@')) {
                       return <span key={chunkIdx} className="text-blue-400 font-black">{chunk}</span>
                     }
                     if (chunk.startsWith('#')) {
                       return <span key={chunkIdx} className="text-emerald-400 font-black">{chunk}</span>
                     }
                     return chunk
                   })}
                 </div>
               </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 text-zinc-300">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest opacity-40">No activity logged</p>
            <p className="text-[10px] font-black mt-2 opacity-30 uppercase tracking-tight">Post a message to initiate collaboration</p>
          </div>
        )}
      </CardContent>

      <div className="p-8 bg-white border-t border-zinc-100 shrink-0 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.05)] relative">
        {/* Mentions Dropdown UI */}
        {mentionQuery !== null && (
          <div className="absolute bottom-full mb-2 left-8 w-64 bg-white border border-zinc-200 shadow-xl rounded-xl overflow-hidden z-50">
            {filteredItems.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-3 py-2 bg-zinc-50 border-b border-zinc-100 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Select {mentionQuery.type === 'staff' ? 'Staff Member' : 'Project Reference'}
                </div>
                {filteredItems.map((item, idx) => (
                  <div 
                    key={item.id} 
                    onClick={() => insertMention(item)}
                    className={cn(
                      "flex flex-col px-4 py-2 cursor-pointer transition-colors border-b border-zinc-50 last:border-none",
                      idx === selectedIndex ? "bg-zinc-100" : "hover:bg-zinc-50"
                    )}
                  >
                    <span className="text-[12px] font-bold text-zinc-900 truncate">
                      {mentionQuery.type === 'staff' ? item.full_name : item.client_name}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      {mentionQuery.type === 'staff' ? item.role : item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-xs text-zinc-500 font-medium">No results found.</div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <Textarea 
            value={newComment}
            onChange={handleInputChange}
            placeholder={isInternal ? "POST OPERATIONAL NOTE... (@ STAFF, # PROJECTS)" : "TRANSMIT MESSAGE TO CLIENT TERMINAL..."}
            className="min-h-[120px] bg-[#fafafa] border-zinc-200 rounded-none pr-16 pl-8 py-6 focus:ring-0 focus:border-zinc-950 text-[11px] font-black uppercase tracking-widest transition-all resize-none placeholder:text-zinc-200 text-zinc-900 leading-relaxed shadow-none"
            onKeyDown={handleKeyDown}
          />
          <PendingButton 
            loading={isSubmitting} 
            type="submit" 
            size="sm" 
            className="absolute bottom-6 right-6 rounded-none h-11 px-6 bg-zinc-950 border border-zinc-800 font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-xl hover:bg-black active:scale-95 transition-all"
            disabled={!newComment.trim()}
          >
            Transmit <Send className="w-3.5 h-3.5 ml-2" />
          </PendingButton>
        </form>
        <div className="flex items-center justify-between mt-6 px-1">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <p className="text-[8px] text-zinc-300 font-black uppercase tracking-[0.2em] whitespace-nowrap">
              COMMAND + ENTER to Transmit
            </p>
            <div className="h-1.5 w-1.5 bg-zinc-100 rounded-none" />
            <p className="text-[8px] text-zinc-300 font-black uppercase tracking-[0.2em] whitespace-nowrap">
              @ staff trigger
            </p>
            <div className="h-1.5 w-1.5 bg-zinc-100 rounded-none" />
            <p className="text-[8px] text-zinc-300 font-black uppercase tracking-[0.2em] whitespace-nowrap">
              # project trigger
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
