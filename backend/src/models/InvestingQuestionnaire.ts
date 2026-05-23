import mongoose, { Document, Schema } from 'mongoose'

export interface IInvestingQuestionnaire extends Document {
  user_id: mongoose.Types.ObjectId
  investingQ1: string
  investingQ2: string
  investingQ2CashAmount?: string
  investingQ2BusinessDuration?: string
  investingQ2AverageCashPerYear?: string
  investingQ3: string
  investingQ4: string
  investingQ4CashBackDate?: string
  investingQ4CashBackDuration?: string
  investingQ5: string
  investingQ6: string
  investingQ7: string
  investingQ8: string
  payableCycleDays: number
}

const questionnaireSchema = new Schema<IInvestingQuestionnaire>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    investingQ1: String,
    investingQ2: String,
    investingQ2CashAmount: String,
    investingQ2BusinessDuration: String,
    investingQ2AverageCashPerYear: String,
    investingQ3: String,
    investingQ4: String,
    investingQ4CashBackDate: String,
    investingQ4CashBackDuration: String,
    investingQ5: String,
    investingQ6: String,
    investingQ7: String,
    investingQ8: String,
    payableCycleDays: { type: Number, default: 30 },
  },
  { timestamps: true },
)

export default mongoose.model<IInvestingQuestionnaire>('InvestingQuestionnaire', questionnaireSchema)
