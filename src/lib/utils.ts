import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BusinessCategory, DiasporaOrigin } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function formatPrice(min: number | null, max: number | null): string {
  if (!min && !max) return 'Free'
  if (min && max && min !== max) return `$${min}–$${max}`
  return `$${min || max}`
}

export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  restaurant: 'Restaurant',
  barbershop: 'Barbershop',
  salon: 'Salon',
  thrift: 'Thrift Store',
  retail: 'Retail',
  health: 'Health & Wellness',
  fitness: 'Fitness',
  entertainment: 'Entertainment',
  professional_services: 'Professional Services',
  art_culture: 'Art & Culture',
  faith: 'Faith & Spirituality',
  education: 'Education',
  other: 'Other',
}

export const DIASPORA_LABELS: Record<DiasporaOrigin, string> = {
  african_american: 'African American',
  african: 'African',
  caribbean: 'Caribbean',
  pan_african: 'Pan-African',
}
