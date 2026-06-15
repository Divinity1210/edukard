# EduKard — Production Hardening & Pilot Runbook

> Companion to `USER_FLOWS.md`. That document describes *what* each portal does;
> this one describes *how* to take the platform from "UI complete" to a live
> pilot, and what was changed to get there.

---

## 1. What changed in this hardening pass

| Area | Before | After |
|:---|:---|:---|
| Env config | No `.env`, ad-hoc `process.env` reads | Zod-validated loader (`src/lib/env.ts`), `.env.example`, per-integration `isConfigured` flags |
| Service writes | None | Service-role client (`src/lib/supabase/admin.ts`) for webhooks/privileged jobs |
| Data access | Queried non-existent `student_loans`, wrong columns (`amount`, agent `user_id`) | Reconciled to real schema (`loan_applications`, `principal`, agent PK = profile id); added underwriting/treasury/audit/collections/notification queries |
| RLS | Several tables locked (RLS on, no policies); profiles world-readable | Full role-aware policy set for all tables + non-recursive role helpers (migration `00003`) |
| Missing tables | `audit_logs`, `communication_logs`, `notifications`, `deposits` only existed as TS types | Created in migration `00003` |
| Integrations | None | Key-pluggable, dependency-free adapters for Stripe, Plaid, Circle (USDC), Sumsub |
| Webhooks | Empty stubs, no verification | Real signature verification + DB writes for all four providers |
| Loan flow | Hard-coded 11.5% APR, no schedule | Real EduKard credit engine → risk-based APR → generated amortization schedule + persisted credit snapshot |
| Admin actions | None | `approveLoan` / `rejectLoan` / `disburseLoan` / `logCommunication` with audit + notifications |

---

## 2. First-time setup

```bash
# 1. Install dependencies (node_modules was NOT populated in the repo)
npm ci          # or: npm install

# 2. Configure environment
cp .env.example .env.local
#    Fill in the Supabase block (required). Add integration keys as you go.

# 3. Apply the database schema to your Supabase project
#    Option A — Supabase CLI (recommended):
supabase db push                 # applies migrations 00001..00003
psql "$DATABASE_URL" -f supabase/seed.sql   # pools + DLI universities
#    Option B — Dashboard: paste each file in supabase/migrations/* (in order)
#    then supabase/seed.sql into the SQL editor.

# 4. Run
npm run dev
```

### Verify the build (do this in a clean environment)
```bash
npm ci
npx tsc --noEmit       # type check
npm run lint
npm run build          # production build
```
> Note: this hardening pass was authored in a sandbox that could not complete
> `npm install`/`npm run build`. Run the four commands above on your machine or
> CI before deploying. The code was reviewed by hand for type/schema soundness.

---

## 3. Environment variables

