'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent-given')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent-given', 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[200]"
        >
          <div className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/50 overflow-hidden relative group">
            {/* Ambient Background Gradient */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-xl shadow-white/5">
                  <Cookie className="w-6 h-6 text-zinc-950" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Security Protocol</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Cookie Consent</h3>
                </div>
              </div>

              <p className="text-[11px] font-medium leading-relaxed text-zinc-400 uppercase tracking-widest">
                We use high-fidelity operational cookies to optimize your command experience and analyze system traffic. 
                By accepting, you authorize standard data processing protocols.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAccept}
                  className="w-full h-12 bg-white text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-white/5"
                >
                  Authorize Cookies
                  <ShieldCheck className="w-4 h-4" />
                </button>
                
                <div className="flex items-center justify-between px-2">
                  <Link 
                    href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || '/privacy'}
                    className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    Privacy Vector <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
