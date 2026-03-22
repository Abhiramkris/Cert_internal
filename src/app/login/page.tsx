import { login } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AGENCY_CONFIG } from '@/utils/agency-config'
import { ShieldCheck, UserCircle2, KeyRound, ArrowRight } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-[400px] px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Branding */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 shadow-2xl mb-6 group hover:scale-110 transition-transform duration-500">
            {AGENCY_CONFIG.logo_url ? (
              <img src={AGENCY_CONFIG.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase">
            {AGENCY_CONFIG.name.split(' ')[0]} <span className="text-zinc-500">{AGENCY_CONFIG.name.split(' ').slice(1).join(' ') || 'Workflow'}</span>
          </h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Internal Portal Access</p>
        </div>

        {/* Login Card */}
        <Card className="rounded-[2.5rem] border-none bg-zinc-900/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-zinc-500" /> Authorized Sign-in
            </CardTitle>
            <CardDescription className="text-zinc-500 text-[12px] font-medium">
              Enter credentials to access the agency dashboard
            </CardDescription>
          </CardHeader>
          
          <form action={login}>
            <CardContent className="p-8 pt-4 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email ID</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="official@agency.com"
                    required
                    className="h-14 bg-zinc-900/50 border-zinc-800 focus:border-white/20 text-white font-bold rounded-2xl pl-12 transition-all outline-none ring-0 focus:ring-0"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">@</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-14 bg-zinc-900/50 border-zinc-800 focus:border-white/20 text-white font-bold rounded-2xl pl-12 transition-all outline-none ring-0 focus:ring-0"
                  />
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              {message && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold rounded-2xl animate-in zoom-in-95 leading-relaxed">
                  {message}
                </div>
              )}
            </CardContent>

            <CardFooter className="p-8 pt-0">
              <Button type="submit" className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5 flex items-center justify-center gap-2 uppercase tracking-tight">
                Log into Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Section */}
        <div className="mt-8 space-y-4">
           <div className="p-6 rounded-[2rem] bg-zinc-900/20 border border-white/[0.02] backdrop-blur-sm">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-4 text-center">Development Environment</h3>
             <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'Admin', email: 'admin@agency.com' },
                  { role: 'Manager', email: 'manager@agency.com' },
                  { role: 'Sales', email: 'sales@agency.com' },
                  { role: 'Staff', email: 'dev@agency.com' },
                ].map((cred, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-all cursor-default group">
                    <span className="text-[9px] font-black text-blue-500/80 uppercase tracking-tighter block leading-none mb-1">{cred.role}</span>
                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-tighter truncate block">{cred.email.split('@')[0]}</span>
                  </div>
                ))}
             </div>
             <p className="text-[9px] text-zinc-700 mt-4 text-center font-black uppercase tracking-widest">Master Key: <span className="text-zinc-500">pass123</span></p>
           </div>

           <div className="text-center opacity-30 flex items-center justify-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} {AGENCY_CONFIG.name} System
              </p>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
           </div>
        </div>
      </div>
    </div>
  )
}
