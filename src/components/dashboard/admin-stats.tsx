'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Briefcase, IndianRupee, Target, ArrowUpRight, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminStatsProps {
  projects: any[]
  staff: any[]
}

export function AdminStats({ projects, staff }: AdminStatsProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

    const projectsThisMonth = projects.filter(p => {
      const d = new Date(p.created_at)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })

    const projectsLastMonth = projects.filter(p => {
      const d = new Date(p.created_at)
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
    })

    const totalRevenue = projects.reduce((sum, p) => {
      const projectPayments = p.payments?.reduce((pSum: number, pay: any) => pSum + (pay.amount || 0), 0) || 0
      return sum + projectPayments
    }, 0)
    const isFinalStatus = (status: string) => ['COMPLETED', 'CLIENT_APPROVED', 'SUCCESS'].includes(status?.toUpperCase())
    const completedProjects = projects.filter(p => isFinalStatus(p.status)).length
    const activeProjects = projects.filter(p => !isFinalStatus(p.status) && p.status !== 'LOST').length
    
    const leadGrowth = projectsLastMonth.length === 0 
      ? 100 
      : ((projectsThisMonth.length - projectsLastMonth.length) / projectsLastMonth.length) * 100

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const outstanding = totalBudget - totalRevenue
    const closedSalesCount = completedProjects

    return {
      totalRevenue,
      totalBudget,
      outstanding,
      closedSalesCount,
      thisMonthCount: projectsThisMonth.length,
      leadGrowth,
      completedProjects,
      activeProjects,
      totalCount: projects.length,
      staffCount: staff.length
    }
  }, [projects, staff])

  const metrics = [
    {
      title: 'Total Collected',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Settled Revenue',
      icon: IndianRupee,
      trend: stats.leadGrowth > 0 ? 'up' : 'down',
      trendValue: `${Math.abs(Math.round(stats.leadGrowth))}%`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Closed Sales',
      value: stats.closedSalesCount.toString(),
      description: 'Final Approval',
      icon: Target,
      trend: 'none',
      trendValue: '',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Outstanding',
      value: `₹${stats.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Pending Collection',
      icon: TrendingUp,
      trend: 'none',
      trendValue: '',
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      title: 'Pipeline Leads',
      value: stats.totalCount.toString(),
      description: 'Total Entries',
      icon: BarChart3,
      trend: stats.leadGrowth > 0 ? 'up' : 'down',
      trendValue: `${Math.abs(Math.round(stats.leadGrowth))}%`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
      {metrics.map((m, i) => (
        <Card key={i} className="rounded-none border border-zinc-200 bg-white p-3 md:p-5 hover:bg-zinc-50 transition-all group overflow-hidden relative shadow-none">
          <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
            <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-none border border-zinc-200 flex items-center justify-center", m.bg, m.color)}>
              <m.icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            {m.trend !== 'none' && (
              <div className={cn(
                "hidden sm:flex items-center gap-1 text-[8px] md:text-[9px] font-black px-2 py-1 rounded-none border border-zinc-200",
                m.trend === 'up' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
              )}>
                {m.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.trendValue}
              </div>
            )}
          </div>

          <div className="space-y-0.5 md:space-y-1 relative z-10">
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 truncate">{m.title}</p>
            <div className="flex items-baseline gap-1 md:gap-2">
              <h3 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tighter leading-none">{m.value}</h3>
              <ArrowUpRight className="hidden sm:block w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
            </div>
            <p className="text-[8px] md:text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none mt-1 truncate">{m.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
