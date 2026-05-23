import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/ui/Logo'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type Fields = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Fields) => {
    try {
      const { data_from } = await login(data.email, data.password)
      toast.success('Welcome back.')
      if (!data_from || data_from === 'null') {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-gray-900 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full bg-green-400/4 blur-3xl" />
        </div>

        <Logo size="lg" light />

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-[2.4rem] font-bold text-white leading-[1.15] tracking-tight">
              Entrepreneurs have always<br />
              had the capital.<br />
              <span className="text-green-400">We gave them the system.</span>
            </h2>
          </div>

          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div className="text-2xl font-bold text-green-400">$70k+</div>
            <p className="text-xs text-gray-400 leading-snug">average annual value<br />unlocked per client</p>
          </div>
        </div>

        <p className="text-gray-700 text-xs relative z-10">
          © 2024 InvestMint Inc. · All rights reserved
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-[380px] animate-slide-up">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">Access your cash operating system</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-1">
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 font-medium hover:text-green-700">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
