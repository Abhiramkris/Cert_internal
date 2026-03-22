'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  console.log('--- LOGIN ACTION START ---')
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  console.log('Attempting login for:', email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  console.log('Login successful for user:', data.user?.id)
  revalidatePath('/', 'layout')
  console.log('Redirecting to dashboard...')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  console.log('--- SIGNUP ACTION START ---')
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string || 'Sales'

  console.log('Attempting signup for:', email, 'with role:', role)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  console.log('Signup successful. User ID:', data.user?.id)
  console.log('Confirmation sent to:', email)
  
  revalidatePath('/', 'layout')
  redirect('/login?message=Check email to continue sign in process')
}

export async function signOut() {
  console.log('--- SIGNOUT ACTION START ---')
  const supabase = await createClient()
  await supabase.auth.signOut()
  console.log('Signout successful.')
  redirect('/login')
}
