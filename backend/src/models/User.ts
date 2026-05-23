import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  email: string
  password: string
  role: 'client' | 'advisor'
  data_from: string
  advisorId?: mongoose.Types.ObjectId
  companyInformation?: mongoose.Types.ObjectId
  investingQuestionnaire?: mongoose.Types.ObjectId
  passwordResetToken?: string
  passwordResetExpires?: Date
  comparePassword(candidate: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['client', 'advisor'], default: 'client' },
    data_from: { type: String, default: 'null' },
    advisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    companyInformation: { type: Schema.Types.ObjectId, ref: 'CompanyInformation' },
    investingQuestionnaire: { type: Schema.Types.ObjectId, ref: 'InvestingQuestionnaire' },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(userSchema as any).pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model<IUser>('User', userSchema)
