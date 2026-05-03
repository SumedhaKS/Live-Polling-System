import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export const submitVote = async (optionId: string, pollId: string, token: string | null, voterToken: string | null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const body: any = { optionId, pollId };
  if (voterToken) body.voterToken = voterToken;
  const res = await api.post('/votes', body, { headers })
  return res.data
}