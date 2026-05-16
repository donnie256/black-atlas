'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import { BusinessCategory } from '@/types'
import { revalidatePath } from 'next/cache'

export async function approveSubmission(submissionId: string) {
  const supabase = createAdminClient()

  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) return

  const slug = slugify(submission.name)

  const { error: insertError } = await supabase.from('businesses').insert({
    slug,
    name: submission.name,
    category: submission.category as BusinessCategory,
    address: submission.address,
    phone: submission.phone,
    website: submission.website,
    instagram: submission.instagram,
    description: submission.description,
    status: 'approved',
  })

  if (insertError) { console.error('approveSubmission:', insertError.message); return }

  await supabase
    .from('submissions')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', submissionId)

  revalidatePath('/admin')
  revalidatePath('/businesses')
}

export async function rejectSubmission(submissionId: string) {
  const supabase = createAdminClient()

  await supabase
    .from('submissions')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', submissionId)

  revalidatePath('/admin')
}