All variables are documented in `.env.example`. Only the **Supabase core block**
is required to boot. Everything else is optional and activates its feature when
present (`integrationStatus()` in `src/lib/integrations` reports what's live).

| Group | Keys | Enables |
|:---|:---|:---|
| Supabase (required) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Auth, RLS, webhook writes |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | PAD/ACSS repayment collection |
| Plaid | `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`, `PLAID_WEBHOOK_SECRET` | Bank link, income/payroll verification |
| Circle | `CIRCLE_API_KEY`, `CIRCLE_ENV`, `CIRCLE_WEBHOOK_SECRET`, `CIRCLE_TREASURY_WALLET_ID` | USDC wallets, disbursement, settlement |
| Sumsub | `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY`, `SUMSUB_WEBHOOK_SECRET` | KYC/KYB/liveness |

The service-role key bypasses RLS — keep it server-only, never in `NEXT_PUBLIC_*`.

---

## 4. Webhook endpoints

Register these in each provider dashboard (base = `NEXT_PUBLIC_APP_URL`):

| Provider | Endpoint | Verification |
|:---|:---|:---|
| Stripe | `/api/webhooks/stripe` | HMAC-SHA256 `t=/v1=` scheme (no SDK) |
| Sumsub | `/api/webhooks/sumsub` | HMAC digest (`x-payload-digest` + alg header) |
| Plaid | `/api/webhooks/plaid` | JWT body-hash check (see §6) |
| Circle | `/api/webhooks/circle` | SNS handshake + shared-secret header (see §6) |

Each handler refuses or 401s unsigned/invalid requests once the corresponding
`*_WEBHOOK_SECRET` is set, and records outcomes to `audit_logs`.

---

## 5. Blockchain / USDC layer (pilot decision)

The pilot uses **Circle custodial USDC wallets** (`src/lib/integrations/circle.ts`)
rather than self-deployed smart contracts. Rationale: Circle's sandbox is free,
needs no contract audit/gas/key management, and gives compliant fiat↔USDC plus
on-chain settlement out of the box. The DB already carries `circle_wallet_id`
(universities, investor_profiles) and `circle_transfer_id` (loans, deposits) so
disbursements and deposits reconcile through the Circle webhook. Moving to
on-chain tranche contracts later is additive — the columns stay.

---

## 6. Go-live checklist & known gaps

**Before real money moves:**

- [ ] Run the build verification commands in §2.
- [ ] Apply migrations + seed to the production Supabase project.
- [ ] Provision the first admin: set `profiles.role = 'admin'` for your account.
- [ ] Link each university bursar account: set `profiles.university_id`.
- [ ] **Plaid webhook**: current check validates the body hash from the
      `plaid-verification` JWT. Add full ES256 signature verification (the `jose`
      package + Plaid's rotating JWK) before production — see comment in
      `src/lib/integrations/plaid.ts`.
- [ ] **Circle webhook**: currently gated by a shared secret header. Replace with
      AWS SNS X.509 certificate signature verification for mainnet — see comment
      in `src/lib/integrations/circle.ts`.
- [ ] Enable Supabase email verification + password reset in Auth settings.
- [ ] Set `NEXT_PUBLIC_APP_URL` to the deployed domain.

**UI wiring status:** All pages now read live Supabase data — no page imports
`src/lib/mock-data.ts` anymore. Converted in this pass: admin (audit, treasury,
collections, underwriting queue + detail), investor (dashboard, portfolio,
transparency, deposit), and student (application-status, credit-score, payroll).
Admin actions (`approveLoan`/`rejectLoan`/`disburseLoan`/`markDefault`/
`logCommunication`) and investor `createDeposit` are wired to the UI.

**Genuine follow-ups (integration-dependent, not mock swaps):**
- **Plaid Link flow** — `student/payroll` shows real connection state + an
  income empty-state, and a "Connect with Plaid" CTA that's disabled until Plaid
  keys are set. The actual Link handshake (`createLinkToken` →
  `exchangePublicToken` → store `plaid_items` → `getIncome`) needs the Plaid
  front-end SDK wired to the button. Adapters are ready in `src/lib/integrations/plaid.ts`.
- **Notifications bell** — `DashboardLayout` still shows a static bell/badge.
  `getNotifications(userId)` + the `notifications` table exist; pass them in to
  make it live.
- **Portfolio growth chart** — derived from current holdings' accrual (real, not
  mock). Swap to a daily snapshot table/cron for exact point-in-time history.
- **On-chain contracts panel** — `investor/transparency` reads
  `NEXT_PUBLIC_ONCHAIN_CONTRACTS` (JSON). Empty for the Circle custodial pilot;
  populate if/when token contracts deploy.
- **Origination kill-switch** — `admin/treasury` toggle is local; persist to a
  `protocol_settings` row and enforce in `submitLoanApplication`.

---

## 7. Security notes

- RLS is enforced on every table; cross-role reads go through SECURITY DEFINER
  helpers (`is_admin()`, `current_agent_id()`, `current_university_id()`) that
  avoid policy recursion.
- All privileged writes (webhooks, disbursement) use the service-role client and
  are audit-logged.
- Webhook handlers verify signatures and use `timingSafeEqual` for comparisons.
- Input on the loan flow and admin actions is validated with Zod before any DB write.
- Audit logs are append-only by policy (admin read; writes only via service role).
