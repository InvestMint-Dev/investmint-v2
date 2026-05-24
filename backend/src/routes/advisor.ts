import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'
import User from '../models/User'
import CompanyInformation from '../models/CompanyInformation'
import ETFRecommendation from '../models/ETFRecommendation'
import RebalancingAlert from '../models/RebalancingAlert'
import InvestingQuestionnaire from '../models/InvestingQuestionnaire'
import AuditEntry from '../models/AuditEntry'
import AdvisoryActivity from '../models/AdvisoryActivity'

const router = Router()

// GET /api/advisor/:advisorId/clients — all clients assigned to this advisor
router.get('/:advisorId/clients', async (req: Request, res: Response) => {
  try {
    const clients = await User.find({ advisorId: req.params.advisorId, $or: [{ role: 'client' }, { role: { $exists: false } }] })
      .select('-password -passwordResetToken')
    const enriched = await Promise.all(clients.map(async (client) => {
      const company = await CompanyInformation.findOne({ user_id: client._id })
      const alertCount = await RebalancingAlert.countDocuments({ user_id: client._id, dismissed: false })
      const lastAudit = await AuditEntry.findOne({ user_id: client._id.toString() }).sort({ date: -1 })
      return {
        ...client.toObject(),
        companyName: company?.companyName || null,
        activeAlerts: alertCount,
        lastActivity: lastAudit?.date || null,
      }
    }))
    res.json({ data: enriched })
  } catch (err) {
    console.error('[advisor clients]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/advisor/:advisorId/client/:clientId — full detail for one client
router.get('/:advisorId/client/:clientId', async (req: Request, res: Response) => {
  try {
    const client = await User.findOne({ _id: req.params.clientId })
      .select('-password -passwordResetToken')
    if (!client) { res.status(404).json({ message: 'Client not found' }); return }

    const [company, etfs, alerts, audit, activity] = await Promise.all([
      CompanyInformation.findOne({ user_id: client._id }),
      ETFRecommendation.find({ user_id: client._id }),
      RebalancingAlert.find({ user_id: client._id }).sort({ createdAt: -1 }),
      AuditEntry.find({ user_id: client._id.toString() }).sort({ date: -1 }),
      AdvisoryActivity.find({ user_id: client._id.toString() }).sort({ date: -1 }),
    ])

    res.json({ data: { client, company, etfs, alerts, audit, activity } })
  } catch (err) {
    console.error('[advisor client detail]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/advisor/assign — assign a client to an advisor
router.put('/assign', async (req: Request, res: Response) => {
  try {
    const { clientId, advisorId } = req.body
    await User.findByIdAndUpdate(clientId, { advisorId })
    res.json({ message: 'Client assigned' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/advisor/clients/all — list all client accounts with their assigned advisor
router.get('/clients/all', async (req: Request, res: Response) => {
  try {
    const clients = await User.find({ $or: [{ role: 'client' }, { role: { $exists: false } }] })
      .select('email advisorId data_from companyInformation')
    const enriched = await Promise.all(clients.map(async (client) => {
      const company = await CompanyInformation.findOne({ user_id: client._id }).select('companyName')
      return { ...client.toObject(), companyName: company?.companyName || null }
    }))
    res.json({ data: enriched })
  } catch (err) {
    console.error('[advisor clients all]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/advisor/all — list all advisor accounts
router.get('/all', async (req: Request, res: Response) => {
  try {
    const advisors = await User.find({ role: 'advisor' }).select('-password -passwordResetToken')
    res.json({ data: advisors })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/advisor/create — create a new advisor account (advisor-only action)
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
      return
    }
    const existing = await User.findOne({ email })
    if (existing) {
      // Already exists — just promote to advisor
      existing.role = 'advisor'
      await existing.save()
      res.json({ message: 'Existing account promoted to advisor', userId: existing._id })
      return
    }
    const advisor = await User.create({ email, password, role: 'advisor', data_from: 'advisor' })
    res.status(201).json({ message: 'Advisor account created', userId: advisor._id })
  } catch (err) {
    console.error('[advisor create]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/advisor/user/:userId — delete user and all associated documents
router.delete('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: 'Invalid user ID' }); return
    }
    const objectId = new mongoose.Types.ObjectId(userId)
    const userIdStr = userId

    await Promise.all([
      CompanyInformation.deleteMany({ user_id: objectId }),
      ETFRecommendation.deleteMany({ user_id: objectId }),
      RebalancingAlert.deleteMany({ user_id: objectId }),
      InvestingQuestionnaire.deleteMany({ user_id: objectId }),
      AuditEntry.deleteMany({ user_id: userIdStr }),
      AdvisoryActivity.deleteMany({ user_id: userIdStr }),
    ])
    await User.findByIdAndDelete(objectId)

    res.json({ message: 'User and all associated data deleted' })
  } catch (err) {
    console.error('[advisor delete user]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/advisor/promote — promote an existing user to advisor by email
router.post('/promote', async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) { res.status(400).json({ message: 'Email is required' }); return }
    const user = await User.findOne({ email })
    if (!user) { res.status(404).json({ message: 'No account found with that email' }); return }
    user.role = 'advisor'
    await user.save()
    res.json({ message: 'User promoted to advisor', userId: user._id })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
