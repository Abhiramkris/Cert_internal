'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { WebsiteBuilderConfigurator } from './website-builder-configurator'

interface WebsiteBuilderModalProps {
  projectId: string
  initialConfig?: any
  trigger?: React.ReactNode
}

export function WebsiteBuilderModal({ projectId, initialConfig, trigger }: WebsiteBuilderModalProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={(trigger as React.ReactElement) || (
          <Button
            variant="outline"
            className="rounded-2xl px-6 h-12 font-black border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center gap-2 transition-all shadow-sm group"
          >
            <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
            Launch Site Architect
          </Button>
        )}
      />
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] w-full h-[90vh] p-0 overflow-hidden border-none rounded-[3rem] bg-white shadow-2xl ring-0">
        <WebsiteBuilderConfigurator 
          projectId={projectId} 
          initialConfig={initialConfig} 
        />
      </DialogContent>
    </Dialog>
  )
}
