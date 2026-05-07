import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
})

export const getUserPolls = async (token: string) => {
  const res = await api.get('/polls', authHeader(token))
  return res.data.polls
}

export const createPoll = async (
  question: string,
  options: string[],
  expiresAt: string | null,
  token: string
) => {
  const res = await api.post('/polls', {
    question,
    options,
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
  }, authHeader(token))
  return res.data
}

export const deletePoll = async (id: string, token: string) => {
  const res = await api.delete(`/polls/${id}`, authHeader(token))
  return res.data
}

export const togglePoll = async (id: string, token: string) => {
  const res = await api.patch(`/polls/${id}/toggle`, {}, authHeader(token))
  return res.data
}