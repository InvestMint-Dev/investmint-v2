# InvestMint V2 — Technical Documentation

## Product Overview

InvestMint is the **Cash Operating System for Entrepreneurs** — institutional-grade cash management infrastructure for businesses past $5M revenue. The platform organizes around four operating layers that map directly to the app's navigation.

| Layer | Route | What it does |
|-------|-------|--------------|
| Intelligence | `/cash-flow` | AI cash forecasting (ARIMA, LSTM, STL) |
| Execution | `/screener` | Proprietary ETF screener calibrated to the user's profile |
| Governance | `/vault` | ClientVault — policy docs, ALM strategy, audit trail |
| Human | `/advisory` | Former capital markets executives as an advisory layer |

---

## Architecture

Three servers must run simultaneously for full functionality.

| Server | Directory | Port | Responsibilities |
|--------|-----------|------|-----------------|
| V2 Backend | `investmint-v2/backend` | 8000 | Auth, onboarding, ETF screener, rebalancing alerts, advisor portal |
| Cash Flow Backend | `cash-flow-backend/backend` | 4000 | Accounts, transactions, ARIMA/LSTM/STL reports |
| Frontend | `investmint-v2/frontend` | 5173 | Full UI — talks to both backends simultaneously |

### How to Start

**Requires Node.js 18+.** Use `nvm use 20` (or 18) before starting the V2 backend. Node versions 18, 20, and 22 are installed via nvm.

```bash
# Terminal 1 — V2 Backend
cd investmint-v2/backend
nvm use 20
npm run dev          # runs on port 8000

# Terminal 2 — Cash Flow Backend
cd cash-flow-backend/backend
nvm use 20
npm run dev          # runs on port 4000

# Terminal 3 — Frontend
cd investmint-v2/frontend
npm run dev          # runs on port 5173
```

> **Why Node 18+?** Mongoose 9 and MongoDB driver 7 use the global Web Crypto API (`globalThis.crypto`) which is only available in Node 18+. The backend will fail to connect to MongoDB on Node 16.

---

## Frontend

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + React Router v6 + TanStack Query v5 + React Hook Form + Zod + Recharts + Sonner (toasts)

### Role-Based Routing

The app serves two distinct user types from the same codebase. Role is stored on the `User` document as `role: 'client' | 'advisor'`.

| Route guard | Who it allows | Redirect if denied |
|-------------|---------------|--------------------|
| `ClientOnlyRoute` | Clients only | → `/advisor/clients` |
| `ProtectedRoute` | Any authenticated user | → `/login` |
| `AuthRoute` | Unauthenticated only | → `/dashboard` or `/advisor/clients` |

Advisors logging in are sent directly to `/advisor/clients`. They cannot access any client-side routes.

### Pages

#### Auth
| Page | Path | Notes |
|------|------|-------|
| Login | `/login` | JWT stored in localStorage; role-aware redirect after login |
| Signup | `/signup` | Creates client account, stores token, redirects to onboarding |
| Forgot Password | `/forgot-password` | Sends reset link via Gmail SMTP |

#### Onboarding (`/onboarding`)
4-step wizard — client accounts only. Blocked for advisors.

| Step | What it collects |
|------|-----------------|
| 1 — Company Info | Company name, address, authorized personnel, bank accounts, investment advisors |
| 2 — Bank Accounts | Review of saved bank accounts |
| 3 — Investment Profile | 8-question risk/liquidity questionnaire |
| 4 — Cash Flow Connect | Excel upload for accounts and transactions |

#### Client App (inside `AppLayout`)
| Page | Route | Data source |
|------|-------|-------------|
| Dashboard | `/dashboard` | Portfolio performance (mock curve); ETF recommendations from DB; rebalancing alerts from DB |
| Cash Flow | `/cash-flow` | Live from cash-flow backend (port 4000) |
| Intelligence | `/intelligence` | Placeholder |
| Screener | `/screener` | ETF recommendations from V2 backend |
| ClientVault | `/vault` | Documents/ALM (mock); Audit Trail (real — `auditentries` collection) |
| Advisory | `/advisory` | Advisory activity log (real — `advisoryactivities` collection); advisor profiles (mock) |
| Settings | `/settings` | Profile, company info, change password |

