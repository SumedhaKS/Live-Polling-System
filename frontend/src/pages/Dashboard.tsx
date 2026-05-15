import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getUserPolls, createPoll, deletePoll, togglePoll } from '../api/polls'

interface Option { id: string; text: string }
interface Poll {
  id: string; question: string; shareCode: string
  isActive: boolean; options: Option[]
}

const inputClass = "w-full bg-white border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-base placeholder-stone-400 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"

export default function Dashboard() {
  const { getToken, logout } = useAuth()
  const navigate = useNavigate()

  const [polls, setPolls] = useState<Poll[]>([])
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) { navigate('/login'); return }
    fetchPolls()
  }, [])

  const fetchPolls = async () => {
    try {
      setFetchLoading(true)
      const data = await getUserPolls(getToken()!)
      setPolls(data)
    } catch { setError('Failed to fetch polls') }
    finally { setFetchLoading(false) }
  }

  const handleAddOption = () => { if (options.length < 6) setOptions([...options, '']) }
  const handleOptionChange = (i: number, v: string) => { const u = [...options]; u[i] = v; setOptions(u) }
  const handleRemoveOption = (i: number) => { if (options.length <= 2) return; setOptions(options.filter((_, j) => j !== i)) }

  const handleCreate = async () => {
    if (!question.trim() || options.some(o => !o.trim())) { setError('Fill in all fields'); return }
    try {
      setLoading(true); setError('')
      await createPoll(question, options, expiresAt || null, getToken()!)
      setQuestion(''); setOptions(['', '']); setExpiresAt('')
      fetchPolls()
    } catch { setError('Failed to create poll') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    try { await deletePoll(id, getToken()!); setPolls(polls.filter(p => p.id !== id)) }
    catch { setError('Failed to delete poll') }
  }

  const handleToggle = async (id: string) => {
    try {
      const updated = await togglePoll(id, getToken()!)
      setPolls(polls.map(p => p.id === id ? { ...p, isActive: updated.poll.isActive } : p))
    } catch { setError('Failed to update poll') }
  }

  const copyLink = (shareCode: string, pollId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/poll/${shareCode}`)
    setCopiedId(pollId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">

      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-lg shadow-sm">◎</div>
          <span className="text-stone-800 text-lg font-semibold tracking-tight">Live Polling</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="border-2 border-stone-200 text-stone-600 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 hover:border-red-300 hover:text-red-500 hover:bg-red-50"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Create Poll Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 text-base font-bold">+</span>
            </div>
            <h2 className="text-stone-800 text-lg font-semibold m-0">Create a new poll</h2>
          </div>

          <div className="flex flex-col gap-4">
            <input
              className={inputClass} value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask your question..."
            />

            <div className="flex flex-col gap-3">
              <p className="text-stone-600 text-sm font-semibold uppercase tracking-wide m-0">Options</p>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <span className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-semibold shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    className={`${inputClass} flex-1`} value={opt}
                    onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                  />
                  <button
                    onClick={() => handleRemoveOption(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150 text-lg border-none bg-transparent cursor-pointer shrink-0"
                  >×</button>
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="w-full bg-transparent border-2 border-dashed border-stone-200 rounded-xl py-3 text-stone-400 text-sm font-medium cursor-pointer transition-all duration-150 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50"
              >
                + Add option {options.length < 6 && <span className="text-stone-300">({6 - options.length} remaining)</span>}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-stone-600 text-sm font-semibold uppercase tracking-wide">
                Expiry date{' '}
                <span className="text-stone-400 text-xs font-normal normal-case">(optional)</span>
              </label>
              <input
                type="datetime-local"
                className={inputClass} value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                min={new Date(Date.now() + 3 * 60 * 1000).toISOString().slice(0, 16)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                <p className="text-red-600 text-sm m-0">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreate} disabled={loading}
              className="w-full py-3 bg-amber-500 text-white rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? 'Creating...' : 'Create poll'}
            </button>
          </div>
        </div>

        {/* Poll List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-stone-700 text-base font-semibold uppercase tracking-wide m-0">Your polls</h2>
            {polls.length > 0 && (
              <span className="text-stone-400 text-sm bg-stone-100 px-3 py-1 rounded-full">{polls.length} total</span>
            )}
          </div>

          {fetchLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-stone-100 rounded-lg w-3/5 mb-3" />
                  <div className="h-3 bg-stone-100 rounded-lg w-1/4" />
                </div>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white border-2 border-dashed border-stone-200 rounded-2xl">
              <p className="text-4xl m-0 mb-3">🗳️</p>
              <p className="text-stone-700 text-lg font-medium m-0 mb-2">No polls yet</p>
              <p className="text-stone-400 text-base m-0">Create your first poll above and share it with anyone</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {polls.map(poll => (
                <div key={poll.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-4">
                      <p className="text-stone-800 text-base font-semibold m-0 mb-1 leading-snug">{poll.question}</p>
                      <p className="text-stone-400 text-sm m-0">{poll.options.length} options</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 border ${
                      poll.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-500 border-stone-200'
                    }`}>
                      {poll.isActive ? '● Live' : '○ Closed'}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/poll/${poll.shareCode}`}
                      className="text-sm px-4 py-2 rounded-xl border-2 border-stone-200 text-stone-600 font-medium no-underline transition-all duration-150 hover:bg-stone-50 hover:border-stone-300"
                    >
                      View poll
                    </Link>
                    <button
                      onClick={() => copyLink(poll.shareCode, poll.id)}
                      className={`text-sm px-4 py-2 rounded-xl border-2 font-medium cursor-pointer transition-all duration-150 ${
                        copiedId === poll.id
                          ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                          : 'border-stone-200 text-stone-600 bg-transparent hover:bg-stone-50 hover:border-stone-300'
                      }`}
                    >
                      {copiedId === poll.id ? '✓ Copied!' : 'Copy link'}
                    </button>
                    <button
                      onClick={() => handleToggle(poll.id)}
                      className="text-sm px-4 py-2 rounded-xl border-2 border-stone-200 text-stone-600 font-medium bg-transparent cursor-pointer transition-all duration-150 hover:bg-stone-50 hover:border-stone-300"
                    >
                      {poll.isActive ? 'Close' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => handleDelete(poll.id)}
                      className="text-sm px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 font-medium bg-transparent cursor-pointer transition-all duration-150 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}