import { Router, Request, Response } from 'express'
import InvestingQuestionnaire from '../models/InvestingQuestionnaire'
import User from '../models/User'

const router = Router()

// POST /api/investingQuestionnaire/:userId
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    let q = await InvestingQuestionnaire.findOne({ user_id: userId })

    if (q) {
      Object.assign(q, req.body)
      await q.save()
    } else {
      q = await InvestingQuestionnaire.create({ ...req.body, user_id: userId })
      await User.findByIdAndUpdate(userId, { investingQuestionnaire: q._id })
    }

    res.json({ data: q, message: 'Saved' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/investingQuestionnaire/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const q = await InvestingQuestionnaire.findOne({ user_id: req.params.userId })
    if (!q) { res.status(404).json({ message: 'Not found' }); return }
    res.json({ data: q })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
