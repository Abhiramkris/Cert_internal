'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Calendar, Loader2, Clock } from 'lucide-react'
import { updateProjectDeadlines } from '../actions'
import { toast } from 'sonner'

interface DeadlineEditorProps {
  projectId: string
  deadlines: {
    discovery_deadline: string | null
    seo_deadline: string | null
    dev_deadline: string | null
    qa_deadline: string | null
    deadline: string | null
  }
}

export function DeadlineEditor({ projectId, deadlines }: DeadlineEditorProps) {
  const [isPending, setIsPending] = useState(false)

  return (
    <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl overflow-hidden shadow-sm">
      <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4 px-6">
        <CardTitle className="flex items-center gap-2.5 text-sm font-bold text-zinc-900">
          <Clock className="w-4 h-4 text-zinc-400" />
          Timeline Management
        </CardTitle>
        <CardDescription className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Adjust Project Deadlines</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form 
          action={async (formData) => {
            setIsPending(true)
            try {
              await updateProjectDeadlines(projectId, formData)
              toast.success('Project deadlines updated')
            } catch (error) {
              toast.error('Failed to update deadlines')
            } finally {
              setIsPending(false)
            }
          }} 
          className="space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="discovery_deadline" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Discovery Deadline</Label>
              <input 
                type="date"
                id="discovery_deadline" 
                name="discovery_deadline" 
                defaultValue={deadlines.discovery_deadline ? new Date(deadlines.discovery_deadline).toISOString().split('T')[0] : ''}
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 shadow-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seo_deadline" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">SEO Deadline</Label>
              <input 
                type="date"
                id="seo_deadline" 
                name="seo_deadline" 
                defaultValue={deadlines.seo_deadline ? new Date(deadlines.seo_deadline).toISOString().split('T')[0] : ''}
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dev_deadline" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">DEV Deadline</Label>
              <input 
                type="date"
                id="dev_deadline" 
                name="dev_deadline" 
                defaultValue={deadlines.dev_deadline ? new Date(deadlines.dev_deadline).toISOString().split('T')[0] : ''}
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 shadow-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qa_deadline" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">QA Deadline</Label>
              <input 
                type="date"
                id="qa_deadline" 
                name="qa_deadline" 
                defaultValue={deadlines.qa_deadline ? new Date(deadlines.qa_deadline).toISOString().split('T')[0] : ''}
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 shadow-sm"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Final Delivery Deadline</Label>
            <input 
              type="date"
              id="deadline" 
              name="deadline" 
              defaultValue={deadlines.deadline ? new Date(deadlines.deadline).toISOString().split('T')[0] : ''}
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 shadow-sm"
            />
          </div>

          <PendingButton loading={isPending} type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-wider shadow-sm transition-all mt-4">
            Update Timelines
          </PendingButton>
        </form>
      </CardContent>
    </Card>
  )
}
