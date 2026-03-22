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
    const { error } = await supabase.from('comments').insert({
      project_id: projectId,
      user_id: userId,
      content: newComment,
      is_internal: isInternal
    })

    if (error) {
      toast.error('Failed to post comment')
    } else {
      setNewComment('')
      setMentionQuery(null)
    }
    setIsSubmitting(false)
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
    <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl flex flex-col h-[700px] overflow-hidden shadow-sm">
      <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-xs font-bold text-zinc-900 flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          Project Activity
        </CardTitle>
        <div className="flex bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 shadow-inner">
          <button 
            onClick={() => setIsInternal(true)}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              isInternal ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Lock className="w-3 h-3" />
            Internal
          </button>
          <button 
            onClick={() => setIsInternal(false)}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              !isInternal ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Globe className="w-3 h-3" />
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
              "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500",
              comment.user_id === userId ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm border border-zinc-200 transition-transform group-hover:scale-105",
                comment.user_id ? "bg-white text-zinc-500" : "bg-blue-50 text-blue-600"
              )}>
                {comment.user_id ? (comment.user_id === userId ? 'YOU' : 'TEAM') : 'CLNT'}
              </div>
              <div className={cn("space-y-2 max-w-[80%]", comment.user_id === userId ? "items-end flex flex-col" : "")}>
                <div className={cn("flex items-center gap-3", comment.user_id === userId ? "flex-row-reverse" : "")}>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {comment.user_id === userId ? 'You' : comment.user_id ? 'Team Member' : 'Client Representative'}
                  </span>
                  <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-tighter">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {comment.is_internal ? (
                    <Badge variant="outline" className="text-[8px] h-4 border-zinc-200 text-zinc-400 font-bold bg-white rounded-lg px-2 tracking-widest">INTERNAL</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[8px] h-4 border-blue-500/20 text-blue-500 font-bold bg-blue-50 rounded-lg px-2 tracking-widest">CLIENT VISIBLE</Badge>
                  )}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl border transition-all text-xs leading-relaxed font-bold shadow-sm whitespace-pre-wrap",
                  comment.user_id === userId 
                    ? "bg-zinc-900 border-zinc-800 text-white rounded-tr-none" 
                    : "bg-white border-zinc-200 text-zinc-900 rounded-tl-none"
                )}>
                  {/* Highlight @mentions and #mentions in UI visually */}
                  {(comment.content || '').split(/((?:@|#)\w+)/g).map((chunk, chunkIdx) => {
                    if (chunk.startsWith('@')) {
                      return <span key={chunkIdx} className="text-blue-400 bg-blue-900/10 px-1 py-0.5 rounded-md border border-blue-500/20">{chunk}</span>
                    }
                    if (chunk.startsWith('#')) {
                      return <span key={chunkIdx} className="text-emerald-400 bg-emerald-900/10 px-1 py-0.5 rounded-md border border-emerald-500/20">{chunk}</span>
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
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No activity logged</p>
            <p className="text-[10px] font-bold mt-2 opacity-30 uppercase tracking-tight">Post a message to initiate collaboration</p>
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
            placeholder={isInternal ? "Post a private team note... (Type @ for staff, # for projects)" : "Send a secure message to the client..."}
            className={cn(
              "min-h-[110px] bg-zinc-50 border-zinc-200 rounded-2xl pr-16 pl-6 py-5 focus:ring-4 focus:ring-zinc-950/5 text-xs font-bold transition-all resize-none shadow-inner placeholder:text-zinc-300 text-zinc-900",
              isInternal ? "focus:border-zinc-300" : "focus:border-zinc-400"
            )}
            onKeyDown={handleKeyDown}
          />
          <PendingButton 
            loading={isSubmitting} 
            type="submit" 
            size="sm" 
            className="absolute bottom-5 right-5 rounded-xl h-9 px-4 bg-zinc-900 border-none font-bold text-[10px] uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
            disabled={!newComment.trim()}
          >
            Post Comment
          </PendingButton>
        </form>
        <div className="flex items-center justify-between mt-5 px-1">
          <div className="flex items-center gap-4">
            <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">
              ENTER to send / select
            </p>
            <div className="h-1 w-1 rounded-full bg-zinc-200" />
            <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">
              SHIFT + ENTER for new line
            </p>
            <div className="h-1 w-1 rounded-full bg-zinc-200" />
            <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">
              @ to mention staff
            </p>
            <div className="h-1 w-1 rounded-full bg-zinc-200" />
            <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">
              # to mention project
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
