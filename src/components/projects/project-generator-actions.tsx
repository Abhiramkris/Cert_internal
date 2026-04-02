'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { Code2, Sparkles, Zap, Download } from 'lucide-react'
import { WebsiteBuilderConfigurator } from './website-builder-configurator'
import { generateProjectZip } from '@/app/dashboard/projects/builder-actions'
import { toast } from 'sonner'

interface ProjectGeneratorActionsProps {
  project: any
  websiteConfig: any
}

export function ProjectGeneratorActions({ project, websiteConfig }: ProjectGeneratorActionsProps) {
  const [showModal, setShowModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateZip = async () => {
    setIsGenerating(true)
    try {
      const result = await generateProjectZip(project.id)
      if (result.success && result.data) {
        const byteCharacters = atob(result.data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/zip' })
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.fileName || 'Project_Build.zip'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success('Production build ejected successfully')
      } else {
        toast.error('Build generation failed')
      }
    } catch (error) {
      console.error('Eject Error:', error)
      toast.error('Failed to eject production build')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-zinc-100">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-4 mt-2">
          <Button
            onClick={() => setShowModal(true)}
            variant="outline"
            className="h-10 md:h-11 px-4 md:px-6 rounded-none border-2 border-zinc-200 bg-emerald-500 text-white font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 text-[9px] md:text-[10px]"
          >
            <Sparkles className="w-4 h-4 text-white fill-white/20" />
            Launch Studio Architect
          </Button>

          <Button
            onClick={handleGenerateZip}
            disabled={isGenerating}
            variant="outline"
            className="h-10 md:h-11 px-4 md:px-6 rounded-none border-2 border-zinc-200 bg-white text-zinc-950 font-black uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-2 text-[9px] md:text-[10px]"
          >
            <Code2 className="w-4 h-4 text-blue-500" />
            {isGenerating ? 'Generating...' : 'Eject Production Build'}
          </Button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="!max-w-none !w-[100vw] !h-[100vh] !fixed !inset-0 !m-0 !p-0 bg-white rounded-none overflow-hidden shadow-2xl flex flex-col border-none outline-none z-[1000] !translate-x-0 !translate-y-0 !left-0 !top-0">
          <div className="flex-1 overflow-hidden">
            <WebsiteBuilderConfigurator 
              projectId={project.id}
              initialConfig={websiteConfig}
              project={project}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