#### Advisor Portal (inside `AppLayout`, advisor role only)
| Page | Route | Data source |
|------|-------|-------------|
| My Clients | `/advisor/clients` | `GET /api/advisor/:advisorId/clients` — real DB |
| Client Detail | `/advisor/clients/:clientId` | `GET /api/advisor/:advisorId/client/:clientId` — real DB |
| Manage Advisors | `/advisor/manage` | Advisor CRUD + client assignment — real DB |

### API Clients (`src/lib/api.ts`)

Two Axios instances — both attach `Bearer <token>` on every request.

```
bankingApi  →  http://localhost:8000  (V2 backend)
cashflowApi →  http://localhost:4000  (cash-flow backend)
```

The `handle401` interceptor skips redirect when the user is already on `/login` or `/signup` — prevents the login form from hard-reloading on a wrong-password attempt.

### Auth Flow

1. Login/signup stores `userId`, `token`, and `role` in localStorage
2. `AuthContext` reads `userId` from localStorage and fetches the full user object
3. `isAdvisor = user?.role === 'advisor'` — used by route guards and sidebar
4. Sidebar renders `ADVISOR_NAV_GROUPS` or `CLIENT_NAV_GROUPS` based on `isAdvisor`

---

## V2 Backend

**Stack:** Express + TypeScript + MongoDB (Mongoose 9) + JWT + bcrypt

### Routes

#### `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Create client account — returns `{ userId, data_from, token, role }` |
| POST | `/login` | Authenticate — returns `{ userId, data_from, token, role }` |
| GET | `/:userId` | Fetch user by ID |
| PUT | `/update-data-from/:userId` | Set `data_from` after onboarding |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password via token |
| POST | `/change-password` | Change password (requires current password) |

#### `/api/companyInformation`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/:userId` | Create or overwrite company info |
| PATCH | `/:userId` | Partial update |
| GET | `/:userId` | Fetch company info |

#### `/api/investingQuestionnaire`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/:userId` | Create or update questionnaire |
| GET | `/:userId` | Fetch questionnaire |

#### `/api/dataCollection`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/run-etf-script?userId=` | Score and return ETF recommendations |

#### `/api/recommendations`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/save` | Save ETF recommendations |
| GET | `/performance/:userId` | Portfolio performance timeseries |

#### `/api/rebalancingAlerts`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:userId` | List alerts |
| POST | `/:id/dismiss` | Dismiss an alert |

#### `/api/audit` *(new)*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:userId` | Fetch all audit entries for a user, sorted newest first |
| POST | `/:userId` | Create audit entry `{ action, actor, detail, date }` |
| DELETE | `/entry/:entryId` | Delete a specific entry |

#### `/api/advisoryActivity` *(new)*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:userId` | Fetch all advisory activities, sorted newest first |
| POST | `/:userId` | Create activity `{ type, title, advisor, status, notes, date }` |
| PATCH | `/entry/:id` | Update activity status or notes |

#### `/api/advisor` *(new)*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/clients/all` | All client accounts with advisor assignment |
| GET | `/all` | All advisor accounts |
| GET | `/:advisorId/clients` | Clients assigned to a specific advisor (enriched) |
| GET | `/:advisorId/client/:clientId` | Full client detail — company, ETFs, alerts, audit, activity |
| PUT | `/assign` | Assign a client to an advisor `{ clientId, advisorId }` |
| POST | `/create` | Create new advisor account (promotes if email already exists) |
| POST | `/promote` | Promote existing client account to advisor by email |
| DELETE | `/user/:userId` | Delete user and ALL associated data (cascading) |

---

## Database Schema

**Cluster:** `investmint.zytsi.mongodb.net` — **database name: `investmint`**

> The database name must be explicitly set in the MongoDB URI. Omitting it connects to the wrong default database.

