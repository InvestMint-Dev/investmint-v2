import { Router, Request, Response } from 'express'
import ClassificationModel from '../models/Classification'

const router = Router()

router.post('/saveClassifications', async (req: Request, res: Response) => {
  const { userId, classifications } = req.body
  if (!userId || !Array.isArray(classifications)) return res.status(400).json({ message: 'userId and classifications array required' })
  try {
    const ops = classifications.map((c) => ({
      updateOne: {
        filter: { user_id: userId, transaction_id: c.transactionId },
        update: {
          $setOnInsert: {
            user_id: userId, transaction_id: c.transactionId, memo: c.memo, amount: c.amount,
            date: c.date, proposed_account_type: c.proposedAccountType, confidence: c.confidence,
            source: c.source, status: 'pending', corrected_account_type: null,
          },
        },
        upsert: true,
      },
    }))
    await ClassificationModel.bulkWrite(ops)
    return res.status(200).json({ saved: classifications.length })
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.get('/getClassifications', async (req: Request, res: Response) => {
  const { userId, status } = req.query as { userId: string; status?: string }
  if (!userId) return res.status(400).json({ message: 'userId required' })
  try {
    const filter: any = { user_id: userId }
    if (status) filter.status = status
    const items = await ClassificationModel.find(filter).sort({ confidence: 1 }).limit(50).lean()
    return res.status(200).json(items)
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.post('/reviewClassification', async (req: Request, res: Response) => {
  const { classificationId, status, correctedAccountType } = req.body
  if (!classificationId || !status) return res.status(400).json({ message: 'classificationId and status required' })
  try {
    const update: any = { status }
    if (correctedAccountType) update.corrected_account_type = correctedAccountType
    const item = await ClassificationModel.findByIdAndUpdate(classificationId, update, { new: true })
    if (!item) return res.status(404).json({ message: 'Classification not found' })
    return res.status(200).json(item)
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

export default router
