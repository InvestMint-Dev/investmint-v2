// @ts-nocheck
import { Router, Request, Response } from 'express'
import multer from 'multer'
import { ReportsService } from '../services/reportService'
import { TransactionsService } from '../services/transactionsService'
import { Transactions } from '../models/Transaction'
import { parseExcelFile, daysBetweenDates } from '../utils/excel'

const router = Router()
const reportService = new ReportsService()
const transactionService = new TransactionsService()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/createReport', async (req: Request, res: Response) => {
  const { userId, model_type, data, startDate, endDate } = req.body
  try {
    const report = await reportService.createReport({
      user_id: userId.toString(),
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      model_type,
      data,
    })
    return res.status(200).json(report)
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.get('/getReports', async (req: Request, res: Response) => {
  const { userId, types, startDate, endDate } = req.query as { userId: string; types: string | string[]; startDate: string; endDate: string }
  try {
    const typeList = Array.isArray(types) ? types : [types]
    const response: Record<string, any> = {}
    for (const type of typeList) {
      try {
        const report = await reportService.getReport(userId, type as any, startDate, endDate)
        const reportData = report.data instanceof Map ? Object.fromEntries(report.data) : report.data
        response[type] = {
          ...report,
          start_date: new Date(report.start_date).toISOString(),
          end_date: new Date(report.end_date).toISOString(),
          data: reportData,
        }
      } catch { /* report not available yet — skip */ }
    }
    return res.status(200).json(response)
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.get('/getTempReport', async (req: Request, res: Response) => {
  const { userId, startDate, endDate, accountType } = req.query as { userId: string; startDate: string; endDate: string; accountType: string }
  try {
    const report: Record<string, number> = {}
    let currentDate = new Date(startDate)
    const lastDate = new Date(endDate)
    while (currentDate <= lastDate) {
      const transactions: Transactions[] = await transactionService.getTransactionsByDate(userId, currentDate)
      for (const transaction of transactions) {
        for (const item of (transaction.category || [])) {
          if (item.account_type === accountType && item.total_amount < 0) {
            report[item.account_name] = (report[item.account_name] || 0) - item.total_amount
          }
        }
      }
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }
    return res.status(200).json(report)
  } catch (error: any) {
    return res.status(500).json({ error: `${error}`, message: 'Internal server error' })
  }
})

router.get('/getForecast', async (req: Request, res: Response) => {
  const { userId, startDate, endDate } = req.query as { userId: string; startDate: string; endDate: string }
  try {
    const report = await reportService.getReport(userId, 'VOLATILITY', startDate, endDate)
    let startDateBound = new Date(startDate)
    const reportValues: Record<string, number[]> = {}

    if (!(report.data instanceof Map)) throw new Error('report.data is not a Map')

    if (startDateBound <= report.end_date) {
      const start = daysBetweenDates(startDateBound, report.start_date) - 1
      let end: number
      const dataLength = report.data.get('TOTAL').length
      if (report.end_date > new Date(endDate)) {
        end = dataLength - daysBetweenDates(report.end_date, new Date(endDate))
        startDateBound = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
      } else {
        end = dataLength
        startDateBound = new Date(report.end_date.getTime() + 24 * 60 * 60 * 1000)
      }
      for (const [key, value] of report.data.entries()) {
        if (Array.isArray(value)) reportValues[key] = value.slice(start, end)
      }
    }

    const uploadedReport = await reportService.getForecastReport(userId, startDateBound.toISOString(), endDate, [...report.data.keys()])
    for (const key of Object.keys(uploadedReport)) {
      reportValues[key] = (reportValues[key] || []).concat(uploadedReport[key] || [])
    }
    return res.status(200).json({ start_date: startDate, end_date: endDate, data: reportValues, type: 'FORECAST' })
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.get('/getIdleCapital', async (req: Request, res: Response) => {
  const { userId, minCashFloor, payableCycleDays } = req.query as { userId: string; minCashFloor?: string; payableCycleDays?: string }
  if (!userId) return res.status(400).json({ message: 'userId is required' })

  const floor = parseFloat(minCashFloor || '0')
  const cycleDays = parseInt(payableCycleDays || '30', 10)

  try {
    const [arimaReport, volatilityReport, stlSeasonalReport, arimaUpperReport, arimaLowerReport, driversReport] =
      await Promise.all([
        reportService.getReport(userId, 'ARIMA').catch(() => null),
        reportService.getReport(userId, 'VOLATILITY').catch(() => null),
        reportService.getReport(userId, 'STL_SEASONAL').catch(() => null),
        reportService.getReport(userId, 'ARIMA_UPPER').catch(() => null),
        reportService.getReport(userId, 'ARIMA_LOWER').catch(() => null),
        reportService.getReport(userId, 'FORECAST_DRIVERS').catch(() => null),
      ])

    const toMap = (r: any): Map<string, number[]> =>
      r?.data instanceof Map ? r.data : new Map(Object.entries(r?.data || {}))

    const arimaData = toMap(arimaReport)
    const volatilityData = toMap(volatilityReport)
    const stlSeasonalData = toMap(stlSeasonalReport)
    const arimaUpperData = toMap(arimaUpperReport)
    const arimaLowerData = toMap(arimaLowerReport)
    const driversData = toMap(driversReport)

    const balanceSeries = volatilityData.get('TOTAL') || []
    const currentBalance = balanceSeries.length ? balanceSeries[balanceSeries.length - 1] : 0
    const operationalFloat = floor
    const payablesHistory = volatilityData.get('ACCOUNTS_PAYABLE') || []
    const lookback = Math.min(90, payablesHistory.length)
    const avgDailyPayables = lookback > 0 ? payablesHistory.slice(-lookback).reduce((s, v) => s + Math.abs(v), 0) / lookback : 0
    const committedPayables = avgDailyPayables * cycleDays
    const seasonalSeries = stlSeasonalData.get('TOTAL') || []
    const next30Seasonal = seasonalSeries.slice(0, 30)
    const seasonalReserve = next30Seasonal.length ? Math.max(0, -Math.min(...next30Seasonal)) : 0
    const deployableCapital = Math.max(0, currentBalance - operationalFloat - committedPayables - seasonalReserve)

    const dailyFlows = arimaData.get('TOTAL') || []
    const floorThreshold = operationalFloat + committedPayables
    let runningBalance = currentBalance
    let availableHorizonDays = dailyFlows.length
    for (let i = 0; i < dailyFlows.length; i++) {
      runningBalance += dailyFlows[i]
      if (runningBalance < floorThreshold) { availableHorizonDays = i; break }
    }

    const lowerSeries = arimaLowerData.get('TOTAL') || []
    const upperSeries = arimaUpperData.get('TOTAL') || []
    const horizonIdx = Math.min(availableHorizonDays, lowerSeries.length - 1)
    const confidenceLower = lowerSeries.length ? (lowerSeries[horizonIdx] ?? null) : null
    const confidenceUpper = upperSeries.length ? (upperSeries[horizonIdx] ?? null) : null

    const drivers: { accountType: string; pctChange: number }[] = []
    for (const [accountType, values] of driversData.entries()) {
      if (values.length && accountType !== 'TOTAL') drivers.push({ accountType, pctChange: values[0] })
    }
    drivers.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange))

    return res.status(200).json({
      deployableCapital: Math.round(deployableCapital * 100) / 100,
      operationalFloat: Math.round(operationalFloat * 100) / 100,
      committedPayables: Math.round(committedPayables * 100) / 100,
      seasonalReserve: Math.round(seasonalReserve * 100) / 100,
      currentBalance: Math.round(currentBalance * 100) / 100,
      availableHorizonDays,
      confidenceLower: confidenceLower !== null ? Math.round(confidenceLower * 100) / 100 : null,
      confidenceUpper: confidenceUpper !== null ? Math.round(confidenceUpper * 100) / 100 : null,
      drivers: drivers.slice(0, 5),
    })
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

router.post('/uploadForecast', upload.single('data'), async (req: Request, res: Response) => {
  const { userId, startDate, endDate } = req.body
  const fileBuffer = req.file?.buffer
  const data = parseExcelFile(fileBuffer)
  try {
    const reportData: Record<string, number[]> = {}
    for (const item of data) {
      if (reportData[item.account_type]) reportData[item.account_type].push(item.total_amount * -1)
      else reportData[item.account_type] = [item.total_amount * -1]
    }
    const report = await reportService.createReport({ user_id: userId, start_date: new Date(startDate), end_date: new Date(endDate), model_type: 'FORECAST', data: reportData })
    return res.status(200).json(report)
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: `${error}` })
  }
})

export default router
