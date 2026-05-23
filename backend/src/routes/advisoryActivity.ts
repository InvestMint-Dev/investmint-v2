import { Router, Request, Response } from 'express'
import AdvisoryActivity from '../models/AdvisoryActivity'

const router = Router()

// GET /api/advisoryActivity/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId)
    const activities = await AdvisoryActivity.find({ user_id: userId }).sort({ date: -1 })
    res.json({ data: activities })
  } catch (err) {
    console.error('[advisoryActivity GET]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/advisoryActivity/:userId
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { type, title, advisor, status, notes, date } = req.body
    const activity = await AdvisoryActivity.create({
      user_id: String(req.params.userId),
      type,
      title,
      advisor,
      status: status || 'scheduled',
      notes,
      date: date ? new Date(date) : new Date(),
    })
    res.status(201).json({ data: activity })
  } catch (err) {
    console.error('[advisoryActivity POST]', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/advisoryActivity/entry/:id
router.patch('/entry/:id', async (req: Request, res: Response) => {
  try {
    const activity = await AdvisoryActivity.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ data: activity })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
