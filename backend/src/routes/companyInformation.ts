import { Router, Request, Response } from 'express'
import CompanyInformation from '../models/CompanyInformation'
import User from '../models/User'

const router = Router()

// POST /api/companyInformation/:userId — create or update
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    let company = await CompanyInformation.findOne({ user_id: userId })

    if (company) {
      Object.assign(company, req.body)
      await company.save()
    } else {
      company = await CompanyInformation.create({ ...req.body, user_id: userId })
      await User.findByIdAndUpdate(userId, { companyInformation: company._id })
    }

    res.json({ data: company, message: 'Saved' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/companyInformation/:userId — update personnel and accounts
router.patch('/:userId', async (req: Request, res: Response) => {
  try {
    const company = await CompanyInformation.findOneAndUpdate(
      { user_id: req.params.userId },
      { $set: req.body },
      { new: true, upsert: true },
    )
    res.json({ data: company, message: 'Updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/companyInformation/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const company = await CompanyInformation.findOne({ user_id: req.params.userId })
    if (!company) { res.status(404).json({ message: 'Not found' }); return }
    res.json({ data: company })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
