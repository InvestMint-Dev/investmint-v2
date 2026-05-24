import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import companyRoutes from './routes/companyInformation'
import questionnaireRoutes from './routes/investingQuestionnaire'
import recommendationRoutes from './routes/recommendations'
import alertRoutes from './routes/recommendations'
import dataCollectionRoutes from './routes/dataCollection'
import auditRoutes from './routes/audit'
import advisoryActivityRoutes from './routes/advisoryActivity'
import advisorRoutes from './routes/advisor'
import accountRoutes from './routes/accounts'
import transactionRoutes from './routes/transactions'
import reportRoutes from './routes/reports'
import analysisRoutes from './routes/analysis'
import classificationRoutes from './routes/classifications'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/companyInformation', companyRoutes)
app.use('/api/investingQuestionnaire', questionnaireRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/rebalancingAlerts', alertRoutes)
app.use('/api/dataCollection', dataCollectionRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/advisoryActivity', advisoryActivityRoutes)
app.use('/api/advisor', advisorRoutes)
app.use('/', accountRoutes)
app.use('/', transactionRoutes)
app.use('/', reportRoutes)
app.use('/', analysisRoutes)
app.use('/', classificationRoutes)

// Connect to MongoDB and start server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/investmint-v2'

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`🚀 InvestMint V2 backend running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

export default app
