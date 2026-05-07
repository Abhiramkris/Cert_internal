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
        {/* Logo Container */}
        <div className="relative w-40 h-40 mb-10 group">
          <div className="absolute inset-0 bg-[#B1F00B]/20 rounded-full blur-3xl animate-pulse" />
          <img 
            src="/assets/certifyied_logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain relative z-10"
            style={{ animationDuration: '3s' }}
          />
        </div>
      </div>

    
    </div>
  )
}
