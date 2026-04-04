'use client'

import React from 'react'
import { Type, Mail, FileText, Info } from 'lucide-react'
import { useStudio } from '../context/studio-provider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ContentPanel() {
  const { contentOverrides, setContentOverrides } = useStudio()

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Type className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Primary Headline</Label>
        </div>
        <div className="relative bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <Input 
            value={contentOverrides.h1 || ''}
            onChange={(e) => setContentOverrides({...contentOverrides, h1: e.target.value})}
            placeholder="Core Mission Vector"
            className="h-14 bg-zinc-50/30 border-zinc-100 px-6 text-[12px] font-black tracking-tight text-zinc-950 focus:bg-white focus:ring-2 focus:ring-black transition-all rounded-2xl"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Contact Gateway</Label>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <Input 
            value={contentOverrides.email || ''}
            onChange={(e) => setContentOverrides({...contentOverrides, email: e.target.value})}
            placeholder="protocol@agency.io"
            className="h-14 bg-zinc-50/30 border-zinc-100 px-6 text-[12px] font-black tracking-tight text-zinc-950 focus:bg-white focus:ring-2 focus:ring-black transition-all rounded-2xl"
            />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Technical Synopsis</Label>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <textarea 
            value={contentOverrides.description || ''}
            onChange={(e) => setContentOverrides({...contentOverrides, description: e.target.value})}
            placeholder="Describe the functional architecture..."
            className="min-h-[160px] w-full bg-zinc-50/30 border border-zinc-100 p-6 text-[12px] font-black tracking-tight text-zinc-950 focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none resize-none rounded-2xl leading-relaxed"
            />
        </div>
      </div>

      <div className="p-8 bg-zinc-950 rounded-[2rem] shadow-xl shadow-black/10 flex items-start gap-4">
         <Info className="w-4 h-4 text-zinc-500 mt-1" />
         <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed italic">
           Content overrides are injected globally across all production modules to ensure architectural continuity.
         </p>
      </div>
    </div>
  )
}
