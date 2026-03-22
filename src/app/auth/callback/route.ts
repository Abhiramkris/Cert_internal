import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { logAction } from '@/utils/supabase/logger'

export async function GET(request: Request) {
  console.log('--- AUTH CALLBACK START ---')
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  
  console.log('Origin:', origin)

  if (code) {
    console.log('Auth code detected, exchanging for session...')
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Session exchange error:', error.message)
      } else {
        console.log('Session exchange successful for user:', data.user?.id)
        await logAction('LOGIN', { method: 'callback' })
      }
    } catch (e) {
      console.error('Unexpected error in auth callback:', e)
    }
  } else {
    console.warn('No auth code found in callback URL.')
  }

  const redirectUrl = `${origin}/dashboard`
  console.log('Redirecting to:', redirectUrl)
  return NextResponse.redirect(redirectUrl)
}
