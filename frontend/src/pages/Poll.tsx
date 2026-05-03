import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { useAuth } from '../hooks/useAuth'
import { useWebSocket } from '../hooks/useWebSocket'
import { submitVote } from '../api/votes'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Option {
  id: string
  text: string
  order: number
  _count?: { votes: number }
}

interface Poll {
  id: string
  question: string
  isActive: boolean
  shareCode: string
  options: Option[]
}

function getOrCreateVoterToken(): string {
  let token = localStorage.getItem('voterToken')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('voterToken', token)
  }
  return token
}

export default function Poll() {
  const { shareCode } = useParams<{ shareCode: string }>()
  const { getToken } = useAuth()

  const [poll, setPoll] = useState<Poll | null>(null)
  const [results, setResults] = useState<Option[]>([])
  const [voted, setVoted] = useState(() => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
    return poll?.id ? votedPolls.includes(poll.id) : false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // fetch poll on load
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/polls/${shareCode}`)
        const fetchedPoll = res.data.poll
        setPoll(fetchedPoll)
        setResults(fetchedPoll.options)

        // check if already voted
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
        if (votedPolls.includes(fetchedPoll.id)) {
          setVoted(true)
        }
      } catch {
        setError('Poll not found')
      } finally {
        setLoading(false)
      }
    }
    fetchPoll()
  }, [shareCode])

  // websocket — update chart when vote comes in
  useWebSocket({
    pollId: poll?.id ?? '',
    onVoteUpdate: (updatedResults) => setResults(updatedResults)
  })

  const handleVote = async (optionId: string) => {
    if (voted || !poll?.isActive) return
    try {
      const token = getToken()
      const voterToken = token ? null : getOrCreateVoterToken()
      await submitVote(optionId, poll.id, token, voterToken)

      // save to localStorage
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
      votedPolls.push(poll.id)
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls))

      setVoted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit vote')
    }
  }

  // chart data
  const chartData = {
    labels: results.map(o => o.text),
    datasets: [{
      label: 'Votes',
      data: results.map(o => o._count?.votes ?? 0),
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(236, 72, 153, 0.7)',
      ],
      borderRadius: 6,
    }]
  }

  const chartOptions = {
    responsive: true,
    animation: { duration: 400 },
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading poll...</p>
    </div>
  )

  if (error || !poll) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-sm">{error || 'Poll not found'}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-xl flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-semibold text-gray-800">{poll.question}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${poll.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'}`}>
              {poll.isActive ? 'Active' : 'Closed'}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {results.reduce((acc, o) => acc + (o._count?.votes ?? 0), 0)} votes total
          </p>
        </div>

        {/* Vote buttons */}
        {poll.isActive && !voted && (
          <div className="flex flex-col gap-2">
            {poll.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {voted && (
          <p className="text-green-600 text-sm font-medium text-center">
            ✓ Vote submitted! Results update live below.
          </p>
        )}

        {!poll.isActive && (
          <p className="text-gray-400 text-sm text-center">This poll is closed.</p>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Live chart */}
        <div>
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Live Results</p>
          <Bar data={chartData} options={chartOptions} />
        </div>

      </div>
    </div>
  )
}