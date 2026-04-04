'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Code2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WebsiteBuilderConfigurator } from './website-builder-configurator'

interface StudioArchitectButtonProps {
  project: any
  initialConfig?: any
  onOpen?: () => void
  onClose?: () => void
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function StudioArchitectButton({ 
  project,
  initialConfig,
  onOpen,
  onClose,
  className,
  size = 'default' 
}: StudioArchitectButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
          onOpen?.()
        }}
        className={cn(
          "h-14 px-8 bg-[#1ada91] text-zinc-950 border-2 border-zinc-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#15b87a] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all flex items-center justify-center gap-3 active:scale-95",
          className
        )}
        size={size}
      >
        <Code2 className="w-5 h-5 text-zinc-950" />
        Launch Studio Architect
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) onClose?.()
      }}>
        <DialogContent className="!max-w-none !w-[100vw] !h-[100vh] !fixed !inset-0 !m-0 !p-0 bg-white rounded-none overflow-hidden shadow-2xl flex flex-col border-none outline-none z-[1000] !translate-x-0 !translate-y-0 !left-0 !top-0">
          <div className="flex-1 overflow-hidden relative">
            <WebsiteBuilderConfigurator 
              projectId={project.id}
              project={project}
              initialConfig={initialConfig || project.config?.builder}
            />
            <Button
              onClick={() => {
                setIsOpen(false)
                onClose?.()
              }}
              className="fixed top-8 right-8 z-[1100] h-10 w-10 p-0 rounded-full bg-zinc-950 text-white border border-zinc-800 hover:bg-black pointer-events-auto"
              variant="ghost"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
