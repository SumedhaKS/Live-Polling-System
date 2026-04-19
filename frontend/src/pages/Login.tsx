import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
    const navigate = useNavigate()
    const { saveToken } = useAuth()
    const [serverError, setServerError] = useState('')

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginForm) => {
        try {
            setServerError('')
            const res = await loginUser(data.email, data.password)
            saveToken(res.token)
            navigate('/dashboard')
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Something went wrong')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">

                <h1 className="text-2xl font-semibold text-gray-800 mb-1">Welcome back</h1>
                <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="you@example.com"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                    </div>

                    {serverError && (
                        <p className="text-red-500 text-sm text-center">{serverError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>

                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </p>

            </div>
        </div>
    )
}