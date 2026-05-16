import { Navbar } from '@/components/layout/NavbarServer'
import { Mail } from 'lucide-react'

export default function VerifyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Mail className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We sent you a confirmation link. Click it to activate your account and start saving businesses.
          </p>
        </div>
      </main>
    </>
  )
}
