'use client'

import React from 'react'
import { Zap, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Loading() {
  const mazzardFont = '"Mazzard H Bold", "Mazzard H Bold Placeholder", sans-serif'

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Mesh Gradient Background */}


      <div className="relative flex flex-col items-center">
        {/* Animated Zap Icon Container */}
        <div className="relative w-32 h-32 mb-10 group">
    
          <div className="absolute -top-4 -right-4 animate-spin-slow">
            <div className="w-10 h-10 bg-white rounded-xl border border-zinc-100 shadow-sm flex items-center justify-center rotate-12">
               <Sparkles className="w-5 h-5 text-zinc-950 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3" style={{ fontFamily: mazzardFont }}>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic flex items-center gap-3">
             <Loader2 className="w-5 h-5 animate-spin text-[#1ada91]" />
             Syncing Mission Data
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[2px] w-12 bg-[#1ada91] animate-pulse" />
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Precision Build System v2.1</p>
            <div className="h-[2px] w-12 bg-[#1ada91] animate-pulse" />
          </div>
        </div>

        {/* Scanning Progress Beam */}
        <div className="mt-12 w-64 h-1 bg-zinc-100 rounded-full overflow-hidden relative">
           <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-[#1ada91] to-transparent animate-[scan_2s_infinite]" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
