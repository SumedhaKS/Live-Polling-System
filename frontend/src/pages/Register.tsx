import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const registerSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional()
})

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
    const navigate = useNavigate()
    const { saveToken } = useAuth()
    const [serverError, setServerError] = useState('')

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterForm) => {
        try {
            setServerError('')
            const res = await registerUser(data.email, data.password, data.name)
            saveToken(res.token)
            navigate('/dashboard')
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Something went wrong')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">

                <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create an account</h1>
                <p className="text-gray-500 text-sm mb-6">Sign up to get started</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Email<span className="text-red-500">*</span></label>
                        <input
                            {...register('email')}
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="example"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Password<span className="text-red-500">*</span></label>
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
                        {isSubmitting ? 'Signing up...' : 'Sign up'}
                    </button>

                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>

            </div>
        </div>
    )
}