'use server'

import { createClient } from '@/lib/supabase/server'
import { BusinessCategory } from '@/types'
import { redirect } from 'next/navigation'

export async function submitBusiness(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category = formData.get('category') as BusinessCategory
  const address = formData.get('address') as string
  const phone = formData.get('phone') as string
  const website = formData.get('website') as string
  const instagram = formData.get('instagram') as string
  const description = formData.get('description') as string
  const submitter_name = formData.get('submitter_name') as string
  const submitter_email = formData.get('submitter_email') as string
  const notes = formData.get('notes') as string

  if (!name || !category) return

  const { error } = await supabase.from('submissions').insert({
    name,
    category,
    address: address || null,
    phone: phone || null,
    website: website || null,
    instagram: instagram || null,
    description: description || null,
    submitter_name: submitter_name || null,
    submitter_email: submitter_email || null,
    notes: notes || null,
  })

  if (error) {
    console.error('submitBusiness error:', error.message)
    return
  }

  redirect('/submit/thanks')
}
