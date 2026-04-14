import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { logAction } from '@/utils/supabase/logger'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  
  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        await logAction('LOGIN', { method: 'callback' })
      }
    } catch (e) {
      // Silent error in callback to allow redirect fallback
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
