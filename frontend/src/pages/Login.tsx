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

const inputClass = "w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-[10px] px-[14px] py-[11px] text-[#e8e6e0] text-sm placeholder-[#636366] outline-none transition-colors duration-200 focus:border-[#c5a97d] focus:bg-[#323234]"

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
    <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center px-6 py-10 font-sans">

      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="flex items-center gap-[10px] mb-10">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-[#c5a97d] flex items-center justify-center text-[17px]">
            ◎
          </div>
          <span className="text-[#e8e6e0] text-[16px] font-medium tracking-tight">
            Live Polling
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#252527] border border-[#3a3a3c] rounded-2xl p-8">
          <h1 className="text-[#e8e6e0] text-xl font-medium tracking-tight mb-[6px]">
            Welcome back
          </h1>
          <p className="text-[#8e8e93] text-sm mb-7">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[14px]">

            <div className="flex flex-col gap-[6px]">
              <label className="text-[#8e8e93] text-[12px] font-mono tracking-[0.4px]">EMAIL</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} />
              {errors.email && <p className="text-[#e07a5f] text-xs m-0">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[#8e8e93] text-[12px] font-mono tracking-[0.4px]">PASSWORD</label>
              <input {...register('password')} type="password" placeholder="••••••••" className={inputClass} />
              {errors.password && <p className="text-[#e07a5f] text-xs m-0">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-[#2e1e1a] border border-[#4a2a24] rounded-lg px-3 py-[10px] text-[#e07a5f] text-[13px]">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1 py-3 bg-[#c5a97d] text-[#1c1c1e] rounded-[10px] text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#d4b98a] active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

          </form>
        </div>

        <p className="text-center text-[#636366] text-[13px] mt-5">
          No account?{' '}
          <Link to="/register" className="text-[#c5a97d] no-underline hover:underline">
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}