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
      backgroundColor: '#c5a97d99',
      borderColor: '#c5a97d',
      borderWidth: 1,
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  const chartOptions = {
    responsive: true,
    animation: { duration: 500, easing: 'easeOutQuart' as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#252527',
        borderColor: '#3a3a3c',
        borderWidth: 1,
        titleColor: '#d8d6d0',
        bodyColor: '#8e8e93',
        padding: 10,
        callbacks: {
          label: (ctx: any) => {
            const pct = totalVotes > 0 ? Math.round((ctx.raw / totalVotes) * 100) : 0
            return ` ${ctx.raw} votes (${pct}%)`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#4a4a4c', font: { size: 12 } },
        grid: { color: '#2a2a2c' },
        border: { color: '#2a2a2c' }
      },
      x: {
        ticks: { color: '#8e8e93', font: { size: 12 } },
        grid: { display: false },
        border: { color: '#2a2a2c' }
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center font-sans">
      <div className="text-center">
        <div className="w-8 h-8 rounded-lg bg-[#c5a97d] mx-auto mb-4 animate-spin" />
        <p className="text-[#636366] text-sm m-0">Loading poll...</p>
      </div>
    </div>
  )

  if (error || !poll) return (
    <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center font-sans">
      <div className="text-center">
        <p className="text-[2rem] m-0 mb-3">🔍</p>
        <p className="text-[#e07a5f] text-[15px] m-0 mb-[6px]">Poll not found</p>
        <p className="text-[#4a4a4c] text-[13px] m-0">This poll may have been deleted or the link is invalid.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-[#e8e6e0] font-sans px-6 py-6">

      <div className="max-w-[540px] mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-[26px] h-[26px] rounded-[6px] bg-[#c5a97d] flex items-center justify-center text-[12px]">◎</div>
          <span className="text-[#636366] text-[14px] font-mono">live polling</span>
        </div>

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="m-0 text-[22px] font-medium tracking-tight leading-[1.3] text-[#e8e6e0]">
              {poll.question}
            </h1>
            <span className={`text-[11px] px-2 py-[3px] rounded-[6px] font-mono shrink-0 mt-1 border ${
              poll.isActive
                ? 'bg-[#1a2e20] text-[#7fcfa0] border-[#2a4a30]'
                : 'bg-[#252525] text-[#636366] border-[#3a3a3a]'
            }`}>
              {poll.isActive ? '● live' : '○ closed'}
            </span>
          </div>
          <p className="m-0 text-[#4a4a4c] text-[13px] font-mono">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </p>
        </div>

        {/* Vote options */}
        {poll.isActive && !voted && (
          <div className="flex flex-col gap-2 mb-7">
            {poll.options.map((option, i) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={submitting}
                className="w-full text-left px-4 py-[13px] bg-[#252527] border border-[#3a3a3c] rounded-[12px] text-[#c8c6c0] text-sm cursor-pointer transition-all duration-150 flex items-center gap-3 hover:bg-[#2e2c28] hover:border-[#c5a97d] hover:text-[#e8e6e0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="w-[22px] h-[22px] rounded-[6px] bg-[#2c2c2e] border border-[#3a3a3c] flex items-center justify-center text-[11px] text-[#636366] font-mono shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {option.text}
              </button>
            ))}
          </div>
        )}

        {/* Voted state */}
        {voted && poll.isActive && (
          <div className="bg-[#1a2e20] border border-[#2a4a30] rounded-[12px] px-4 py-[13px] flex items-center gap-[10px] mb-7">
            <span className="text-[#7fcfa0] text-base">✓</span>
            <div>
              <p className="m-0 text-[#7fcfa0] text-sm font-medium">Vote submitted</p>
              <p className="m-0 text-[#3a6a48] text-[12px]">Results update live as others vote</p>
            </div>
          </div>
        )}

        {/* Closed state */}
        {!poll.isActive && (
          <div className="bg-[#252525] border border-[#3a3a3a] rounded-[12px] px-4 py-[13px] mb-7">
            <p className="m-0 text-[#636366] text-sm">This poll is closed. Final results below.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#2e1e1a] border border-[#4a2a24] rounded-[10px] px-[14px] py-[10px] mb-6">
            <p className="m-0 text-[#e07a5f] text-[13px]">{error}</p>
          </div>
        )}

        {/* Chart */}
        <div className="bg-[#252527] border border-[#3a3a3c] rounded-2xl p-6">
          <p className="m-0 mb-5 text-[12px] text-[#636366] font-mono tracking-[0.3px]">LIVE RESULTS</p>
          <Bar data={chartData} options={chartOptions} />
        </div>

      </div>
    </div>
  )
}