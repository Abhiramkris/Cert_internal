import { createClient } from '@/utils/supabase/server'
import { AGENCY_CONFIG } from '@/utils/agency-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Globe, MessageSquare, CheckCircle2, Clock, Send, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { submitComment, approveProject } from '@/app/review/actions'

export default async function ClientReviewPage({ params }: { params: { token: string } }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      comments (*)
    `)
    .eq('secure_token', token)
    .single()

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="glass border-red-500/20 text-center max-w-md p-8">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/40">This review link is invalid or has expired. Please contact your project manager.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">
            {project.client_name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">{project.client_name} • Client Portal</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Secure Project Review</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-blue-500/10 text-blue-400 border-none px-3 py-1 rounded-lg font-bold">
            {project.status.replace(/_/g, ' ')}
          </Badge>
          {project.status === 'MANAGER_APPROVED' && (
            <form action={approveProject.bind(null, project.id, token)}>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6 shadow-lg shadow-emerald-900/20">
                Final Approval
              </Button>
            </form>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Preview */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-400" />
                Live Preview
              </h2>
              <a 
                href={project.dev_config?.live_preview_url || '#'} 
                target="_blank" 
                className="text-blue-400 text-sm font-bold hover:underline flex items-center gap-1 bg-blue-500/10 px-3 py-1 rounded-lg"
              >
                Open in new tab
                <CheckCircle2 className="w-3 h-3" />
              </a>
            </div>
            
            <div className="aspect-video w-full rounded-[2.5rem] border-8 border-slate-900 bg-slate-900 shadow-2xl overflow-hidden relative group">
            {(() => {
              // Priority 1: Check for stored port
              // Priority 2: Fallback to existing absolute URL if it exists
              const port = project.dev_config?.port;
              const legacyUrl = project.dev_config?.live_preview_url;
              
              // We're on the server, so we can't use window.location. 
              // But we can just use relative URLs if we're behind Nginx, 
              // or reconstruct from headers if needed. 
              // However, since ports are external, we need the hostname.
              // For simplicity in a server component, we'll use a relative-ish approach 
              // or just pass through the port.
              
              if (!port && !legacyUrl) return (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                  <Clock className="w-16 h-16 text-white/10 mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-white/20">Preview Under Construction</h3>
                  <p className="text-white/10 text-sm max-w-xs mt-2">Our development team is currently pushing the latest changes. Check back shortly.</p>
                </div>
              );

              return (
                <iframe 
                  src={port ? `http://\${typeof window !== 'undefined' ? window.location.hostname : '35.185.199.124'}:\${port}` : legacyUrl} 
                  className="w-full h-full bg-white transition-opacity duration-700 font-sans"
                  title="Staging Preview"
                />
              );
            })()}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-white/10 rounded-3xl p-6">
              <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Project Overview</h3>
              <p className="text-white/80 leading-relaxed italic">"{project.description}"</p>
            </Card>
            <Card className="glass border-white/10 rounded-3xl p-6">
              <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Technical Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">SEO Optimized</span>
                  <span className="text-emerald-400 font-bold">Yes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Responsive Design</span>
                  <span className="text-emerald-400 font-bold">Yes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">CMS Integrated</span>
                  <span className="text-blue-400 font-bold">{project.dev_config?.cms_used || 'N/A'}</span>
                </div>
              </div>
            </Card>
          </section>
        </div>

        {/* Right Column: Feedback */}
        <aside className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              Feedback Hub
            </h2>
            
            <Card className="glass border-white/10 rounded-3xl flex flex-col h-[600px] overflow-hidden shadow-2xl">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
                <CardTitle className="text-sm font-bold text-white/60">Comment History</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {project.comments?.length > 0 ? (
                  project.comments.map((comment: any, i: number) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                        {comment.user_id ? 'T' : 'C'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/80">{comment.user_id ? 'Team Lead' : 'Client Representative'}</span>
                          <span className="text-[10px] text-white/20">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-white/60 leading-snug bg-white/[0.03] p-3 rounded-2xl rounded-tl-none border border-white/5 group-hover:border-white/10 transition-all">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                    <MessageSquare className="w-12 h-12 mb-2" />
                    <p className="text-sm font-medium italic">No comments yet. Be the first to start the conversation.</p>
                  </div>
                )}
              </CardContent>

              <div className="p-4 bg-slate-900 border-t border-white/10">
                <form action={submitComment.bind(null, project.id, token)} className="relative">
                  <Textarea 
                    name="content"
                    placeholder="Type your feedback here..." 
                    className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl pr-12 focus:border-blue-500/50 transition-all resize-none shadow-inner"
                  />
                  <Button size="icon" className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/40">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-[10px] text-white/20 mt-3 text-center italic">Project updates are tracked in real-time. Team will be notified instantly.</p>
              </div>
            </Card>
          </section>
        </aside>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 mt-12">
        <p className="text-sm font-medium uppercase tracking-widest text-white/40">&copy; {new Date().getFullYear()} {AGENCY_CONFIG.name} System</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  )
}
