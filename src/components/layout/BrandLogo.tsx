import { cn } from '@/lib/utils'

interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Black Atlas"
      className={cn('shrink-0', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1.5" y="1.5" width="61" height="61" rx="13" fill="#09090B" stroke="#D49A24" strokeWidth="3" />
      <path d="M9 20L21 14L33 20L45 14L55 19V45L43 51L31 45L19 51L9 46V20Z" fill="#27272A" />
      <path d="M21 14V39L19 51" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M33 20V45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M45 14V39L43 51" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M12 35C19 29 24 31 31 37C38 43 45 40 53 31"
        stroke="#D49A24"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeDasharray="5 5"
      />
      <path d="M37 12C37 7.6 40.6 4 45 4C49.4 4 53 7.6 53 12C53 18.7 45 27 45 27C45 27 37 18.7 37 12Z" fill="#D49A24" />
      <circle cx="45" cy="12" r="3.4" fill="#F4F4F5" />
      <circle cx="54" cy="31" r="5.2" fill="#B4232A" stroke="#FFFFFF" strokeWidth="2.4" />
    </svg>
  )
}

interface BrandLogoProps {
  className?: string
  markClassName?: string
  textClassName?: string
}

export function BrandLogo({ className, markClassName, textClassName }: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandMark className={cn('h-9 w-9', markClassName)} />
      <span className={cn('font-bold tracking-tight text-white', textClassName)}>Black Atlas</span>
    </span>
  )
}
