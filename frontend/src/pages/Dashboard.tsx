import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getUserPolls, createPoll, deletePoll, togglePoll } from '../api/polls'

interface Option { id: string; text: string }
interface Poll {
  id: string; question: string; shareCode: string
  isActive: boolean; options: Option[]
}

const inputClass = "w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-[10px] px-[14px] py-[11px] text-[#e8e6e0] text-sm placeholder-[#636366] outline-none transition-colors duration-200 focus:border-[#c5a97d] focus:bg-[#323234]"

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
    <div className="min-h-screen bg-[#1c1c1e] text-[#e8e6e0] font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-[#2a2a2c] px-6 h-[54px] flex items-center justify-between bg-[#1c1c1eee] backdrop-blur-[10px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-7 h-7 rounded-[7px] bg-[#c5a97d] flex items-center justify-center text-[13px]">◎</div>
          <span className="text-[#e8e6e0] text-[15px] font-medium tracking-tight">Live Polling</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="bg-transparent border border-[#3a3a3c] text-[#8e8e93] px-[14px] py-[7px] rounded-lg text-[13px] cursor-pointer transition-colors duration-150 hover:border-[#e07a5f] hover:text-[#e07a5f]"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-[660px] mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Create Poll */}
        <div className="bg-[#252527] border border-[#3a3a3c] rounded-2xl p-6">
          <h2 className="text-[#c5a97d] text-[13px] font-mono tracking-[0.3px] mb-5">NEW POLL</h2>

          <div className="flex flex-col gap-3">
            <input
              className={inputClass} value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask your question..."
            />

            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[#636366] text-[12px] font-mono min-w-[18px]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    className={`${inputClass} flex-1`} value={opt}
                    onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                  />
                  <button
                    onClick={() => handleRemoveOption(i)}
                    className="bg-transparent border-none text-[#4a4a4c] cursor-pointer px-1 text-lg leading-none transition-colors duration-150 hover:text-[#e07a5f]"
                  >×</button>
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="w-full bg-transparent border border-dashed border-[#3a3a3c] rounded-[10px] py-[10px] text-[#636366] text-[13px] cursor-pointer transition-all duration-150 hover:border-[#c5a97d] hover:text-[#c5a97d] hover:bg-[#252520]"
              >
                + add option{' '}
                {options.length < 6 && <span className="text-[#4a4a4c]">({6 - options.length} left)</span>}
              </button>
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[#636366] text-[12px] font-mono tracking-[0.3px]">
                EXPIRES AT <span className="text-[#4a4a4c]">(optional)</span>
              </label>
              <input
                type="datetime-local" className={inputClass} value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                min={new Date(Date.now() + 3 * 60 * 1000).toISOString().slice(0, 16)}
              />
            </div>

            {error && (
              <p className="m-0 text-[#e07a5f] text-[13px] bg-[#2e1e1a] px-3 py-2 rounded-lg border border-[#4a2a24]">
                {error}
              </p>
            )}

            <button
              onClick={handleCreate} disabled={loading}
              className="w-full py-3 bg-[#c5a97d] text-[#1c1c1e] rounded-[10px] text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#d4b98a] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create poll'}
            </button>
          </div>
        </div>

        {/* Poll list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="m-0 text-[#636366] text-[13px] font-mono tracking-[0.3px]">YOUR POLLS</h2>
            {polls.length > 0 && <span className="text-[#4a4a4c] text-[13px]">{polls.length} total</span>}
          </div>

          {fetchLoading ? (
            <div className="flex flex-col gap-[10px]">
              {[1, 2].map(i => (
                <div key={i} className="bg-[#252527] border border-[#3a3a3c] rounded-[14px] p-5 opacity-50">
                  <div className="h-[13px] bg-[#3a3a3c] rounded w-[55%] mb-[10px]" />
                  <div className="h-[11px] bg-[#3a3a3c] rounded w-[25%] opacity-60" />
                </div>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-[#2a2a2c] rounded-[14px]">
              <p className="text-[1.75rem] m-0 mb-[10px]">🗳️</p>
              <p className="text-[#636366] text-sm m-0 mb-1">No polls yet</p>
              <p className="text-[#3a3a3c] text-[13px] m-0">Create your first poll above and share it with anyone</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {polls.map(poll => (
                <div
                  key={poll.id}
                  className="bg-[#252527] border border-[#3a3a3c] rounded-[14px] p-5 transition-colors duration-200 hover:border-[#4a4a4c]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-4">
                      <p className="m-0 mb-1 text-sm font-medium text-[#d8d6d0] leading-[1.4]">{poll.question}</p>
                      <p className="m-0 text-[12px] text-[#4a4a4c] font-mono">{poll.options.length} options</p>
                    </div>
                    <span className={`text-[11px] px-2 py-[3px] rounded-[6px] font-mono shrink-0 border ${
                      poll.isActive
                        ? 'bg-[#1a2e20] text-[#7fcfa0] border-[#2a4a30]'
                        : 'bg-[#252525] text-[#636366] border-[#3a3a3a]'
                    }`}>
                      {poll.isActive ? '● live' : '○ closed'}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/poll/${poll.shareCode}`}
                      className="text-[12px] px-3 py-[6px] rounded-lg border border-[#3a3a3c] text-[#8e8e93] no-underline transition-all duration-150 hover:bg-[#2c2c2e] hover:text-[#c8c6c0] hover:border-[#4a4a4c]"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => copyLink(poll.shareCode, poll.id)}
                      className={`text-[12px] px-3 py-[6px] rounded-lg border cursor-pointer transition-all duration-150 ${
                        copiedId === poll.id
                          ? 'text-[#7fcfa0] border-[#2a4a38] bg-[#1a2e24]'
                          : 'border-[#3a3a3c] text-[#8e8e93] bg-transparent hover:bg-[#2c2c2e] hover:text-[#c8c6c0] hover:border-[#4a4a4c]'
                      }`}
                    >
                      {copiedId === poll.id ? '✓ Copied' : 'Copy link'}
                    </button>
                    <button
                      onClick={() => handleToggle(poll.id)}
                      className="text-[12px] px-3 py-[6px] rounded-lg border border-[#3a3a3c] text-[#8e8e93] bg-transparent cursor-pointer transition-all duration-150 hover:bg-[#2c2c2e] hover:text-[#c8c6c0] hover:border-[#4a4a4c]"
                    >
                      {poll.isActive ? 'Close' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => handleDelete(poll.id)}
                      className="text-[12px] px-3 py-[6px] rounded-lg border border-[#3a2420] text-[#e07a5f] bg-transparent cursor-pointer transition-all duration-150 hover:bg-[#2a1a18]"
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