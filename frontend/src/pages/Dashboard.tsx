// import { useEffect, useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { getUserPolls, createPoll, deletePoll, togglePoll } from '../api/polls'

// interface Option {
//   id: string
//   text: string
// }

// interface Poll {
//   id: string
//   question: string
//   shareCode: string
//   isActive: boolean
//   options: Option[]
// }

// export default function Dashboard() {
//   const { getToken, logout } = useAuth()
//   const navigate = useNavigate()

//   const [polls, setPolls] = useState<Poll[]>([])
//   const [question, setQuestion] = useState('')
//   const [options, setOptions] = useState(['', ''])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const token = getToken()
//     if (!token) { navigate('/login'); return }
//     fetchPolls()
//   }, [])

//   const fetchPolls = async () => {
//     try {
//       const data = await getUserPolls(getToken()!)
//       setPolls(data)
//     } catch {
//       setError('Failed to fetch polls')
//     }
//   }

//   const handleAddOption = () => {
//     if (options.length < 6) setOptions([...options, ''])
//   }

//   const handleOptionChange = (index: number, value: string) => {
//     const updated = [...options]
//     updated[index] = value
//     setOptions(updated)
//   }

//   const handleRemoveOption = (index: number) => {
//     if (options.length <= 2) return
//     setOptions(options.filter((_, i) => i !== index))
//   }

//   const handleCreate = async () => {
//     if (!question.trim() || options.some(o => !o.trim())) {
//       setError('Fill in all fields'); return
//     }
//     try {
//       setLoading(true)
//       setError('')
//       await createPoll(question, options, getToken()!)
//       setQuestion('')
//       setOptions(['', ''])
//       fetchPolls()
//     } catch {
//       setError('Failed to create poll')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDelete = async (id: string) => {
//     try {
//       await deletePoll(id, getToken()!)
//       setPolls(polls.filter(p => p.id !== id))
//     } catch {
//       setError('Failed to delete poll')
//     }
//   }

//   const handleToggle = async (id: string) => {
//     try {
//       const updated = await togglePoll(id, getToken()!)
//       setPolls(polls.map(p => p.id === id ? { ...p, isActive: updated.poll.isActive } : p))
//     } catch {
//       setError('Failed to toggle poll')
//     }
//   }

//   const copyLink = (shareCode: string) => {
//     navigator.clipboard.writeText(`${window.location.origin}/poll/${shareCode}`)
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* Navbar */}
//       <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//         <h1 className="text-lg font-semibold text-gray-800">Live Polling</h1>
//         <button onClick={() => { logout(); navigate('/login') }}
//           className="text-sm text-gray-500 hover:text-red-500 transition-colors">
//           Logout
//         </button>
//       </nav>

//       <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">

//         {/* Create Poll */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
//           <h2 className="text-base font-semibold text-gray-800">Create a new poll</h2>

//           <input
//             value={question}
//             onChange={e => setQuestion(e.target.value)}
//             placeholder="Ask a question..."
//             className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           <div className="flex flex-col gap-2">
//             {options.map((opt, i) => (
//               <div key={i} className="flex gap-2">
//                 <input
//                   value={opt}
//                   onChange={e => handleOptionChange(i, e.target.value)}
//                   placeholder={`Option ${i + 1}`}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button onClick={() => handleRemoveOption(i)}
//                   className="text-gray-400 hover:text-red-500 text-sm px-2">✕</button>
//               </div>
//             ))}
//             <button onClick={handleAddOption}
//               className="text-blue-600 text-sm hover:underline text-left">
//               + Add option
//             </button>
//           </div>

//           {error && <p className="text-red-500 text-sm">{error}</p>}

//           <button onClick={handleCreate} disabled={loading}
//             className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
//             {loading ? 'Creating...' : 'Create Poll'}
//           </button>
//         </div>

//         {/* Poll List */}
//         <div className="flex flex-col gap-4">
//           <h2 className="text-base font-semibold text-gray-800">Your polls</h2>
//           {polls.length === 0 && (
//             <p className="text-sm text-gray-400">No polls yet. Create one above!</p>
//           )}
//           {polls.map(poll => (
//             <div key={poll.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm font-medium text-gray-800">{poll.question}</p>
//                   <p className="text-xs text-gray-400 mt-1">{poll.options.length} options</p>
//                 </div>
//                 <span className={`text-xs px-2 py-1 rounded-full font-medium ${poll.isActive
//                   ? 'bg-green-100 text-green-700'
//                   : 'bg-gray-100 text-gray-500'}`}>
//                   {poll.isActive ? 'Active' : 'Closed'}
//                 </span>
//               </div>

//               <div className="flex gap-2 flex-wrap">
//                 <Link to={`/poll/${poll.shareCode}`}
//                   className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
//                   View poll
//                 </Link>
//                 <button onClick={() => copyLink(poll.shareCode)}
//                   className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
//                   Copy link
//                 </button>
//                 <button onClick={() => handleToggle(poll.id)}
//                   className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
//                   {poll.isActive ? 'Close' : 'Reopen'}
//                 </button>
//                 <button onClick={() => handleDelete(poll.id)}
//                   className="text-xs border border-red-200 text-red-500 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors">
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   )
// }