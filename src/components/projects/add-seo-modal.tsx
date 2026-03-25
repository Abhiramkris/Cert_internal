'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PendingButton } from '@/components/ui/pending-button'
import { Search, Globe, Share2, Settings2, BarChart3 } from 'lucide-react'
import { updateSEOConfig } from '@/app/dashboard/projects/actions'
import { toast } from 'sonner'

interface AddSeoModalProps {
  projectId: string
  existingConfig?: any
  trigger?: React.ReactNode
}

export function AddSeoModal({ projectId, existingConfig, trigger }: AddSeoModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(trigger as React.ReactElement) || (
          <Button variant="outline" className="rounded-xl border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-500" />
            SEO Strategy
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-zinc-50/50 border-b border-zinc-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-zinc-900 tracking-tight">SEO Configuration & Strategy</DialogTitle>
              <DialogDescription className="text-xs font-medium text-zinc-500">Configure search engine visibility and social metadata.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form 
          action={async (formData) => {
            setIsPending(true)
            try {
              await updateSEOConfig(projectId, formData)
              toast.success('SEO Strategy updated successfully!')
              setOpen(false)
            } catch (error: any) {
              toast.error(error.message || 'Failed to update SEO')
            } finally {
              setIsPending(false)
            }
          }}
          className="p-8 space-y-8"
        >
          {/* Core SEO */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Search Presence</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website_title" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Website Title (Browser Tab)</Label>
                <Input 
                  id="website_title" 
                  name="website_title" 
                  defaultValue={existingConfig?.website_title}
                  placeholder="The Ultimate Platform for..." 
                  className="h-12 rounded-2xl bg-zinc-50 border-zinc-200 font-bold text-sm focus:ring-4 focus:ring-purple-500/5 transition-all outline-none" 
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="meta_description" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Meta Description</Label>
                <Textarea 
                  id="meta_description" 
                  name="meta_description" 
                  defaultValue={existingConfig?.meta_description}
                  placeholder="Describe the value proposition for search results..." 
                  className="min-h-[100px] rounded-2xl bg-zinc-50 border-zinc-200 font-medium text-sm p-4 focus:ring-4 focus:ring-purple-500/5 transition-all outline-none" 
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="target_keywords" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Focus Keywords (Comma Separated)</Label>
                <Input 
                  id="target_keywords" 
                  name="target_keywords" 
                  defaultValue={existingConfig?.target_keywords}
                  placeholder="software development, ai agency, branding, seo" 
                  className="h-12 rounded-2xl bg-zinc-50 border-zinc-200 font-medium text-sm focus:ring-4 focus:ring-purple-500/5 transition-all outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pt-4 border-t border-zinc-50">
              <Share2 className="w-4 h-4 text-zinc-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Social & Indexing</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Instagram URL</Label>
                <Input id="instagram" name="instagram" defaultValue={existingConfig?.instagram} placeholder="instagram.com/user" className="h-10 rounded-xl bg-zinc-50 border-zinc-200 text-xs font-medium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">LinkedIn URL</Label>
                <Input id="linkedin" name="linkedin" defaultValue={existingConfig?.linkedin} placeholder="linkedin.com/company/user" className="h-10 rounded-xl bg-zinc-50 border-zinc-200 text-xs font-medium" />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100">
              <div className="flex items-center space-x-2">
                <Checkbox id="sitemap_required" name="sitemap_required" defaultChecked={existingConfig?.sitemap_required} className="rounded-lg border-zinc-200 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                <Label htmlFor="sitemap_required" className="text-[11px] font-bold text-zinc-600 uppercase tracking-tight">Auto-generate XML Sitemap?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="schema_required" name="schema_required" defaultChecked={existingConfig?.schema_required} className="rounded-lg border-zinc-200 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                <Label htmlFor="schema_required" className="text-[11px] font-bold text-zinc-600 uppercase tracking-tight">Inject JSON-LD Schema?</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold text-zinc-500 h-12 px-6">
              Discard Changes
            </Button>
            <PendingButton 
              loading={isPending} 
              type="submit" 
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-black text-[11px] uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-zinc-900/10 transition-all flex items-center gap-2"
            >
              Commit SEO Strategy
            </PendingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
