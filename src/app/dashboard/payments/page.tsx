import { getProjects, getUserProfile, getStaff } from '@/utils/supabase/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IndianRupee, History, TrendingUp, DollarSign, ArrowUpRight, Filter, Search, Calendar as CalendarIcon, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function PaymentsDashboard() {
  const user = await getUserProfile()
  const { data: projects } = await getProjects(user?.profile.role, user?.id || '')
  
  if (!user || (user.profile.role !== 'Admin' && user.profile.role !== 'Manager')) {
    return <div className="p-8 text-zinc-400">Unauthorized access. Financial records are restricted to management.</div>
  }

  const allPayments = projects?.flatMap(p => (p.payments || []).map((pay: any) => ({
    ...pay,
    project_name: p.client_name,
    project_id: p.id
  })))?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []

  const totalCollected = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalBudget = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0
  const outstanding = totalBudget - totalCollected

  const stats = [
    { label: 'Total Collections', value: totalCollected, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pipeline Value', value: totalBudget, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Outstanding', value: outstanding, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            Financial Dashboard
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Live</Badge>
          </h1>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mt-1 opacity-60">Global Payment Reconciliation & Revenue Tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="pl-11 pr-6 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none w-64 shadow-sm"
            />
          </div>
          <button className="h-12 w-12 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all shadow-sm">
            <Filter className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="rounded-[2.5rem] border-none bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all group overflow-hidden relative">
            <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110", s.bg)} />
            <div className="space-y-4 relative z-10">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", s.bg, s.color)}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{s.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">₹{s.value.toLocaleString()}</h3>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Transactions Table */}
      <Card className="rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <CardHeader className="p-8 border-b border-zinc-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-400" />
              Transaction History
            </CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Audit Log of All Settled Payments</p>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">Export CSV</button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <th className="px-8 py-6 text-left">Date</th>
                  <th className="px-8 py-6 text-left">Client / Project</th>
                  <th className="px-8 py-6 text-left">Method</th>
                  <th className="px-8 py-6 text-left">Reference</th>
                  <th className="px-8 py-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {allPayments.length > 0 ? allPayments.map((p, i) => (
                  <tr key={i} className="group hover:bg-zinc-50/30 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-zinc-900">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{new Date(p.created_at).getFullYear()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-800 text-sm group-hover:text-blue-600 transition-colors">{p.project_name}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID: {p.project_id.split('-')[0]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className="bg-zinc-50 text-zinc-600 border-none font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
                        {p.payment_type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 max-w-[200px]">
                      <span className="text-zinc-500 font-medium text-xs truncate block">{p.notes || 'Standard Project Milestone'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-lg font-black text-zinc-900 tracking-tighter">₹{p.amount.toLocaleString()}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <Wallet className="w-12 h-12 text-zinc-900" />
                        <span className="text-xs font-black uppercase tracking-widest">No financial records detected</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
