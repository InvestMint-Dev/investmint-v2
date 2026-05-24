// @ts-nocheck
import { Router, Request, Response } from 'express'
import multer from 'multer'
import { TransactionsService } from '../services/transactionsService'
import { AccountService } from '../services/accountService'
import TransactionsModel, { TransactionsDTO } from '../models/Transaction'
import { Account } from '../models/Account'
import { parseExcelFile } from '../utils/excel'

const router = Router()
const transactionService = new TransactionsService()
const accountService = new AccountService()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/addTransactionsExcel', upload.single('data'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const data = parseExcelFile(req.file.buffer)
    const accounts: Account[] = await accountService.getAccounts(userId)

    const parseDate = (dateStr: string): string => {
      try {
        if (dateStr.includes('-') && dateStr.length >= 10) return new Date(dateStr + 'T00:00:00.000Z').toISOString()
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          let [month, day, year] = parts
          if (year.length === 2) year = parseInt(year) >= 50 ? `19${year}` : `20${year}`
          return new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T00:00:00.000Z`).toISOString()
        }
        return new Date(dateStr).toISOString()
      } catch { return new Date().toISOString() }
    }

    for (const trans of data) {
      if (!trans.transaction_id || !trans.created_at || !trans.total_amount) continue
      let account = trans.account_id
        ? accounts.find(a => a.account_id === trans.account_id)
        : accounts.find(a => a.account_name === trans.account_name)
      if (!account) continue

      await transactionService.createTransaction({
        transaction_id: trans.transaction_id,
        user_id: userId,
        created_at: parseDate(trans.created_at),
        updated_at: trans.updated_at ? parseDate(trans.updated_at) : null,
        memo: trans.memo || null,
        total_amount: typeof trans.total_amount === 'string' ? parseFloat(trans.total_amount) : trans.total_amount,
        total_amount_real: typeof trans.total_amount === 'string' ? parseFloat(trans.total_amount) : trans.total_amount,
        account_id: account.account_id,
        split_account_id: trans.split_account_id || null,
        type: trans.type || null,
        currency: trans.currency || null,
        lineitems: [],
        category: [],
        balance: trans.balance || null,
      })
    }

    const transactions = await transactionService.getTransactions(userId)
    return res.status(200).json({ data: transactions, message: 'Transactions added successfully.' })
  } catch (error) {
    console.error('[addTransactionsExcel]', error)
    return res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : `${error}` })
  }
})

router.get('/getTransactions', async (req: Request, res: Response) => {
  const { userId } = req.query
  try {
    const transactions = await transactionService.getTransactions(userId as string)
    return res.status(200).json({ data: transactions, message: 'Transactions fetched successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.get('/getTransactionsByDate', async (req: Request, res: Response) => {
  const { userId, startDate, endDate } = req.query as { userId: string; startDate: string; endDate: string }
  try {
    let transactions = []
    let currentDate = new Date(startDate)
    const lastDate = new Date(endDate)
    while (currentDate <= lastDate) {
      transactions = [...transactions, ...(await transactionService.getTransactionsByDate(userId, currentDate))]
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }
    return res.status(200).json({ data: transactions, message: 'Transactions fetched successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.post('/createManualTransaction', async (req: Request, res: Response) => {
  const { userId, created_at, memo, total_amount, account_id, type, currency } = req.body
  if (!userId || !created_at || total_amount == null) return res.status(400).json({ message: 'userId, created_at, and total_amount are required' })
  try {
    const transaction: TransactionsDTO = {
      user_id: userId,
      transaction_id: crypto.randomUUID(),
      created_at: new Date(created_at).toISOString(),
      updated_at: new Date().toISOString(),
      memo: memo ?? null,
      total_amount: parseFloat(total_amount),
      total_amount_real: parseFloat(total_amount),
      account_id: account_id ?? null,
      split_account_id: null,
      type: type ?? null,
      currency: currency ?? null,
      lineitems: [],
      category: [],
      balance: 0,
    }
    await transactionService.createTransaction(transaction)
    const all = await transactionService.getTransactions(userId)
    return res.status(201).json({ data: all, message: 'Transaction created.' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.put('/updateTransaction', async (req: Request, res: Response) => {
  const { userId, transaction_id, created_at, memo, total_amount, account_id, type, currency } = req.body
  if (!userId || !transaction_id) return res.status(400).json({ message: 'userId and transaction_id are required' })
  try {
    const existing = await TransactionsModel.findOne({ user_id: userId, transaction_id })
    if (!existing) return res.status(404).json({ message: 'Transaction not found' })
    await transactionService.updateTransaction({
      user_id: userId, transaction_id,
      created_at: created_at ? new Date(created_at).toISOString() : existing.created_at,
      updated_at: new Date().toISOString(),
      memo: memo !== undefined ? memo : existing.memo,
      total_amount: total_amount != null ? parseFloat(total_amount) : existing.total_amount,
      total_amount_real: total_amount != null ? parseFloat(total_amount) : existing.total_amount_real,
      account_id: account_id !== undefined ? account_id : existing.account_id,
      split_account_id: existing.split_account_id,
      type: type !== undefined ? type : existing.type,
      currency: currency !== undefined ? currency : existing.currency,
      lineitems: existing.lineitems,
      category: existing.category as any,
      balance: existing.balance,
    })
    return res.status(200).json({ message: 'Transaction updated.' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.delete('/deleteTransaction', async (req: Request, res: Response) => {
  const { userId, transaction_id } = req.body
  if (!userId || !transaction_id) return res.status(400).json({ message: 'userId and transaction_id are required' })
  try {
    await TransactionsModel.deleteOne({ user_id: userId, transaction_id })
    return res.status(200).json({ message: 'Transaction deleted.' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

export default router