### `users`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `email` | String | Unique, lowercase, trimmed |
| `password` | String | bcrypt hash, `select: false` |
| `role` | String | `'client'` (default) or `'advisor'` |
| `advisorId` | ObjectId | Ref → `users` (the advisor assigned to this client) |
| `data_from` | String | `'null'` = not onboarded; `'UNF'` = QuickBooks; `'uploaded'` = Excel |
| `companyInformation` | ObjectId | Ref → `companyinformations` |
| `investingQuestionnaire` | ObjectId | Ref → `investingquestionnaires` |
| `passwordResetToken` | String | SHA-256 hash of reset token |
| `passwordResetExpires` | Date | |
| `createdAt` / `updatedAt` | Date | Auto-managed by Mongoose timestamps |

### `companyinformations`
| Field | Type | Notes |
|-------|------|-------|
| `user_id` | ObjectId | Ref → `users` |
| `companyName` | String | |
| `email` | String | |
| `phoneNumber` | String | |
| `streetAddress` / `city` / `province` / `postalCode` / `country` | String | |
| `authPersonnel` | Array | `[{ firstName, lastName, phoneNumber }]` |
| `companyBankAccounts` | Array | `[{ bank, accountNumber, bankerName, currency, currentInterestRate }]` |
| `investmentAdvisors` | Array | `[{ broker, investmentAccountNumber, advisorName, investmentCurrency, investmentInterestRate }]` |

### `investingquestionnaires`
| Field | Type | Notes |
|-------|------|-------|
| `user_id` | ObjectId | Ref → `users` |
| `investingQ1`–`investingQ8` | String | Profile questions |
| `investingQ3` | String | Risk tolerance: `conservative` / `moderate` / `aggressive` |
| `investingQ4` | String | Liquidity horizon: `within_3m` / `3m_1y` / `1y_3y` / `over_3y` |
| `payableCycleDays` | Number | Default 30 |

### `etfrecommendations`
| Field | Type | Notes |
|-------|------|-------|
| `user_id` | ObjectId | Ref → `users` |
| `ticker` | String | e.g. `ZAG`, `CSAV` |
| `name` | String | Full ETF name |
| `yield` | Number | % |
| `returns1y` / `returns3y` | Number | % |
| `volatility` | Number | % |
| `expenseRatio` | Number | MER % |
| `currency` | String | Default `CAD` |
| `category` | String | `Fixed Income`, `Cash`, `Canadian Equity`, `US Equity`, `International` |
| `recommended` | Boolean | Top 5 scored for user = `true` |

### `rebalancingalerts`
| Field | Type | Notes |
|-------|------|-------|
| `user_id` | ObjectId | Ref → `users` |
| `asset` | String | ETF ticker |
| `message` | String | Alert description |
| `severity` | String | `low` / `medium` / `high` |
| `dismissed` | Boolean | Default `false` |

### `auditentries` *(new)*
| Field | Type | Notes |
|-------|------|-------|
| `user_id` | String | Client's user ID (string, not ObjectId) |
| `date` | Date | Default `Date.now` |
| `action` | String | What happened (e.g. "Portfolio Review") |
| `actor` | String | Who did it (e.g. advisor email) |
| `detail` | String | Free-text notes |
| `createdAt` / `updatedAt` | Date | |

### `advisoryactivities` *(new)*
| Field | Type | Notes |
|-------|------|-------|
| `user_id` | String | Client's user ID (string, not ObjectId) |
| `date` | Date | Default `Date.now` |
| `type` | String | `Review` / `Recommendation` / `Policy` / `Note` |
| `title` | String | Activity title |
| `advisor` | String | Advisor name/email |
| `status` | String | `scheduled` (default) / `complete` / `cancelled` |
| `notes` | String | Optional |
| `createdAt` / `updatedAt` | Date | |

### Cash-Flow Backend Collections (port 4000)
Managed by the separate cash-flow backend — not touched by V2:
- `accounts` — bank account balances from Excel upload
- `transactions` — transaction history
- `reports` — ARIMA / LSTM / STL / VOLATILITY model outputs
- `categories` — transaction categories

---

## Advisor Portal

### How advisors are created

1. **New account:** `POST /api/advisor/create` with `{ email, password }` — creates a fresh advisor account
2. **Promote existing user:** `POST /api/advisor/promote` with `{ email }` — upgrades a client account to advisor role
3. Both operations are available in the **Manage Advisors** UI at `/advisor/manage`

