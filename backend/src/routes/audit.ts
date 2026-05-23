import { Router, Request, Response } from 'express'
import AuditEntry from '../models/AuditEntry'

const router = Router()

// GET /api/audit/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId)
    const entries = await AuditEntry.find({ user_id: userId }).sort({ date: -1 })
    res.json({ data: entries })
  } catch (err) {
    console.error('[audit GET]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/audit/:userId
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { action, actor, detail, date } = req.body
    const entry = await AuditEntry.create({
      user_id: String(req.params.userId),
      action,
      actor,
      detail,
      date: date ? new Date(date) : new Date(),
    })
    res.status(201).json({ data: entry })
  } catch (err) {
    console.error('[audit POST]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/audit/:entryId
router.delete('/entry/:entryId', async (req: Request, res: Response) => {
  try {
    await AuditEntry.findByIdAndDelete(req.params.entryId)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
