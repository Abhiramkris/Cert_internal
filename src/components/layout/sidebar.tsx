'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  Settings,
  Users,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Calendar,
  ShieldCheck,
  Library,
  MessageSquare,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AGENCY_CONFIG } from '@/utils/agency-config'

interface SidebarProps {
  user: {
    full_name: string | null
    role: string | null
    email: string | null
  }
  isMobile?: boolean
}

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  'Admin': 'Administrator',
  'Manager': 'Manager',
  'SEO': 'SEO Specialist',
  'Developer': 'Developer',
  'Sales': 'Sales',
  'HR': 'Human Resources',
  'Designer': 'Designer'
}

export function Sidebar({ user, isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  ]
 
  // Role-specific navigation  
  if (user?.role === 'Manager' || user?.role === 'Admin' || user?.role === 'Developer') {
    navItems.push({ name: 'Studio Library', href: '/dashboard/library', icon: Library })
    navItems.push({ name: 'Team Management', href: '/dashboard/teams', icon: Users })
    navItems.push({ name: 'Payments', href: '/dashboard/payments', icon: CreditCard })
  }

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Admin Panel', href: '/dashboard/admin', icon: Settings })
  }

  const sidebarClasses = cn(
    "transition-all duration-300 ease-in-out h-full border-r border-zinc-100 bg-[#F9FAFB] flex flex-col font-sans group relative z-50 overflow-hidden shrink-0",
    isMobile 
      ? "w-full border-none" 
      : "w-[84px] hover:w-72 hidden md:flex"
  )

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-4 transition-all rounded-xl group/item relative mx-2",
          isActive
            ? "bg-[#67A708] text-white font-semibold shadow-lg shadow-[#67A708]/20"
            : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/50 font-semibold",
          isMobile ? "h-12 px-4 justify-start" : "h-11 justify-center group-hover:justify-start group-hover:px-4"
        )}
      >
        <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-white" : "text-zinc-600 group-hover/item:text-zinc-600")} />
        <span className={cn(
          "transition-all duration-300 whitespace-nowrap overflow-hidden text-[13px] tracking-tight",
          isMobile ? "opacity-100 w-auto" : "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto",
          isActive ? "text-white" : "text-inherit"
        )}>{item.name}</span>
        {isActive && !isMobile && (
          <div className="absolute left-[-16px] w-1 h-5 bg-[#67A708] rounded-r-full hidden group-hover:block" />
        )}
      </Link>
    )
  }

  return (
    <div className={sidebarClasses}>
      <div className={cn(
        "p-3 flex-1 overflow-y-auto no-scrollbar flex flex-col transition-all duration-300",
        isMobile ? "items-start px-4" : "items-center group-hover:items-start"
      )}>
        {!isMobile && (
          <div className="flex items-center gap-4 mb-6 w-full px-4 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-110">
              {AGENCY_CONFIG.logo_url ? (
                <img src={AGENCY_CONFIG.logo_url} alt={AGENCY_CONFIG.name} className="w-10 h-10 object-contain" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-[#67A708]" />
              )}
            </div>
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden translate-x-[-10px] group-hover:translate-x-0">
              <span className="text-[14px] font-semibold tracking-tighter text-zinc-900 uppercase leading-none mb-1">
                {AGENCY_CONFIG.name.split(' ')[0]}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6 w-full">
          <div>
            <h3 className={cn(
              "px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 mb-4 whitespace-nowrap transition-opacity",
              isMobile ? "text-left opacity-100" : "text-center group-hover:text-left opacity-0 group-hover:opacity-100"
            )}>Main Menu</h3>
            <nav className="space-y-1">
              {navItems.filter(item => !['Admin Panel', 'Team Management', 'Payments', 'Studio Library'].includes(item.name)).map(renderNavItem)}
            </nav>
          </div>

          <div>
            <h3 className={cn(
              "px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 mb-4 whitespace-nowrap transition-opacity",
              isMobile ? "text-left opacity-100" : "text-center group-hover:text-left opacity-0 group-hover:opacity-100"
            )}>Operations</h3>
            <nav className="space-y-1">
              {navItems.filter(item => ['Studio Library', 'Team Management', 'Payments'].includes(item.name)).map(renderNavItem)}
            </nav>
          </div>

          {user?.role === 'Admin' && (
            <div>
              <h3 className={cn(
                "px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 mb-4 whitespace-nowrap transition-opacity",
                isMobile ? "text-left opacity-100" : "text-center group-hover:text-left opacity-0 group-hover:opacity-100"
              )}>System</h3>
              <nav className="space-y-1">
                {navItems.filter(item => item.name === 'Admin Panel').map(renderNavItem)}
              </nav>
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        "p-4 border-t border-zinc-100 z-10 shrink-0",
        isMobile ? "bg-white flex flex-col gap-4" : "flex flex-col gap-2 bg-white/50 backdrop-blur-sm hidden md:flex"
      )}>
        {/* Quick Actions Dock */}
        <div className={cn(
          "flex items-center gap-2 mb-2 transition-all duration-300",
          isMobile ? "flex" : "opacity-0 group-hover:opacity-100 hidden group-hover:flex"
        )}>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-floating-chat'))}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-zinc-950 text-white text-[9px] font-black uppercase tracking-widest shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className={cn(isMobile ? "block" : "hidden group-hover:block")}>Support</span>
          </button>
          <button 
            onClick={() => document.getElementById('mobile-activity-timeline')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-zinc-50 text-zinc-950 border border-zinc-100 text-[9px] font-black uppercase tracking-widest shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className={cn(isMobile ? "block" : "hidden group-hover:block")}>Pulse</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 group-hover:px-2 transition-all">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-zinc-950 flex items-center justify-center text-white text-[12px] font-semibold shadow-sm border border-white/10">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className={cn(
              "flex flex-col min-w-0 transition-all duration-300 overflow-hidden",
              isMobile ? "opacity-100 w-auto" : "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto translate-x-[-10px] group-hover:translate-x-0"
            )}>
              <span className="text-[12px] font-semibold text-zinc-900 block truncate tracking-tight uppercase leading-none mb-1">{user?.full_name}</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] block leading-none">
                {ROLE_DISPLAY_NAMES[user?.role as string] || user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              const { signOut } = await import('@/app/login/actions')
              await signOut()
            }}
            className={cn(
              "flex items-center justify-center gap-3 transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer focus:outline-none",
              isMobile 
                ? "h-10 px-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-100" 
                : "w-full h-11 rounded-xl text-zinc-600 hover:text-rose-500 hover:bg-rose-50 group-hover:justify-start group-hover:px-6"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform" />
            <span className={cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              isMobile ? "opacity-100 w-auto" : "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto"
            )}>Exit</span>
          </button>
        </div>
      </div>
    </div>
  )
}
