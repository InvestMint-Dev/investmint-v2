import mongoose, { Document, Schema } from 'mongoose'

export interface IAdvisoryActivity extends Document {
  user_id: string
  date: Date
  type: 'Review' | 'Recommendation' | 'Policy' | 'Note'
  title: string
  advisor: string
  status: 'complete' | 'scheduled' | 'cancelled'
  notes?: string
}

const advisoryActivitySchema = new Schema<IAdvisoryActivity>(
  {
    user_id: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Review', 'Recommendation', 'Policy', 'Note'], required: true },
    title: { type: String, required: true },
    advisor: { type: String, required: true },
    status: { type: String, enum: ['complete', 'scheduled', 'cancelled'], default: 'scheduled' },
    notes: String,
  },
  { timestamps: true },
)

export default mongoose.model<IAdvisoryActivity>('AdvisoryActivity', advisoryActivitySchema)
