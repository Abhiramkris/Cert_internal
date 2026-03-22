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
    const completedProjects = projects.filter(p => p.status === 'CLIENT_APPROVED').length
    const activeProjects = projects.filter(p => p.status !== 'CLIENT_APPROVED' && p.status !== 'LOST').length
    
    const leadGrowth = projectsLastMonth.length === 0 
      ? 100 
      : ((projectsThisMonth.length - projectsLastMonth.length) / projectsLastMonth.length) * 100

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const outstanding = totalBudget - totalRevenue
    const closedSalesCount = projects.filter(p => p.status === 'CLIENT_APPROVED').length

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
      value: `₹${stats.totalRevenue.toLocaleString()}`,
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
      value: `₹${stats.outstanding.toLocaleString()}`,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      {metrics.map((m, i) => (
        <Card key={i} className="rounded-[2.5rem] border-none bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group overflow-hidden relative">
          <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110", m.bg)} />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", m.bg, m.color)}>
              <m.icon className="w-6 h-6" />
            </div>
            {m.trend !== 'none' && (
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
                m.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {m.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.trendValue}
              </div>
            )}
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{m.title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">{m.value}</h3>
              <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-zinc-400 capitalize">{m.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
