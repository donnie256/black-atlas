import { createAdminClient } from '@/lib/supabase/admin'
import { CATEGORY_LABELS } from '@/lib/utils'
import { Submission } from '@/types'
import { approveSubmission, rejectSubmission } from './actions'
import { CheckCircle, XCircle } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

function SubmissionRow({ submission }: { submission: Submission }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white font-semibold">{submission.name}</p>
          <p className="text-zinc-500 text-sm">{CATEGORY_LABELS[submission.category]}</p>
        </div>
        <span className="text-zinc-600 text-xs shrink-0">
          {new Date(submission.created_at).toLocaleDateString()}
        </span>
      </div>

      {submission.description && (
        <p className="text-zinc-400 text-sm leading-relaxed">{submission.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
        {submission.address && <span>📍 {submission.address}</span>}
        {submission.phone && <span>📞 {submission.phone}</span>}
        {submission.website && <span>🌐 {submission.website}</span>}
        {submission.instagram && <span>@ {submission.instagram}</span>}
      </div>

      {(submission.submitter_name || submission.submitter_email) && (
        <p className="text-zinc-600 text-xs border-t border-zinc-800 pt-2">
          Submitted by {submission.submitter_name ?? '—'} · {submission.submitter_email ?? '—'}
        </p>
      )}

      {submission.notes && (
        <p className="text-zinc-500 text-xs italic">&ldquo;{submission.notes}&rdquo;</p>
      )}

      {submission.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <form action={approveSubmission.bind(null, submission.id)}>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          </form>
          <form action={rejectSubmission.bind(null, submission.id)}>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </form>
        </div>
      )}

      {submission.status !== 'pending' && (
        <span className={`text-xs font-medium ${submission.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
        </span>
      )}
    </div>
  )
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { tab = 'pending' } = await searchParams
  const supabase = createAdminClient()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', tab)
    .order('created_at', { ascending: false })

  const { count: pendingCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const tabs = ['pending', 'approved', 'rejected']

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Black Atlas Admin</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {pendingCount ?? 0} pending submission{pendingCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <a
              key={t}
              href={`/admin?tab=${t}`}
              className={`text-sm px-4 py-1.5 rounded-full capitalize transition-colors ${
                tab === t
                  ? 'bg-amber-400 text-black font-medium'
                  : 'text-zinc-400 hover:text-white border border-zinc-700'
              }`}
            >
              {t}
            </a>
          ))}
        </div>

        {/* Submissions */}
        {submissions && submissions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {(submissions as Submission[]).map((s) => (
              <SubmissionRow key={s.id} submission={s} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-600 text-center py-16">No {tab} submissions.</p>
        )}
      </div>
    </main>
  )
}
