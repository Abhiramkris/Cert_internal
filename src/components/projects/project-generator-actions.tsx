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
import { StudioArchitectButton } from './studio-architect-button'

interface ProjectGeneratorActionsProps {
  project: any
  websiteConfig: any
}

export function ProjectGeneratorActions({ project, websiteConfig }: ProjectGeneratorActionsProps) {
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-4">
          <StudioArchitectButton
            project={project}
            initialConfig={websiteConfig}
            className="h-14 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] border-2"
          />

          <Button
            onClick={handleGenerateZip}
            disabled={isGenerating}
            variant="outline"
            className="h-14 px-8 rounded-2xl border-2 border-zinc-950 bg-white text-zinc-950 font-black uppercase tracking-[0.2em] hover:bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all flex items-center justify-center gap-3 text-[11px] group/eject"
          >
            <Download className="w-5 h-5 text-zinc-400 group-hover/eject:text-zinc-950 transition-colors" />
            {isGenerating ? 'Building Production...' : 'Eject Production Build'}
          </Button>
        </div>
      </div>
    </div>
  )
}
