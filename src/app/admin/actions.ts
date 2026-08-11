'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { slugify } from '@/lib/utils'
import { BusinessCategory } from '@/types'
import { revalidatePath } from 'next/cache'

export async function approveSubmission(submissionId: string) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) return

  const slug = slugify(submission.name)

  const { data: duplicate } = await supabase
    .from('businesses')
    .select('id')
    .or([
      `slug.eq.${slug}`,
      submission.website ? `website.eq.${submission.website}` : '',
      submission.phone ? `phone.eq.${submission.phone}` : '',
    ].filter(Boolean).join(','))
    .maybeSingle()

  if (duplicate) {
    console.error(JSON.stringify({ event: 'business_duplicate_detected', submissionId, duplicateId: duplicate.id }))
    return
  }

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
    source: submission.source ?? 'community',
    reviewed_by: admin.id,
  })

  if (insertError) { console.error('approveSubmission:', insertError.message); return }

  await supabase
    .from('submissions')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: admin.id })
    .eq('id', submissionId)

  revalidatePath('/admin')
  revalidatePath('/businesses')
}

export async function rejectSubmission(submissionId: string) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('submissions')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: admin.id })
    .eq('id', submissionId)

  revalidatePath('/admin')
}

export async function approveBusiness(businessId: string) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('businesses')
    .update({ status: 'approved', reviewed_by: admin.id })
    .eq('id', businessId)

  revalidatePath('/admin')
  revalidatePath('/businesses')
}

export async function rejectBusiness(businessId: string) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('businesses')
    .update({ status: 'rejected', reviewed_by: admin.id })
    .eq('id', businessId)

  revalidatePath('/admin')
}

export async function verifyBusiness(businessId: string) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('businesses')
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      reviewed_by: admin.id,
    })
    .eq('id', businessId)

  revalidatePath('/admin')
  revalidatePath('/businesses')
}

export async function approveEvent(eventId: string) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('events')
    .update({ status: 'upcoming', reviewed_by: admin.id })
    .eq('id', eventId)

  revalidatePath('/admin')
  revalidatePath('/events')
}

export async function rejectEvent(eventId: string) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('events')
    .update({ status: 'rejected', reviewed_by: admin.id })
    .eq('id', eventId)

  revalidatePath('/admin')
}

export async function archiveEvent(eventId: string) {
  const admin = await requireAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('events')
    .update({ status: 'past', reviewed_by: admin.id })
    .eq('id', eventId)

  revalidatePath('/admin')
  revalidatePath('/events')
}
