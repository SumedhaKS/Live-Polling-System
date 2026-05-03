import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export const registerUser = async (email: string, password: string, name?: string) => {
    const res = await api.post('/auth/register', { email, password, name })
    return res.data;
}

export const loginUser = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password })
    return res.data;
}
