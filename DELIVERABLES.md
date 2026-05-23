# InvestMint V2 — Deliverables Summary

**Prepared by:** Lauren Pothuru
**Date:** May 23, 2026

---

## Overview

The InvestMint platform has been fully rebuilt from the ground up as V2. This rebuild consolidates the codebase, stabilizes the infrastructure, and wires each product layer to a live database — replacing the previous prototype's static and hardcoded data with real, persistent functionality. The following is a summary of what has been built and how each layer currently works.

---

## Codebase Rebuild

The V2 codebase is a clean rewrite of the InvestMint prototype. The frontend was rebuilt using React 18, TypeScript, and Tailwind CSS with a modern component architecture. The backend was rebuilt on Express and TypeScript with Mongoose, connected to the existing MongoDB Atlas cluster. The rebuild separates concerns cleanly: a dedicated V2 backend handles auth, onboarding, and investing logic, while a separate cash flow backend handles the financial modeling pipeline.

---

## Layer 1 — Intelligence (Cash Forecasting)

The Intelligence layer is the analytical engine of InvestMint. It ingests a client's historical bank account and transaction data and runs three complementary financial models:

- **Volatility analysis** — measures the natural variability in daily cash movements to determine how much cash must stay liquid at all times
- **STL Trend Decomposition** — separates seasonal patterns and noise from the underlying cash trend, revealing what the business's cash position is actually doing independent of cyclical swings
- **365-Day Forecast** — uses ARIMA and LSTM models to project the client's cash balance forward, showing how much idle cash will be available and when over the next year

Clients upload bank account and transaction data via Excel during onboarding. The forecasting models run against that data and surface the results in real time on the Cash Flow page. This layer answers the foundational question: *how much cash is genuinely idle, and for how long?*

---

## Layer 2 — Execution (Investment Screener)

The Execution layer takes the output of the Intelligence layer — specifically how much cash is idle and for how long — and matches it to the right investment instruments for that client.

InvestMint maintains a screened universe of 11 Canadian-listed ETFs across five categories: cash equivalents, fixed income, Canadian equity, US equity, and international. Each client's investment profile (completed during onboarding) captures their risk tolerance, liquidity horizon, and cash timing constraints. The screener scores every ETF against that profile and surfaces the top five recommendations.

The screener is live and personalized — every recommendation is generated from the client's actual questionnaire answers and displays real ETF data: yield, 1-year return, 3-year return, volatility, and management expense ratio (MER).

---

## Layer 3 — Governance (ClientVault)

The Governance layer provides the documentation infrastructure that makes a client's cash strategy auditable, defensible, and board-ready.

ClientVault currently houses:

- **Document Library** — A organized view of all governance documents with completion status: Cash Management Policy, Investment Policy Statement, ALM Strategy, and risk frameworks
- **ALM Strategy** — The client's cash bucketed into four tranches by when it's needed: Liquid (0–30 days), Short-term (1–6 months), Medium-term (6–18 months), and Strategic (18+ months) — each matched to instruments with appropriate liquidity and yield profiles
- **Audit Trail** — A live, timestamped log of every material decision and advisory action. This is written to the database by advisors in real time and is visible to the client as a running record of their engagement

The document library and ALM buckets are currently structured with representative content. The audit trail is fully live.

---

## Layer 4 — Human (Advisory Layer)

The Human layer surfaces the advisor relationship within the platform. On the client side, it shows the client's assigned advisor team, the full history of advisory engagements, and upcoming scheduled reviews — all pulled from the live database.

The advisor experience is fully built as a role-gated portal within the same application. Advisors log in at the same URL as clients and are automatically routed to their own section of the app. From the advisor portal, advisors can:

- **View their client roster** — all assigned companies with alert status and last activity
- **Open any client** — see their full financial picture: accounts, screener results, alerts, and governance documents
- **Log advisory activity** — write audit entries and advisory session notes directly into the client's record in real time, which the client sees immediately on their end
- **Manage the advisor team** — add new advisors, assign clients to advisors, and manage the roster

Two advisor accounts are active: `duane.lee@investmintapp.com` and `lauren@investmintapp.com`.

---

## Current State Summary

| Layer | Status |
|-------|--------|
| Intelligence — Cash forecasting models | Live (requires transaction data upload) |
| Execution — ETF screener | Live, personalized to each client |
| Governance — Audit trail | Live, written by advisors in real time |
| Governance — Document library, ALM | Structured with representative content |
| Human — Client advisory view | Live |
| Human — Advisor portal | Fully built and live |
| Auth, onboarding, data upload | Live |
