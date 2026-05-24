# InvestMint — User Guide

## What is InvestMint?

InvestMint is the **Cash Operating System for Entrepreneurs** — built for businesses past $5M in revenue that are sitting on idle cash and not putting it to work.

Most business owners know they should be doing something smarter with cash that isn't needed immediately. InvestMint gives you the institutional-grade infrastructure to actually do it: forecast your cash needs, match idle funds to the right instruments, document your strategy, and stay supported by advisors with real capital markets experience.

**The average InvestMint client unlocks $70,000+ in annual value from cash that was previously earning nothing.**

---

## Getting Started — Onboarding

When you first sign up, InvestMint walks you through a four-step setup. You only do this once.

### Step 1 — Company Information
You'll enter your business details: company name, address, and contact information. You'll also add your **authorized personnel** (the people who are authorized to make financial decisions) and your **bank accounts** (institution name, account number, banker contact, and currency). If you already work with investment advisors, you can add them here too.

### Step 2 — Bank Accounts
Review the bank accounts you entered and confirm they're correct. This is the cash base InvestMint will work with.

### Step 3 — Investment Profile
Answer 8 short questions about your business and financial situation. These answers directly calibrate the screener — your risk tolerance, liquidity horizon, and cash timing constraints determine which instruments InvestMint recommends for you.

The questions cover:
- Your business type and cash situation
- How much cash is typically sitting idle
- Your risk tolerance (conservative / moderate / aggressive)
- When you'll need your cash back (liquidity horizon)
- Payable cycles and timing constraints

### Step 4 — Connect Your Cash Flow Data
Upload two spreadsheet files: one for your bank accounts and one for your transactions. See the **Data Upload** section below for the exact format.

---

## Data Upload — Excel Format

You'll need two `.xlsx` files: an **accounts file** and a **transactions file**.

### Accounts File

Each row is one bank account.

| Column | Description | Example |
|--------|-------------|---------|
| `account_name` | Name of the account | Main Operating Account |
| `account_type` | Type of account | BANK |
| `account_balance` | Current balance | 245000 |
| `currency` | Currency code | CAD |
| `account_id` | Your unique ID for this account | ACC-001 |
| `status` | Account status (optional) | ACTIVE |
| `created_at` | Date opened (optional) | 2022-01-15 |

The `account_id` you use here will be referenced in your transactions file — make sure they match.

### Transactions File

Each row is one transaction.

| Column | Description | Example |
|--------|-------------|---------|
| `transaction_id` | Unique ID | TXN-0001 |
| `created_at` | Transaction date | 2026-03-15 |
| `total_amount` | Amount (positive = money in, negative = money out) | 42000 |
| `account_id` or `account_name` | Which account — must match accounts file | ACC-001 |
| `memo` | Description (optional) | Quarterly payroll |
| `type` | Transaction type (optional) | CREDIT |
| `currency` | Currency code (optional) | CAD |
| `balance` | Running balance after this transaction (optional) | 287000 |

**Tips:**
- Dates can be `YYYY-MM-DD` or `M/D/YY` — both are accepted
- Include at least 6–12 months of history for the best forecast accuracy

---

## The Four Layers

InvestMint is built around four operating layers, each accessible from the left sidebar.

---

### Intelligence Layer — Cash Forecasting & Modeling

**What it is:** The engine underneath everything. InvestMint analyzes your historical transaction data to model your cash flow — separating the predictable from the volatile, identifying how much cash is genuinely idle at any point in time, and forecasting your balance over the next 12 months.

**What you'll see:**
- **Cash Flow Volatility** — Daily cash movement chart showing the natural ebb and flow of your business
- **Trend Decomposition (STL)** — Strips out seasonal patterns to reveal your underlying cash trend
- **365-Day Forecast** — ARIMA and LSTM powered forward-looking cash picture
- **Accounts** — All connected bank accounts and current balances

**Why it matters:** Most businesses manage cash reactively. InvestMint gives you a proactive view so you always know how much is idle, for how long, and against what obligations.

---

### Execution Layer — Investment Screener

**What it is:** Takes the output of the Intelligence Layer and matches idle cash to the right investment instruments — calibrated to your specific profile.

**What you'll see:**
- **Recommended instruments** — Top 5 ETFs that best match your risk tolerance, liquidity horizon, and currency preference (marked with a star)
- **Full screened universe** — All 11 ETFs ranked by fit, with yield, 1-year return, 3-year return, volatility, and MER

**The instruments covered:**

