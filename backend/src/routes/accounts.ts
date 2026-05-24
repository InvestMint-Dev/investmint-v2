import { Router, Request, Response } from 'express'
import multer from 'multer'
import { AccountService } from '../services/accountService'
import AccountModel, { AccountDTO } from '../models/Account'
import { parseExcelFile } from '../utils/excel'

const router = Router()
const accountService = new AccountService()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/addAccountExcel', upload.single('data'), async (req: Request, res: Response) => {
  const { userId } = req.body
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  const data = parseExcelFile(req.file.buffer)
  try {
    for (const acc of data) {
      const account: AccountDTO = {
        user_id: userId,
        account_type: acc.account_type,
        account_name: acc.account_name,
        currency: acc.currency,
        account_balance: acc.account_balance || null,
        account_id: acc.account_id || crypto.randomUUID(),
        created_at: acc.created_at || null,
        updated_at: acc.updated_at || null,
        status: acc.status || null,
      }
      await accountService.createAccount(account)
    }
    return res.status(200).json({ message: 'Accounts added successfully' })
  } catch (error) {
    console.error('[addAccountExcel]', error)
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.post('/getAccounts', async (req: Request, res: Response) => {
  const { userId } = req.body
  try {
    const accounts = await accountService.getAccounts(userId)
    return res.status(200).json({ data: accounts })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.put('/updateAccount', async (req: Request, res: Response) => {
  const { userId, account_id, account_name, account_type, account_balance, currency, status } = req.body
  if (!userId || !account_id) return res.status(400).json({ message: 'userId and account_id are required' })
  try {
    const account: AccountDTO = {
      user_id: userId, account_id,
      account_name: account_name ?? null,
      account_type: account_type ?? null,
      account_balance: account_balance != null ? parseFloat(account_balance) : null,
      currency: currency ?? null,
      status: status ?? null,
      created_at: null,
      updated_at: new Date(),
    }
    const result = await accountService.updateAccount(account)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.delete('/deleteAccount', async (req: Request, res: Response) => {
  const { userId, account_id } = req.body
  if (!userId || !account_id) return res.status(400).json({ message: 'userId and account_id are required' })
  try {
    await AccountModel.deleteOne({ user_id: userId, account_id })
    return res.status(200).json({ message: 'Account deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

export default router
