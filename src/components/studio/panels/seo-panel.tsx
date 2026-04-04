'use client'

import React from 'react'
import { Globe, Search, Hash, Info } from 'lucide-react'
import { useStudio } from '../context/studio-provider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function SEOPanel() {
  const { seo, setSeo } = useStudio()

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Search Vector Title</Label>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <Input 
            value={seo.website_title}
            onChange={(e) => setSeo({...seo, website_title: e.target.value})}
            placeholder="SEO Primary Index"
            className="h-14 bg-zinc-50/30 border-zinc-100 px-6 text-[12px] font-black tracking-tight text-zinc-950 focus:bg-white focus:ring-2 focus:ring-black transition-all rounded-2xl"
            />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Crawler Abstract</Label>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <textarea 
            value={seo.meta_description}
            onChange={(e) => setSeo({...seo, meta_description: e.target.value})}
            placeholder="Detailed synopsis for search engine indexing..."
            className="min-h-[160px] w-full bg-zinc-50/30 border border-zinc-100 p-6 text-[12px] font-black tracking-tight text-zinc-950 focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none resize-none rounded-2xl leading-relaxed"
            />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Hash className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Keyword Matrix</Label>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <Input 
            value={seo.target_keywords}
            onChange={(e) => setSeo({...seo, target_keywords: e.target.value})}
            placeholder="Vector_1, Vector_2, Vector_3"
            className="h-14 bg-zinc-50/30 border-zinc-100 px-6 text-[12px] font-black tracking-tight text-zinc-950 focus:bg-white focus:ring-2 focus:ring-black transition-all rounded-2xl"
            />
        </div>
      </div>

      <div className="p-8 bg-zinc-950 rounded-[2rem] shadow-xl shadow-black/10 flex items-start gap-4">
         <Info className="w-4 h-4 text-zinc-500 mt-1" />
         <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed italic">
           SEO vectors are injected into global metadata during the eject process to optimize search positioning.
         </p>
      </div>
    </div>
  )
}
