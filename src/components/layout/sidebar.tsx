'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Briefcase,
  Settings,
  Users,
  CheckCircle2,
  CreditCard,
  PlusCircle,
  Search,
  LayoutDashboard,
  LogOut,
  Calendar,
  ShieldCheck,
  Library
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

  return (
    <div className={sidebarClasses}>
      <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
        {!isMobile && (
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shrink-0">
              {AGENCY_CONFIG.logo_url ? (
                <img src={AGENCY_CONFIG.logo_url} alt={AGENCY_CONFIG.name} className="w-6 h-6 object-contain" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              <span className="text-sm font-black tracking-tight text-zinc-900 uppercase">
                {AGENCY_CONFIG.name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {AGENCY_CONFIG.name.split(' ').slice(1).join(' ') || 'Workflow'}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-10">
          <div>
            <h3 className={cn(
              "px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5 whitespace-nowrap transition-opacity",
              !isMobile && "opacity-0 group-hover:opacity-100"
            )}>Menu</h3>
            <nav className="space-y-1.5">
              {navItems.filter(item => !['Admin Panel', 'Team Management', 'Payments', 'New Project'].includes(item.name)).map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-3 py-3 text-[13px] transition-all rounded-2xl group/item relative",
                      isActive
                        ? "bg-[#10B981] text-white font-bold shadow-xl shadow-emerald-500/20"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 font-medium",
                      !isMobile && "justify-start"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-white" : "text-zinc-400 group-hover/item:text-zinc-600")} />
                    <span className={cn(
                      "transition-opacity duration-300 whitespace-nowrap",
                      !isMobile && "opacity-0 group-hover:opacity-100"
                    )}>{item.name}</span>
                    {isActive && !isMobile && (
                      <div className="absolute left-[-24px] w-1.5 h-6 bg-[#10B981] rounded-r-full" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <h3 className={cn(
              "px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5 whitespace-nowrap transition-opacity",
              !isMobile && "opacity-0 group-hover:opacity-100"
            )}>Workflow</h3>
            <nav className="space-y-1.5">
              {navItems.filter(item => ['New Project', 'Team Management', 'Payments'].includes(item.name)).map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-3 py-3 text-[13px] transition-all rounded-2xl group/item",
                      isActive
                        ? "bg-[#10B981] text-white font-bold shadow-xl shadow-emerald-500/20"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 font-medium"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-white" : "text-zinc-400 group-hover/item:text-zinc-600")} />
                    <span className={cn(
                      "transition-opacity duration-300 whitespace-nowrap",
                      !isMobile && "opacity-0 group-hover:opacity-100"
                    )}>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {user?.role === 'Admin' && (
            <div>
              <h3 className={cn(
                "px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5 whitespace-nowrap transition-opacity",
                !isMobile && "opacity-0 group-hover:opacity-100"
              )}>General</h3>
              <nav className="space-y-1.5">
                {navItems.filter(item => item.name === 'Admin Panel').map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-3 py-3 text-[13px] transition-all rounded-2xl group/item",
                        isActive
                          ? "bg-zinc-900 text-white font-bold shadow-xl shadow-zinc-900/10"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 font-medium"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-white" : "text-zinc-400 group-hover/item:text-zinc-600")} />
                      <span className={cn(
                        "transition-opacity duration-300 whitespace-nowrap",
                        !isMobile && "opacity-0 group-hover:opacity-100"
                      )}>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 hidden md:flex flex-col gap-2 bg-white rounded-t-2xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] border-t border-zinc-100 z-10 shrink-0">
        <div className="bg-white border border-zinc-100 p-2 rounded-2xl flex items-center justify-center overflow-hidden h-14 w-full">
          <div className="flex items-center gap-3 w-full justify-center group-hover:justify-start group-hover:px-2 transition-all">
            <div className="w-9 h-9 shrink-0 rounded-[10px] bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-col min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden">
              <span className="text-[13px] font-bold text-zinc-900 block truncate tracking-tight">{user?.full_name}</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                {{ 'Admin': 'Administrator', 'Manager': 'Manager', 'SEO': 'SEO Specialist', 'Developer': 'Developer', 'Sales': 'Sales', 'HR': 'Human Resources', 'Designer': 'Designer' }[user?.role as string] || user?.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            const { signOut } = await import('@/app/login/actions')
            await signOut()
          }}
          className="flex items-center justify-center gap-3 w-full h-11 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-[13px] group-hover:justify-start group-hover:px-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-100"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden whitespace-nowrap">Log Out</span>
        </button>
      </div>
    </div>
  )
}
