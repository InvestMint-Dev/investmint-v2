import mongoose, { Document, Schema } from 'mongoose'

export interface ICompanyInformation extends Document {
  user_id: mongoose.Types.ObjectId
  companyName: string
  email: string
  phoneNumber: string
  streetAddress: string
  city: string
  province: string
  postalCode: string
  country: string
  authPersonnel: {
    firstName: string
    lastName: string
    phoneNumber: string
  }[]
  companyBankAccounts: {
    bank: string
    accountNumber: string
    bankerName: string
    currency: string
    currentInterestRate: string
  }[]
  investmentAdvisors?: {
    broker: string
    investmentAccountNumber: string
    advisorName: string
    investmentCurrency: string
    investmentInterestRate: string
  }[]
}

const companySchema = new Schema<ICompanyInformation>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: String,
    email: String,
    phoneNumber: String,
    streetAddress: String,
    city: String,
    province: String,
    postalCode: String,
    country: String,
    authPersonnel: [
      {
        firstName: String,
        lastName: String,
        phoneNumber: String,
      },
    ],
    companyBankAccounts: [
      {
        bank: String,
        accountNumber: String,
        bankerName: String,
        currency: String,
        currentInterestRate: String,
      },
    ],
    investmentAdvisors: [
      {
        broker: String,
        investmentAccountNumber: String,
        advisorName: String,
        investmentCurrency: String,
        investmentInterestRate: String,
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.model<ICompanyInformation>('CompanyInformation', companySchema)