| Category | What they are |
|----------|---------------|
| Cash ETFs | High-interest savings ETFs (CASH, CSAV) — maximum liquidity, 5%+ yield |
| Fixed Income | Short-to-medium duration bond ETFs (VSB, ZST, ZAG) |
| Canadian Equity | Canadian market ETFs (XIC, XEI) |
| US Equity | S&P 500 ETFs (VFV, XUS) |
| International | Global diversification (XEF, ZDI) |

**Why it matters:** Banks offer no yield on operating cash. InvestMint gives you a clear, documented, risk-appropriate recommendation for every dollar that isn't needed in the next few days.

---

### Governance Layer — ClientVault

**What it is:** The documentation infrastructure that makes your cash strategy auditable and defensible.

**What you'll see:**
- **Document Library** — All governance documents with completion status and last-updated dates
- **Cash Management Policy** — The formal written policy governing how idle cash is managed
- **ALM Strategy** — Your cash bucketed into four tranches matched to appropriate instruments: Liquid (0–30 days), Short-term (1–6 months), Medium-term (6–18 months), Strategic (18+ months)
- **Audit Trail** — A live, timestamped record of every material decision logged by your advisor: portfolio rebalances, policy updates, screener runs, and advisory reviews

**Why it matters:** Cash management decisions without documentation are a liability. ClientVault makes every decision traceable — the same standard held by institutional treasury departments.

---

### Human Layer — Advisory

**What it is:** InvestMint's advisors are former capital markets executives from Canada's Big Six banks — people who built and ran institutional cash management programs.

**What you'll see:**
- **Your advisory team** — Profiles of your assigned advisors including backgrounds and specializations
- **Schedule a Review** — Book quarterly reviews directly from this page
- **Advisory activity** — A live log of all advisory engagements: portfolio reviews, recommendations, policy updates, and scheduled sessions

**Why it matters:** A covenant in a credit agreement, a board preference, or a fundraising timeline can override what the model recommends. Your advisors are the judgment layer.

---

## Settings

Access from the left sidebar.

- **Profile** — Your email address and data connection status
- **Company** — Review company information from onboarding
- **Security** — Change your password

---

## The Advisor Portal

Advisors log in with the same app and are automatically directed to the Advisor Portal. Clients cannot access advisor routes and advisors cannot access client routes.

### What advisors see

**My Clients** — All companies assigned to you, with:
- Company name and contact email
- Data connection status (Excel upload, QuickBooks, or not connected)
- Number of active rebalancing alerts
- Date of last advisory activity

**Client Detail** — Click any client to open a full view with four tabs:
- **Overview** — Bank accounts, balances, and active alerts
- **Screener** — Read-only view of the client's ETF recommendations
- **Audit Trail** — Full audit log; advisors can add new entries directly
- **Advisory** — Advisory activity log; advisors can log new meetings and recommendations

**Manage Advisors** — Admin functions:
- Add a new advisor account (email + temporary password)
- Promote an existing client account to advisor
- Assign clients to advisors using a dropdown selector
- Delete any account (with confirmation — cascades to all associated data)

### How clients get assigned

An advisor with access to the Manage Advisors page selects a client and an advisor from two dropdowns and clicks Assign. The client immediately appears in that advisor's roster.

---

## Frequently Asked Questions

**Does InvestMint ever move my money?**
No. InvestMint is an analysis and recommendation platform. It cannot execute trades or transfers. All investment decisions are made by you (with your advisor's guidance) through your existing brokerage.

**What happens if I skip the data connection during onboarding?**
The Intelligence Layer and Account views will not show real data. The Screener will still generate recommendations based on your investment profile, and the rest of the platform is fully functional.

**How often should I update my data?**
Monthly uploads are recommended to keep forecasts accurate.

**What does the screener recommend, and why those ETFs?**
InvestMint's universe covers 11 Canadian-listed ETFs across five categories, selected for liquidity, cost efficiency, and suitability for corporate cash management. The recommendation is personalized to your risk tolerance and liquidity horizon.

**Who are the advisors?**
InvestMint advisors are former executives from Canada's Big Six banks with backgrounds in institutional fixed income, asset-liability management, and corporate treasury advisory.

**Is my data secure?**
Account and transaction data is stored in encrypted MongoDB Atlas databases. Passwords are bcrypt-hashed and never stored in plaintext. JWT tokens expire and are validated on every request.

**How do I update my investment profile?**
Go to Settings. Updating your questionnaire answers will recalibrate the screener on your next visit to the Screener page.
