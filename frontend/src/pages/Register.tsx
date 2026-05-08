import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const registerSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

const inputClass = "w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-[10px] px-[14px] py-[11px] text-[#e8e6e0] text-sm placeholder-[#636366] outline-none transition-colors duration-200 focus:border-[#c5a97d] focus:bg-[#323234]"

export default function Register() {
  const navigate = useNavigate()
  const { saveToken } = useAuth()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
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
            Create account
          </h1>
          <p className="text-[#8e8e93] text-sm mb-7">
            Start running live polls in seconds
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[14px]">

            <div className="flex flex-col gap-[6px]">
              <label className="text-[#8e8e93] text-[12px] font-mono tracking-[0.4px]">
                EMAIL <span className="text-[#e07a5f]">*</span>
              </label>
              <input {...register('email')} type="email" required placeholder="you@example.com" className={inputClass} />
              {errors.email && <p className="text-[#e07a5f] text-xs m-0">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[#8e8e93] text-[12px] font-mono tracking-[0.4px]">
                NAME <span className="text-[#4a4a4c] text-[11px] font-normal">(optional)</span>
              </label>
              <input {...register('name')} type="text" placeholder="Your name" className={inputClass} />
              {errors.name && <p className="text-[#e07a5f] text-xs m-0">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[#8e8e93] text-[12px] font-mono tracking-[0.4px]">
                PASSWORD <span className="text-[#e07a5f]">*</span>
              </label>
              <input {...register('password')} type="password" required placeholder="min. 6 characters" className={inputClass} />
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
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

          </form>
        </div>

        <p className="text-center text-[#636366] text-[13px] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#c5a97d] no-underline hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}