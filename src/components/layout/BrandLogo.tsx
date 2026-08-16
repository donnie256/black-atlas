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
      <path d="M10 18L24 12V47L10 53V18Z" fill="#F4F4F5" />
      <path d="M24 12L40 18V53L24 47V12Z" fill="#D4D4D8" />
      <path d="M40 18L54 12V47L40 53V18Z" fill="#F4F4F5" />
      <path d="M24 12V47" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M40 18V53" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 18L24 12L40 18L54 12" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 53L24 47L40 53L54 47" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M13 38C20 31 27 33 33 38C39 43 46 39 52 31"
        stroke="#D49A24"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M36 17C36 11.5 40.5 7 46 7C51.5 7 56 11.5 56 17C56 25.6 46 36 46 36C46 36 36 25.6 36 17Z" fill="#D49A24" stroke="#09090B" strokeWidth="2" />
      <circle cx="46" cy="17" r="4" fill="#FFFFFF" />
      <circle cx="14" cy="38" r="4.4" fill="#B4232A" stroke="#09090B" strokeWidth="2" />
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
