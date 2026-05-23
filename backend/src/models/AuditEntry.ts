import mongoose, { Document, Schema } from 'mongoose'

export interface IAuditEntry extends Document {
  user_id: string
  date: Date
  action: string
  actor: string
  detail: string
}

const auditEntrySchema = new Schema<IAuditEntry>(
  {
    user_id: { type: String, required: true },
    date: { type: Date, default: Date.now },
    action: { type: String, required: true },
    actor: { type: String, required: true },
    detail: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.model<IAuditEntry>('AuditEntry', auditEntrySchema)
