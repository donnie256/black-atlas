import 'server-only'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error || !profile?.is_admin) return null
  return user
}

export async function requireAdmin() {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  return user
}

