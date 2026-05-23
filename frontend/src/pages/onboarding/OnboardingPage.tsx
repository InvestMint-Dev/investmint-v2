import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import Logo from '../../components/ui/Logo'
import StepCompanyInfo from './steps/StepCompanyInfo'
import StepBankAccounts from './steps/StepBankAccounts'
import StepInvestmentProfile from './steps/StepInvestmentProfile'
import StepCashFlowConnect from './steps/StepCashFlowConnect'

const STEPS = [
  { label: 'Company Info' },
  { label: 'Bank Accounts' },
  { label: 'Investment Profile' },
  { label: 'Connect Data' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
  }
  const back = () => {
    if (step > 0) setStep(step - 1)
  }
  const finish = () => navigate('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Logo />
        <span className="text-sm text-gray-500">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-10">
        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    i < step
                      ? 'bg-green-500 text-white'
                      : i === step
                      ? 'bg-green-500 text-white ring-4 ring-green-100'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {i < step ? <CheckCircle size={18} /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${i <= step ? 'text-gray-700' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mt-[-14px] mx-1 transition-all duration-300 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="animate-fade-in">
          {step === 0 && <StepCompanyInfo onNext={next} />}
          {step === 1 && <StepBankAccounts onNext={next} onBack={back} />}
          {step === 2 && <StepInvestmentProfile onNext={next} onBack={back} />}
          {step === 3 && <StepCashFlowConnect onFinish={finish} onBack={back} />}
        </div>
      </div>
    </div>
  )
}
