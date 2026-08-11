'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInAdmin(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    redirect('/admin/login?error=missing')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/admin/login?error=invalid')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user?.id)
    .single()

  if (!profile?.is_admin) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=forbidden')
  }

  redirect('/admin')
}

export async function signOutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