### How clients are assigned to advisors

1. Go to **Manage Advisors** → "Assign Client to Advisor" section
2. Select a client from the dropdown and an advisor from the second dropdown
3. Click **Assign client** — sets `advisorId` on the client's User document
4. The client immediately appears in that advisor's "My Clients" roster

### What advisors can do per client

From the client detail page (`/advisor/clients/:clientId`):

| Tab | Contents |
|-----|----------|
| Overview | Bank accounts, current balances, active rebalancing alerts |
| Screener | Read-only view of ETF recommendations (same data as client sees) |
| Audit Trail | Full log of audit entries; advisors can add new entries directly |
| Advisory | Full log of advisory activities; advisors can log new sessions |

### Cascading delete

`DELETE /api/advisor/user/:userId` removes the user and all associated documents across all collections: `companyinformations`, `etfrecommendations`, `rebalancingalerts`, `investingquestionnaires`, `auditentries`, `advisoryactivities`, and `users`. This is exposed as a trash-icon button (with confirmation modal) on both the client roster and the manage advisors list.

---

## Data Upload

### Where users can upload data

**During onboarding (Step 4):** Excel upload — two files (accounts + transactions) — calls `/addAccountExcel` and `/addTransactionsExcel` on the cash-flow backend (port 4000).

### Excel File Format

**Accounts file columns:**

| Column | Required | Description |
|--------|----------|-------------|
| `account_name` | Yes | Display name |
| `account_type` | Yes | e.g. `BANK`, `CREDIT`, `SAVINGS` |
| `account_balance` | Yes | Current balance (number) |
| `currency` | Yes | e.g. `CAD`, `USD` |
| `account_id` | No | Unique ID — auto-generated if blank |
| `status` | No | e.g. `ACTIVE` |
| `created_at` | No | ISO date or `YYYY-MM-DD` |

**Transactions file columns:**

| Column | Required | Description |
|--------|----------|-------------|
| `transaction_id` | Yes | Unique identifier |
| `created_at` | Yes | Date — `YYYY-MM-DD` or `M/D/YY` |
| `total_amount` | Yes | Amount (positive = inflow, negative = outflow) |
| `account_id` or `account_name` | Yes | Must match accounts file |
| `memo` | No | Description |
| `type` | No | Transaction type |
| `currency` | No | Currency code |
| `balance` | No | Running balance after transaction |

---

## What's Real vs. Mock

| Area | Status |
|------|--------|
| Auth (login, signup, password reset) | Real — MongoDB |
| Company info | Real — MongoDB |
| Investment questionnaire | Real — MongoDB |
| ETF recommendations | Real scoring logic; ETF universe figures are hardcoded |
| Portfolio performance chart | Generated mock curve (no live pricing) |
| Rebalancing alerts | Real — MongoDB |
| Cash flow charts (volatility, STL, ARIMA) | Real — requires cash-flow backend on port 4000 |
| ClientVault — Audit Trail | Real — `auditentries` collection |
| Advisory — Activity Log | Real — `advisoryactivities` collection |
| ClientVault — Documents, ALM buckets | Mock |
| Advisory — Advisor profiles, bios | Mock |
| Advisor portal — client roster, detail, audit, activity | Real — MongoDB |


---

## Known Limitations / Future Work

- **Data re-upload UI:** No in-app UI to re-upload Excel files after onboarding. The backend routes exist; a "Data Source" tab in Settings is the right place to surface this.
- **ETF universe:** Yield/return figures are hardcoded in the backend scoring script, not pulled from a live data source.
- **Portfolio performance chart:** Mock curve — not tied to real pricing or holdings data.
- **Advisory profiles:** Advisor bios on the client-facing Advisory page are static mock data.
- **ClientVault documents/ALM:** Document library and ALM bucket tables are hardcoded. Real document storage would require a file storage integration (e.g. S3).
- **Canadian open banking:** No live bank connector. Excel upload is the current data ingestion path. Flinks is the recommended integration for Canadian open banking when ready.
