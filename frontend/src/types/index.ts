export interface User {
  _id: string
  email: string
  role: 'client' | 'advisor'
  data_from: 'null' | 'UNF' | 'uploaded' | null
  advisorId?: string
  companyInformation?: string
  investingQuestionnaire?: string
}

export interface AuditEntry {
  _id: string
  user_id: string
  date: string
  action: string
  actor: string
  detail: string
}

export interface AdvisoryActivity {
  _id: string
  user_id: string
  date: string
  type: 'Review' | 'Recommendation' | 'Policy' | 'Note'
  title: string
  advisor: string
  status: 'complete' | 'scheduled' | 'cancelled'
  notes?: string
}

export interface AdvisorClient {
  _id: string
  email: string
  companyName: string | null
  data_from: string
  activeAlerts: number
  lastActivity: string | null
}

export interface CompanyInformation {
  _id?: string
  email: string
  phoneNumber: string
  companyName: string
  streetAddress: string
  city: string
  province: string
  postalCode: string
  country: string
  authPersonnel: AuthPersonnel[]
  companyBankAccounts: BankAccount[]
  investmentAdvisors?: InvestmentAdvisor[]
}

export interface AuthPersonnel {
  firstName: string
  lastName: string
  phoneNumber: string
}

export interface BankAccount {
  bank: string
  accountNumber: string
  bankerName: string
  currency: 'CAD' | 'USD'
  currentInterestRate: string
}

export interface InvestmentAdvisor {
  broker: string
  investmentAccountNumber: string
  advisorName: string
  investmentCurrency: 'CAD' | 'USD'
  investmentInterestRate: string
}

export interface InvestingQuestionnaire {
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
  payableCycleDays?: number
}

export interface ETFRecommendation {
  ticker: string
  name: string
  yield: number
  returns1y: number
  returns3y: number
  volatility: number
  expenseRatio: number
  currency: 'CAD' | 'USD'
  category: string
  recommended?: boolean
}

export interface PortfolioPerformance {
  date: string
  value: number
  benchmark: number
}

export interface RebalancingAlert {
  _id: string
  message: string
  severity: 'low' | 'medium' | 'high'
  asset: string
  dismissed: boolean
  createdAt: string
}

export interface Account {
  _id?: string
  user_id: string
  account_name: string | null
  account_type: AccountType | null
  account_balance: number | null
  account_id: string | null
  currency: string | null
}

export type AccountType =
  | 'ACCOUNTS_PAYABLE'
  | 'ACCOUNTS_RECEIVABLE'
  | 'BANK'
  | 'CREDIT_CARD'
  | 'FIXED_ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'EXPENSE'
  | 'REVENUE'
  | 'OTHER'

export type ReportModelType =
  | 'STL_TREND'
  | 'STL_SEASONAL'
  | 'STL_RESID'
  | 'ARIMA'
  | 'LSTM'
  | 'BALANCE'
  | 'VOLATILITY'
  | 'FORECAST'

export interface Report {
  _id?: string
  user_id: string
  model_type: ReportModelType
  start_date: string
  end_date: string
  data: Record<string, number[]>
}

export interface AuthResponse {
  userId: string
  data_from: string
  message?: string
}
