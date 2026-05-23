# InvestMint V2 — Running the System

## Overview: what's running what

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

## Signing in

Use the same email and password you registered with — both the V2 backend and the original backend point to the **same MongoDB Atlas cluster**, so existing accounts work. If you get "invalid email or password", the most common cause is that the V2 backend isn't running yet (Terminal 1 above).

---

## Environment variables

Both `.env` files are already populated in the repo for local development. If you need to reset them:

**`recreation/backend/.env`**
```
PORT=8000
MONGO_URI=mongodb+srv://developer:developer@investmint.zytsi.mongodb.net/investmint?retryWrites=true&w=majority&appName=InvestMint
JWT_SECRET=investmint-v2-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

**`recreation/frontend/.env`**
```
VITE_BANKING_API_URL=http://localhost:8000
VITE_CASHFLOW_API_URL=http://localhost:4000
VITE_UNIFIED_WORKSPACE_ID=679cf39ee3233e402a579aa8
```

**`cash-flow-backend/backend/.env`** (from the original setup doc)
```
MONGO_URI=mongodb+srv://developer:developer@investmint.zytsi.mongodb.net/investmint?retryWrites=true&w=majority&appName=InvestMint
PORT=4000
UNIFIED_BASE_API_URL=https://api.unified.to/accounting/
UNIFIED_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzljZjM5ZWUzMjMzZTQwMmE1NzlhYTQiLCJ3b3Jrc3BhY2VfaWQiOiI2NzljZjM5ZWUzMjMzZTQwMmE1NzlhYTgiLCJpYXQiOjE3MzgzMzkyMzB9.Oad4ZWU8XMC8agc-lNADESrZj21d5AN3LwMMx05og5I
CATEGORY_ACCOUNT=account
CATEGORY_TRANSACTION=transaction
CATEGORY_JOURNAL=journal
CATEGORY_INVOICE=invoice
```

---

## What's not yet merged

The cash-flow backend's routes (accounts, transactions, reports) are **intentionally left separate** in V2 — the Python Airflow pipeline that generates ARIMA/LSTM/STL forecasts is tightly coupled to that backend. Merging would require porting the Python scripts too. For now the V2 frontend speaks to both backends and that works fine.

If you want to merge them in the future, the cash-flow routes to move are:
- `/getAccounts`, `/updateAccounts`, `/addAcountExcel`
- `/getTransactions`, `/addTransactions`, `/addTransactionsExcel`, `/addCatogoriesExcel`
- `/getReports`, `/getTempReport`, `/getForecast`, `/createReport`, `/uploadForecast`
- `/createAuth`, `/runPythonScript`
