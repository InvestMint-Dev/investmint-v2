import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/ui/Logo'

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[0-9]/, 'Include a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type Fields = z.infer<typeof schema>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="flex gap-3 mt-2">
      {checks.map(({ label, ok }) => (
        <div key={label} className={`flex items-center gap-1 text-xs transition-colors ${ok ? 'text-green-600' : 'text-gray-400'}`}>
          <Check size={11} className={ok ? 'opacity-100' : 'opacity-30'} />
          {label}
        </div>
      ))}
    </div>
  )
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) })

  const password = watch('password') || ''

  const onSubmit = async (data: Fields) => {
    try {
      await signup(data.email, data.password)
      toast.success("Account created! Let's get you set up.")
      navigate('/onboarding')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create account')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left accent panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-gray-900 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-green-500/5 blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-xs">
          <Logo size="lg" light />
          <div className="mt-10 space-y-4">
            <div className="card bg-white/5 border-white/10 p-5 text-left">
              <p className="text-green-400 text-3xl font-bold">$70k+</p>
              <p className="text-gray-400 text-sm mt-1">average annual value unlocked from idle cash per client</p>
            </div>
            <blockquote className="text-gray-500 text-xs italic text-left px-1 leading-relaxed">
              "The institutional tools for turning idle cash into a managed, yielding asset — finally accessible to entrepreneurs past $5M."
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm">Join InvestMint and put your idle cash to work</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Work email</label>
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
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
                {errors.password && <p className="field-error">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm password</label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Get started <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              By creating an account you agree to our{' '}
              <span className="text-gray-600">Terms of Service</span> and{' '}
              <span className="text-gray-600">Privacy Policy</span>
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:text-green-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
