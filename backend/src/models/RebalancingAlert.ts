import mongoose, { Document, Schema } from 'mongoose'

export interface IRebalancingAlert extends Document {
  user_id: mongoose.Types.ObjectId
  asset: string
  message: string
  severity: 'low' | 'medium' | 'high'
  dismissed: boolean
}

const alertSchema = new Schema<IRebalancingAlert>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    asset: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dismissed: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model<IRebalancingAlert>('RebalancingAlert', alertSchema)
