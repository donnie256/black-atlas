import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin-auth'
import { signInAdmin } from './actions'

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'Invalid email or password.',
  forbidden: 'This account is not an admin.',
  missing: 'Email and password are required.',
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const admin = await getAdminUser()
  if (admin) redirect('/admin')

  const { error } = await searchParams

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <form action={signInAdmin} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <h1 className="text-white text-xl font-bold">Black Atlas Admin</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in with an authorized admin account.</p>
        </div>

        {error && ERROR_MESSAGES[error] && (
          <p className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg px-3 py-2">
            {ERROR_MESSAGES[error]}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
          Email
          <input
            name="email"
            type="email"
            required
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
          Password
          <input
            name="password"
            type="password"
            required
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
          />
        </label>

        <button type="submit" className="bg-amber-400 text-black font-bold rounded-lg py-2.5 hover:bg-amber-300 transition-colors">
          Sign in
        </button>
      </form>
    </main>
  )
}

