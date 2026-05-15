import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const inputClass = "w-full bg-white border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-base placeholder-stone-400 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"

export default function Login() {
  const navigate = useNavigate()
  const { saveToken } = useAuth()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-xl shadow-sm">
            ◎
          </div>
          <span className="text-stone-800 text-xl font-semibold tracking-tight">Live Polling</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-stone-900 text-2xl font-semibold tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-stone-500 text-base mb-8">
            Sign in to manage your polls
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="text-stone-700 text-sm font-semibold tracking-wide uppercase">
                Email
              </label>
              <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} />
              {errors.email && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-stone-700 text-sm font-semibold tracking-wide uppercase">
                Password
              </label>
              <input {...register('password')} type="password" placeholder="••••••••" className={inputClass} />
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                <p className="text-red-600 text-sm m-0">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1 py-3 bg-amber-500 text-white rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-amber-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

          </form>
        </div>

        <p className="text-center text-stone-500 text-base mt-6">
          No account?{' '}
          <Link to="/register" className="text-amber-600 font-medium hover:underline">
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}