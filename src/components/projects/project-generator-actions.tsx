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
import { Code2, Sparkles, Zap, Download, ExternalLink } from 'lucide-react'
import { WebsiteBuilderConfigurator } from './website-builder-configurator'
import { generateProjectZip, previewProject, syncProductionBuild } from '@/app/dashboard/projects/builder-actions'
import { toast } from 'sonner'
import { StudioArchitectButton } from './studio-architect-button'
import { Github, Globe, RefreshCcw } from 'lucide-react'

interface ProjectGeneratorActionsProps {
  project: any
  websiteConfig: any
}

export function ProjectGeneratorActions({ project, websiteConfig }: ProjectGeneratorActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

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

  const handlePreviewNode = async () => {
    setIsPreviewing(true)
    const toastId = toast.loading('Initializing Preview Node...')
    try {
      const result = await previewProject(project.id)
      if (result.success && result.url) {
        toast.success(result.message || 'System Operational', { id: toastId })
        // Construct the URL dynamically based on where the browser is standing
        const previewUrl = new URL(result.url)
        const finalUrl = `http://${window.location.hostname}:${previewUrl.port}`
        window.open(finalUrl, '_blank')
      } else {
        toast.error('Preview node failed to initialize', { id: toastId })
      }
    } catch (error: any) {
      console.error('Preview Error:', error)
      toast.error('Preview Node offline: ' + error.message, { id: toastId })
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleSyncGithub = async () => {
    setIsSyncing(true)
    const toastId = toast.loading('Synchronizing Production Build...')
    try {
      const result = await syncProductionBuild(project.id)
      if (result.success && result.url) {
        toast.success(result.message || 'Production Build Deployed', { id: toastId })
        window.open(result.url, '_blank')
      } else {
        toast.error('Sync failed', { id: toastId })
      }
    } catch (error: any) {
      console.error('Sync Error:', error)
      toast.error('Sync Failed: ' + error.message, { id: toastId })
    } finally {
      setIsSyncing(false)
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleGenerateZip}
              disabled={isGenerating || isPreviewing}
              variant="outline"
              className="h-14 px-8 rounded-2xl border-2 border-zinc-950 bg-white text-zinc-950 font-black uppercase tracking-[0.2em] hover:bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all flex items-center justify-center gap-3 text-[11px] group/eject"
            >
              <Download className="w-5 h-5 text-zinc-400 group-hover/eject:text-zinc-950 transition-colors" />
              {isGenerating ? 'Building...' : 'Eject ZIP'}
            </Button>

            <Button
              onClick={handlePreviewNode}
              disabled={isPreviewing || isGenerating || isSyncing}
              className="h-14 px-8 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-[0.2em] hover:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(39,39,42,0.2)] transition-all flex items-center justify-center gap-3 text-[11px] group/preview"
            >
              <div className={isPreviewing ? "animate-spin" : ""}>
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              {isPreviewing ? 'Launching...' : 'Preview Node'}
            </Button>
          </div>

          <div className="pt-2">
            {project.dev_config?.[0]?.repo_link ? (
              <div className="space-y-4">
                {(() => {
                  const devConfig = project.dev_config[0]
                  return (
                    <>
                {devConfig.sync_status === 'BUILDING' && (
                  <div className="flex flex-col items-center gap-3 py-4 border-2 border-emerald-100 bg-emerald-50/30 rounded-2xl animate-pulse">
                    <RefreshCcw className="w-6 h-6 text-emerald-500 animate-spin" />
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Building Production Bundle...</p>
                  </div>
                ) || (
                  <Button
                    onClick={handleSyncGithub}
                    disabled={isSyncing || isPreviewing || isGenerating}
                    className="w-full h-14 rounded-2xl bg-white border-2 border-emerald-500 text-emerald-600 font-black uppercase tracking-[0.2em] hover:bg-emerald-50 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)] transition-all flex items-center justify-center gap-3 text-[11px] group/sync"
                  >
                    <div className={isSyncing ? "animate-spin" : ""}>
                      <RefreshCcw className="w-5 h-5" />
                    </div>
                    {isSyncing ? 'Sync GitHub Production' : 'Sync GitHub Production'}
                  </Button>
                )}
                
                {devConfig.sync_status === 'FAILED' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight mb-1">Last Build Failed</p>
                    <p className="text-[10px] text-rose-500 font-medium leading-tight">{devConfig.sync_error || 'Unknown error during sync'}</p>
                  </div>
                )}
                
                {devConfig.live_preview_url && (
                  <a 
                    href={devConfig.live_preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Globe className="w-3.h-3" />
                    Live: {devConfig.live_preview_url.replace('http://', '').replace(/\/$/, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) || !devConfig.sync_status || devConfig.sync_status === 'IDLE' && (
                  <p className="text-[10px] text-zinc-400 font-bold text-center uppercase tracking-widest">
                    Subdomain pending first sync
                  </p>
                )}
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 flex flex-col items-center gap-2">
                <Github className="w-6 h-6 text-zinc-300" />
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 text-center">
                  Link GitHub Repo in Developer Config to enable Production Sync
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
