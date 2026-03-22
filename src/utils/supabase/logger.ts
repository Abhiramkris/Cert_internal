import { createClient } from './server'
import { headers } from 'next/headers'

export async function logAction(action: string, details: any = {}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get IP Address from headers
    const headerList = await headers()
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 
             headerList.get('x-real-ip') || 
             'unknown'

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      action,
      details,
      ip_address: ip
    })

    if (error) {
      console.error('Failed to write audit log:', error)
    }
  } catch (err) {
    console.error('Audit logger error:', err)
  }
}
