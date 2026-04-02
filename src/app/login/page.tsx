import { login } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AGENCY_CONFIG } from '@/utils/agency-config'
import { ShieldCheck, UserCircle2, KeyRound, ArrowRight } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] relative overflow-hidden font-sans">
      <div className="w-full max-w-[440px] px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-none bg-zinc-950 border border-zinc-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] mb-8 transition-transform">
            {AGENCY_CONFIG.logo_url ? (
              <img src={AGENCY_CONFIG.logo_url} alt="Logo" className="w-12 h-12 object-contain invert" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-950 mb-2">
            {AGENCY_CONFIG.name.split(' ')[0]} <span className="text-zinc-400">{AGENCY_CONFIG.name.split(' ').slice(1).join(' ') || 'Workflow'}</span>
          </h1>
        </div>

        {/* Login Card */}
        <Card className="rounded-none border-2 border-zinc-200 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <CardHeader className="p-8 pb-4 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black text-zinc-950 tracking-tight flex items-center gap-2">
                <UserCircle2 className="w-4 h-4" /> Identity Verification
              </CardTitle>
              <Badge variant="outline" className="rounded-none border-zinc-200 text-[9px] font-black uppercase tracking-tighter text-zinc-400 px-2 py-0">Secure</Badge>
            </div>
          </CardHeader>
          
          <form action={login}>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-black tracking-tight text-zinc-400 ml-1">Access Token (Email)</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="identity@agency.com"
                    required
                    className="h-14 bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 text-zinc-950 font-black rounded-none pl-12 transition-all outline-none ring-0 focus:ring-0 placeholder:text-zinc-200 text-sm tracking-tight"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-950 font-black text-xs">@</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[11px] font-black tracking-tight text-zinc-400 ml-1">Security Key (Password)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-14 bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 text-zinc-950 font-black rounded-none pl-12 transition-all outline-none ring-0 focus:ring-0"
                  />
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950" />
                </div>
              </div>

              {message && (
                <div className="p-4 bg-rose-50 border-2 border-rose-50 border-t-rose-500 text-rose-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  Authentication Failed: {message}
                </div>
              )}
            </CardContent>

            <CardFooter className="p-8 pt-0">
              <Button type="submit" className="w-full h-14 bg-zinc-950 text-white hover:bg-zinc-800 font-black rounded-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 tracking-tight text-sm">
                Authorize Access
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
           <div className="text-center opacity-40 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-zinc-300" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                System Release v4.0.2
              </p>
              <span className="h-px w-8 bg-zinc-300" />
           </div>
           <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.1em] mt-4">&copy; {new Date().getFullYear()} {AGENCY_CONFIG.name} Group. Unauthorized access is recorded.</p>
        </div>
      </div>
    </div>
  )
}
