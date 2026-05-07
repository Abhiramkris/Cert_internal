'use client'

import { useState, useEffect } from 'react'
import { signOut } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { LogOut, Bell, Search, User, Menu, Archive, LayoutList, Table as TableIcon, Calendar, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sidebar } from './sidebar'
import { AGENCY_CONFIG } from '@/utils/agency-config'
import { useProject } from '@/context/ProjectContext'
import { WeeklyTimeline } from '@/components/dashboard/weekly-timeline'
import { NotificationsCenter } from './notifications-center'
import { useNotifications } from '@/context/NotificationContext'

interface TopBarProps {
  user: {
    id: string
    full_name: string | null
    email: string | null
    role: string | null
    avatar_url?: string | null
  }
}

export function TopBar({ user }: TopBarProps) {
  const {
    searchQuery, setSearchQuery,
    showArchived, setShowArchived,
    viewMode, setViewMode,
    projects
  } = useProject()

  const [notifsOpen, setNotifsOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { unreadCount } = useNotifications()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-16 md:h-20 border-b border-zinc-100 bg-white/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-10 shrink-0 sticky top-0 z-30 font-sans">
      <NotificationsCenter open={notifsOpen} onOpenChange={setNotifsOpen} userId={user.id} />

      <Sheet open={calendarOpen} onOpenChange={setCalendarOpen}>
        <SheetContent side="right" className="!w-full sm:!min-w-[400px] border-l border-zinc-200 p-0 overflow-hidden flex flex-col bg-white">
          <div className="p-8 border-b border-zinc-100 bg-[#F9FAFB]/50">
            <h3 className="text-xl font-semibold text-zinc-900 tracking-tight italic flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#67A708]" />
              Mission Timeline
            </h3>
            <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mt-1">Operational Schedule</p>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <WeeklyTimeline projects={projects || []} userRole={user.role ?? undefined} currentUserId={user.id} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-zinc-900 h-10 w-10 border border-zinc-200 rounded-none bg-white flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <SheetContent side="left" className="p-0 w-[280px] border-r-0 bg-[#F9FAFB]">
              <div onClick={() => setIsMobileMenuOpen(false)} className="h-full">
                <Sidebar user={user} isMobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative flex-1 max-w-lg group flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-900 transition-colors" />
            <input
              type="text"
              placeholder="Search Intelligence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f8f8] border border-zinc-200 md:border-none md:bg-[#F3F4F6]/50 rounded-none md:rounded-[1.25rem] py-2 md:py-3 pl-10 md:pl-12 pr-4 md:pr-12 text-[12px] md:text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900 placeholder:text-zinc-600 shadow-none md:shadow-sm font-medium"
            />
          </div>
 
          <div className="hidden md:flex items-center gap-2 border-l border-zinc-100 pl-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl mr-2">
              <span className="text-[10px] font-semibold text-zinc-700 uppercase tracking-widest whitespace-nowrap">
                {mounted ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={cn(
                "px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all",
                showArchived
                  ? "bg-zinc-900 text-white shadow-lg"
                  : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-100"
              )}
            >
              Archive
            </button>
            <div className="flex items-center gap-1 bg-[#F3F4F6]/50 p-1 rounded-xl border border-zinc-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900")}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900")}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="flex items-center gap-1 border-r border-zinc-100 pr-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCalendarOpen(true)}
            className="text-zinc-600 hover:text-[#67A708] hover:bg-[#F3F4F6] relative rounded-none md:rounded-2xl h-10 w-10 md:h-11 md:w-11 transition-all border border-zinc-100 md:border-none"
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifsOpen(true)}
            className="text-zinc-600 hover:text-zinc-900 hover:bg-[#F3F4F6] relative rounded-none md:rounded-2xl h-10 w-10 md:h-11 md:w-11 transition-all border border-zinc-100 md:border-none"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 md:top-3.5 md:right-3.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#67A708] rounded-none border border-white flex items-center justify-center overflow-visible">
                <span className="absolute inset-0 bg-[#67A708] animate-ping opacity-75 rounded-none" />
              </span>
            )}
          </Button>
        </div>

        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-[1.5rem] bg-[#F3F4F6]/50 border border-transparent hover:border-zinc-200 transition-all cursor-pointer outline-none group">
              <div className="flex flex-col items-end pr-1 text-right">
                <span className="text-[12px] font-semibold text-zinc-900 tracking-tight leading-none mb-0.5">{user.full_name}</span>
                <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-widest">{user.role}</span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt={user.full_name || ''} />
                <AvatarFallback className="bg-white text-zinc-900 text-[10px] font-semibold uppercase">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white border border-zinc-100 text-zinc-900 mt-3 p-2 shadow-2xl rounded-[1.5rem]" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-semibold px-3 py-4">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-[13px] font-semibold leading-none text-zinc-900">{user.full_name}</p>
                    <p className="text-[11px] leading-none text-zinc-600 font-medium">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-50 mx-2 my-1" />
              <DropdownMenuItem className="focus:bg-zinc-50 focus:text-zinc-900 cursor-pointer rounded-xl py-3 px-3 transition-colors">
                <User className="mr-3 h-4 w-4 text-zinc-600" />
                <span className="text-[13px] font-semibold">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-50 mx-2 my-1" />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-xl py-3 px-3 transition-colors font-semibold"
                onClick={() => signOut()}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-[13px]">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut()}
          className="text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded-none h-10 w-10 transition-all border border-zinc-100 md:hidden"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
