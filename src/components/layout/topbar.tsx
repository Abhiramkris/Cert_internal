'use client'

import { signOut } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { LogOut, Bell, Search, User } from 'lucide-react'
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

interface TopBarProps {
  user: {
    full_name: string | null
    email: string | null
    role: string | null
    avatar_url?: string | null
  }
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="h-20 border-b border-zinc-100 bg-white/50 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 sticky top-0 z-30 font-sans">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative max-w-lg w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <input
            type="text"
            placeholder="Search projects or commands..."
            className="w-full bg-[#F3F4F6]/50 border-none rounded-[1.25rem] py-3 pl-12 pr-12 text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900 placeholder:text-zinc-400 shadow-sm font-medium"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-zinc-100 shadow-sm pointer-events-none">
            <span className="text-[10px] font-bold text-zinc-400">⌘</span>
            <span className="text-[10px] font-bold text-zinc-400">K</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900 hover:bg-[#F3F4F6] relative rounded-2xl h-11 w-11 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900 hover:bg-[#F3F4F6] relative rounded-2xl h-11 w-11 transition-all">
            <User className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="h-6 w-px bg-zinc-100 mx-2" />
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-[1.5rem] bg-[#F3F4F6]/50 border border-transparent hover:border-zinc-200 transition-all cursor-pointer outline-none group">
            <div className="flex flex-col items-end pr-1">
              <span className="text-[12px] font-bold text-zinc-900 tracking-tight leading-none mb-0.5">{user.full_name}</span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{user.role}</span>
            </div>
            <Avatar className="h-9 w-9 border-2 border-white shadow-md group-hover:scale-105 transition-transform">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt={user.full_name || ''} />
              <AvatarFallback className="bg-white text-zinc-900 text-[10px] font-bold uppercase">
                {user?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-white border border-zinc-100 text-zinc-900 mt-3 p-2 shadow-2xl rounded-[1.5rem]" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-3 py-4">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-[13px] font-bold leading-none text-zinc-900">{user.full_name}</p>
                  <p className="text-[11px] leading-none text-zinc-400 font-medium">{user.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-50 mx-2 my-1" />
            <DropdownMenuItem className="focus:bg-zinc-50 focus:text-zinc-900 cursor-pointer rounded-xl py-3 px-3 transition-colors">
              <User className="mr-3 h-4 w-4 text-zinc-400" />
              <span className="text-[13px] font-bold">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-50 mx-2 my-1" />
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-xl py-3 px-3 transition-colors font-bold"
              onClick={() => signOut()}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="text-[13px]">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
