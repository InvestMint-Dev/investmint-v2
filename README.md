# InvestMint V2

## Overview

V2 uses **three servers**. You need all three for full functionality.

| Server | Directory | Port | What it handles |
|--------|-----------|------|-----------------|
| V2 Frontend | `recreation/frontend` | 5173 | The entire UI |
| V2 Backend | `recreation/backend` | 8000 | Auth, company info, onboarding, ETF screener, rebalancing alerts |
| Cash Flow Backend | `cash-flow-backend/backend` | 4000 | Accounts, transactions, ARIMA/LSTM/STL reports, QuickBooks sync |

> The cash-flow backend is **not** merged into the V2 backend. It stays separate because the Python ML pipeline (Airflow, ARIMA, LSTM, STL) lives there. The V2 frontend talks to both backends simultaneously — port 8000 for auth/investing, port 4000 for cash flow analytics.

---

## Running locally

You need **Node 20**. If you use nvm, run `nvm use 20` in each terminal.

### Terminal 1 — V2 Backend (auth + investing)

```bash
cd recreation/backend
npx ts-node src/index.ts
```

Starts on `http://localhost:8000`. You should see:
```
✅ Connected to MongoDB
🚀 InvestMint V2 backend running on port 8000
```

### Terminal 2 — Cash Flow Backend (analytics)

```bash
cd cash-flow-backend/backend
yarn run dev
```

Starts on `http://localhost:4000`. Required for the Intelligence Layer, Execution screener data, and Cash Flow pages to show real data. If it's not running, those pages fall back to mock data gracefully.

### Terminal 3 — Frontend

```bash
cd recreation/frontend
npm run dev
```

Opens at `http://localhost:5173`.

---

## Cash Flow

The cash-flow backend's routes (accounts, transactions, reports) are **intentionally left separate** in V2 — the Python Airflow pipeline that generates ARIMA/LSTM/STL forecasts is tightly coupled to that backend. Merging would require porting the Python scripts too. For now the V2 frontend speaks to both backends and that works fine.

If you want to merge them in the future, the cash-flow routes to move are:
- `/getAccounts`, `/updateAccounts`, `/addAcountExcel`
- `/getTransactions`, `/addTransactions`, `/addTransactionsExcel`, `/addCatogoriesExcel`
- `/getReports`, `/getTempReport`, `/getForecast`, `/createReport`, `/uploadForecast`
- `/createAuth`, `/runPythonScript`
