import mongoose, { Document, Schema } from 'mongoose'

export interface IETFRecommendation extends Document {
  user_id: mongoose.Types.ObjectId
  ticker: string
  name: string
  yield: number
  returns1y: number
  returns3y: number
  volatility: number
  expenseRatio: number
  currency: string
  category: string
  recommended: boolean
}

const etfSchema = new Schema<IETFRecommendation>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticker: String,
    name: String,
    yield: Number,
    returns1y: Number,
    returns3y: Number,
    volatility: Number,
    expenseRatio: Number,
    currency: { type: String, default: 'CAD' },
    category: String,
    recommended: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model<IETFRecommendation>('ETFRecommendation', etfSchema)
