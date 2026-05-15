import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js'
import { useAuth } from '../hooks/useAuth'
import { useWebSocket } from '../hooks/useWebSocket'
import { submitVote } from '../api/votes'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Option { id: string; text: string; order: number; _count?: { votes: number } }
interface Poll { id: string; question: string; isActive: boolean; shareCode: string; options: Option[] }

function getOrCreateVoterToken(): string {
  let token = localStorage.getItem('voterToken')
  if (!token) { token = crypto.randomUUID(); localStorage.setItem('voterToken', token) }
  return token
}

export default function Poll() {
  const { shareCode } = useParams<{ shareCode: string }>()
  const { getToken } = useAuth()

  const [poll, setPoll] = useState<Poll | null>(null)
  const [results, setResults] = useState<Option[]>([])
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/polls/${shareCode}`)
        const fetchedPoll = res.data.poll
        setPoll(fetchedPoll)
        setResults(fetchedPoll.options)
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
        if (votedPolls.includes(fetchedPoll.id)) setVoted(true)
      } catch { setError('Poll not found') }
      finally { setLoading(false) }
    }
    fetchPoll()
  }, [shareCode])

  useWebSocket({ pollId: poll?.id ?? '', onVoteUpdate: (r) => setResults(r) })

  const handleVote = async (optionId: string) => {
    if (voted || !poll?.isActive || submitting) return
    try {
      setSubmitting(true)
      const token = getToken()
      const voterToken = token ? null : getOrCreateVoterToken()
      await submitVote(optionId, poll.id, token, voterToken)
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
      votedPolls.push(poll.id)
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls))
      setVoted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit vote')
    } finally { setSubmitting(false) }
  }

  const totalVotes = results.reduce((acc, o) => acc + (o._count?.votes ?? 0), 0)

  const chartData = {
    labels: results.map(o => o.text),
    datasets: [{
      label: 'Votes',
      data: results.map(o => o._count?.votes ?? 0),
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(20, 184, 166, 0.8)',
      ],
      borderColor: [
        'rgb(245, 158, 11)',
        'rgb(16, 185, 129)',
        'rgb(59, 130, 246)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)',
        'rgb(20, 184, 166)',
      ],
      borderWidth: 2,
      borderRadius: 10,
      borderSkipped: false,
    }]
  }

  const chartOptions = {
    responsive: true,
    animation: { duration: 500, easing: 'easeOutQuart' as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1917',
        titleColor: '#e7e5e4',
        bodyColor: '#a8a29e',
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx: any) => {
            const pct = totalVotes > 0 ? Math.round((ctx.raw / totalVotes) * 100) : 0
            return ` ${ctx.raw} votes  ·  ${pct}%`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#a8a29e', font: { size: 13 } },
        grid: { color: '#f5f5f4' },
        border: { color: '#e7e5e4' }
      },
      x: {
        ticks: { color: '#57534e', font: { size: 13 } },
        grid: { display: false },
        border: { color: '#e7e5e4' }
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-amber-500 mx-auto mb-4 animate-spin shadow-sm" />
        <p className="text-stone-400 text-base">Loading poll...</p>
      </div>
    </div>
  )

  if (error || !poll) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl m-0 mb-4">🔍</p>
        <p className="text-stone-800 text-xl font-semibold m-0 mb-2">Poll not found</p>
        <p className="text-stone-400 text-base m-0">This poll may have been deleted or the link is invalid.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-8">

      <div className="max-w-xl mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-lg shadow-sm">◎</div>
          <span className="text-stone-600 text-base font-semibold">Live Polling</span>
        </div>

        {/* Main card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-4">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-stone-900 text-2xl font-bold leading-snug tracking-tight m-0">
              {poll.question}
            </h1>
            <span className={`text-sm px-3 py-1 rounded-full font-semibold shrink-0 mt-1 border ${
              poll.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}>
              {poll.isActive ? '● Live' : '○ Closed'}
            </span>
          </div>
          <p className="text-stone-400 text-sm mb-6">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
          </p>

          {/* Vote options */}
          {poll.isActive && !voted && (
            <div className="flex flex-col gap-3 mb-2">
              <p className="text-stone-600 text-sm font-semibold uppercase tracking-wide m-0">Choose an option</p>
              {poll.options.map((option, i) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={submitting}
                  className="w-full text-left px-4 py-4 bg-stone-50 border-2 border-stone-200 rounded-xl text-stone-700 text-base font-medium cursor-pointer transition-all duration-150 flex items-center gap-3 hover:bg-amber-50 hover:border-amber-400 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="w-8 h-8 rounded-lg bg-white border-2 border-stone-200 flex items-center justify-center text-sm text-stone-500 font-semibold shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option.text}
                </button>
              ))}
            </div>
          )}

          {/* Voted confirmation */}
          {voted && poll.isActive && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-4 flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-emerald-600 text-base font-bold">✓</span>
              </div>
              <div>
                <p className="m-0 text-emerald-700 text-base font-semibold">Vote submitted!</p>
                <p className="m-0 text-emerald-600 text-sm">Results are updating live below</p>
              </div>
            </div>
          )}

          {/* Closed state */}
          {!poll.isActive && (
            <div className="bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-4 mb-2">
              <p className="m-0 text-stone-600 text-base font-medium">This poll is closed. Final results are shown below.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 mt-3">
              <span className="text-red-500">⚠</span>
              <p className="m-0 text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Chart card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="text-stone-700 text-base font-semibold uppercase tracking-wide m-0">
              Live Results
            </p>
            <span className="text-stone-400 text-sm bg-stone-50 border border-stone-200 px-3 py-1 rounded-full">
              {totalVotes} votes
            </span>
          </div>
          <Bar data={chartData} options={chartOptions} />
        </div>

      </div>
    </div>
  )
}