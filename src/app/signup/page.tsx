import Link from 'next/link'
import { Navbar } from '@/components/layout/NavbarServer'
import { signup } from '@/app/login/actions'

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function SignupPage({ searchParams }: PageProps) {
  const { error } = await searchParams

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-white text-2xl font-bold mb-1">Create account</h1>
          <p className="text-zinc-500 text-sm mb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:underline">Sign in</Link>
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form action={signup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 text-sm" htmlFor="full_name">Full name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 text-sm" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 text-sm" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-400 text-black font-bold py-2.5 rounded-lg hover:bg-amber-300 transition-colors mt-2"
            >
              Create account
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
