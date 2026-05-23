import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { bankingApi } from '../../../lib/api'

const schema = z.object({
  investingQ1: z.string().min(1, 'Required'),
  investingQ2: z.string().min(1, 'Required'),
  investingQ2CashAmount: z.string().optional(),
  investingQ2BusinessDuration: z.string().optional(),
  investingQ2AverageCashPerYear: z.string().optional(),
  investingQ3: z.string().min(1, 'Required'),
  investingQ4: z.string().min(1, 'Required'),
  investingQ4CashBackDate: z.string().optional(),
  investingQ4CashBackDuration: z.string().optional(),
  investingQ5: z.string().min(1, 'Required'),
  investingQ6: z.string().min(1, 'Required'),
  investingQ7: z.string().min(1, 'Required'),
  investingQ8: z.string().min(1, 'Required'),
  payableCycleDays: z.string().optional(),
})
type Fields = z.infer<typeof schema>

interface Props { onNext: () => void; onBack: () => void }

function RadioGroup({
  label, name, options, register, error,
}: {
  label: string
  name: any
  options: { value: string; label: string }[]
  register: any
  error?: string
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" {...register(name)} value={o.value} className="sr-only peer" />
            <span className="px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 border-gray-200 text-gray-600 hover:border-gray-300 bg-white">
              {o.label}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="field-error mt-1">{error}</p>}
    </div>
  )
}

export default function StepInvestmentProfile({ onNext, onBack }: Props) {
  const userId = localStorage.getItem('userId')
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
  })

  const q2 = useWatch({ control, name: 'investingQ2' })
  const q4 = useWatch({ control, name: 'investingQ4' })

  const onSubmit = async (data: Fields) => {
    try {
      await bankingApi.post(`/api/investingQuestionnaire/${userId}`, data)
      onNext()
    } catch {
      toast.error('Failed to save investment profile')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <BarChart3 size={20} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Investment Profile</h2>
          <p className="text-sm text-gray-500">Help us understand your investing goals</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <RadioGroup
          label="1. What is your primary goal for investing idle cash?"
          name="investingQ1"
          register={register}
          error={errors.investingQ1?.message}
          options={[
            { value: 'preserve_capital', label: 'Preserve capital' },
            { value: 'generate_income', label: 'Generate income' },
            { value: 'grow_wealth', label: 'Grow wealth' },
          ]}
        />

        <RadioGroup
          label="2. How much cash does your business typically hold?"
          name="investingQ2"
          register={register}
          error={errors.investingQ2?.message}
          options={[
            { value: 'under_100k', label: 'Under $100K' },
            { value: '100k_500k', label: '$100K – $500K' },
            { value: '500k_1m', label: '$500K – $1M' },
            { value: 'over_1m', label: 'Over $1M' },
          ]}
        />

        {q2 && (
          <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-green-100">
            <div>
              <label className="label">Average cash per year ($)</label>
              <input {...register('investingQ2AverageCashPerYear')} className="input" placeholder="500,000" />
            </div>
            <div>
              <label className="label">Years in business</label>
              <input {...register('investingQ2BusinessDuration')} className="input" placeholder="5" />
            </div>
          </div>
        )}

        <RadioGroup
          label="3. What is your risk tolerance?"
          name="investingQ3"
          register={register}
          error={errors.investingQ3?.message}
          options={[
            { value: 'conservative', label: 'Conservative' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'aggressive', label: 'Aggressive' },
          ]}
        />

        <RadioGroup
          label="4. When might you need access to these funds?"
          name="investingQ4"
          register={register}
          error={errors.investingQ4?.message}
          options={[
            { value: 'within_3m', label: 'Within 3 months' },
            { value: '3m_1y', label: '3–12 months' },
            { value: '1y_3y', label: '1–3 years' },
            { value: 'over_3y', label: '3+ years' },
          ]}
        />

        {q4 && (
          <div className="pl-4 border-l-2 border-green-100">
            <label className="label">Expected date or duration</label>
            <input {...register('investingQ4CashBackDate')} className="input" placeholder="e.g. Q3 2025 or 18 months" />
          </div>
        )}

        <RadioGroup
          label="5. Does your business operate in a seasonal industry?"
          name="investingQ5"
          register={register}
          error={errors.investingQ5?.message}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'somewhat', label: 'Somewhat' },
          ]}
        />

        <RadioGroup
          label="6. What currency do you primarily operate in?"
          name="investingQ6"
          register={register}
          error={errors.investingQ6?.message}
          options={[
            { value: 'CAD', label: 'CAD' },
            { value: 'USD', label: 'USD' },
            { value: 'both', label: 'Both' },
          ]}
        />

        <RadioGroup
          label="7. Do you have existing investments?"
          name="investingQ7"
          register={register}
          error={errors.investingQ7?.message}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
        />

        <RadioGroup
          label="8. How would you rate your investing knowledge?"
          name="investingQ8"
          register={register}
          error={errors.investingQ8?.message}
          options={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ]}
        />

        <div>
          <label className="label">Accounts payable cycle (days)</label>
          <input {...register('payableCycleDays')} type="number" className="input w-36" placeholder="30" defaultValue={30} />
          <p className="text-xs text-gray-400 mt-1">Average days between invoice and payment</p>
        </div>

        <div className="flex justify-between pt-2">
          <button type="button" onClick={onBack} className="btn-secondary">
            <ArrowLeft size={16} /> Back
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
          </button>
        </div>
      </form>
    </div>
  )
}
