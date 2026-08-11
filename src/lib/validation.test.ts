import { describe, expect, it } from 'vitest'
import { parseBusinessSubmission, parseEventSubmission } from './validation'

function form(values: Record<string, string>) {
  const data = new FormData()
  Object.entries(values).forEach(([key, value]) => data.set(key, value))
  return data
}

describe('parseBusinessSubmission', () => {
  it('normalizes valid business submissions', () => {
    const result = parseBusinessSubmission(form({
      name: '  Example Cafe  ',
      category: 'restaurant',
      website: 'example.com',
      instagram: '@example.cafe',
      phone: '(720) 555-0100',
      submitter_email: 'OWNER@EXAMPLE.COM',
    }))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.name).toBe('Example Cafe')
    expect(result.value.website).toBe('https://example.com/')
    expect(result.value.instagram).toBe('example.cafe')
    expect(result.value.phone).toBe('7205550100')
    expect(result.value.submitter_email).toBe('owner@example.com')
  })

  it('rejects invalid categories and URLs', () => {
    const result = parseBusinessSubmission(form({
      name: 'Example',
      category: 'invalid',
      website: 'not a url',
    }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors).toContain('Choose a valid category.')
    expect(result.errors).toContain('Enter a valid website URL.')
  })
})

describe('parseEventSubmission', () => {
  it('creates pending events for valid submissions', () => {
    const result = parseEventSubmission(form({
      title: 'Community Market',
      date: '2099-08-15',
      time: '18:30',
      category: 'Community',
      is_free: 'true',
      ticket_url: 'example.com/rsvp',
    }), 'community-market')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.status).toBe('pending')
    expect(result.value.ticket_url).toBe('https://example.com/rsvp')
    expect(result.value.ticket_price_min).toBeNull()
  })

  it('rejects invalid dates and paid events without a valid price', () => {
    const result = parseEventSubmission(form({
      title: 'Community Market',
      date: '2020-01-01',
      is_free: 'false',
      ticket_price: '-5',
    }), 'community-market')

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors).toContain('Enter a valid ticket price.')
    expect(result.errors).toContain('Event date must be in the future.')
  })
})

