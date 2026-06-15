# EduKard — Operator Setup & Go-Live Playbook

This is the **manual** checklist: the accounts to create, keys to paste, commands
to run, and webhooks to register — in order. Code is done; these are the human steps.

Legend: 🔑 = get a credential · 💻 = run a command · 🖱️ = do something in a dashboard · ✅ = verify

---

## Phase 0 — Local environment (15 min)

1. 💻 Install dependencies (the repo ships **without** `node_modules`):
   ```bash
   cd /path/to/edukard
   npm ci          # or: npm install
   ```
2. 💻 Create your env file:
   ```bash
   cp .env.example .env.local
   ```
3. 🔑 Fill in the **Supabase core block** only (Phase 1 below). Leave integration
   keys blank for now — the app boots and every integration degrades gracefully.

---

## Phase 1 — Supabase database (you have a project)

1. 🖱️ Supabase Dashboard → your project → **Settings → API**. Copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` = `service_role` `secret` key  ⚠️ server-only
2. Apply the schema. **Option A — CLI (recommended):**
   ```bash
   npm i -g supabase
   supabase link --project-ref <your-project-ref>
   supabase db push                      # runs migrations 00001 → 00003
   psql "<your-db-connection-string>" -f supabase/seed.sql
   ```
   **Option B — Dashboard:** SQL Editor → paste each file in
   `supabase/migrations/` in order (00001, 00002, 00003), then `supabase/seed.sql`.
3. 🖱️ **Auth → Providers → Email**: enable. For the pilot you can turn **off**
   "Confirm email" to speed up testing, or leave on and configure SMTP.
4. ✅ Confirm tables exist: `profiles, universities (30 rows), liquidity_pools
   (2 rows), loan_applications, repayment_schedules, investments, deposits,
   audit_logs, communication_logs, notifications`.

### Provision your first admin (no admin self-signup by design)
1. 🖱️ Sign up through the app at `/signup?role=student` (creates an auth user +
   profile via trigger), OR create a user in **Auth → Users**.
2. 🖱️ SQL Editor:
   ```sql
   update profiles set role = 'admin' where email = 'you@yourco.com';
   ```
3. For a **university** bursar account, after creating their user:
   ```sql
   update profiles
     set role = 'university',
         university_id = (select id from universities where slug = 'uoft')
     where email = 'bursar@uoft.ca';
   ```
4. For an **agent**, create their `agent_profiles` row (shares id with profile):
   ```sql
   insert into agent_profiles (id, company_name, territory, referral_code)
   values ('<auth-user-uuid>', 'Acme Recruiting', 'ON', 'ACME-2026');
   update profiles set role = 'agent' where id = '<auth-user-uuid>';
   ```

---

## Phase 2 — Build verification (do before every deploy)

```bash
npm ci
npx tsc --noEmit       # type check
npm run lint
npm run build          # production build
npm run dev            # smoke test at http://localhost:3000
```
✅ All four should pass clean. (This sandbox couldn't run them; your machine can.)

---

## Phase 3 — Integrations (each is independent & optional)

For each: create the account → copy keys into `.env.local` → register the webhook
→ test. The app reads `integrationStatus()` and lights up features as keys appear.

### 3a. Stripe — repayment collection (Canadian PAD / ACSS)
1. 🔑 https://dashboard.stripe.com → **Developers → API keys** (Test mode):
   - `STRIPE_SECRET_KEY` = Secret key (`sk_test_…`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Publishable key (`pk_test_…`)
2. 🖱️ **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR_DOMAIN/api/webhooks/stripe` (use an ngrok URL while local)
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `setup_intent.succeeded`
   - Copy the **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`
3. 🖱️ Enable the **ACSS Debit** payment method (Settings → Payment methods) — required for Canadian PAD.
4. ✅ Test: `stripe trigger payment_intent.succeeded` (Stripe CLI) → check the
   `audit_logs` table for a `payment.succeeded` row.

### 3b. Plaid — bank link + income/payroll verification
1. 🔑 https://dashboard.plaid.com → **Developers → Keys**:
   - `PLAID_CLIENT_ID`, `PLAID_SECRET` (use the **Sandbox** secret), `PLAID_ENV=sandbox`
2. 🖱️ **Developers → Webhooks** (or pass per-request): `https://YOUR_DOMAIN/api/webhooks/plaid`
3. 🛠️ **Code to finish (front-end):** wire the "Connect with Plaid" button in
   `student/payroll` to Plaid Link using `createLinkToken` → on success call
   `exchangePublicToken` and insert into `plaid_items`, then `getIncome`.
4. ⚠️ Before production, add full ES256 webhook verification (the `jose` package +
   Plaid's JWK) — see the comment in `src/lib/integrations/plaid.ts`.
5. ✅ Sandbox test creds: username `user_good`, password `pass_good`.

### 3c. Circle — USDC custodial wallets + payouts (blockchain layer, free sandbox)
1. 🔑 https://app-sandbox.circle.com → **Settings → API Keys**:
   - `CIRCLE_API_KEY` (`TEST_API_KEY:…`), `CIRCLE_ENV=sandbox`
2. 🖱️ Create the protocol treasury wallet (API or dashboard) →
   `CIRCLE_TREASURY_WALLET_ID`. Create/record each university's wallet id into
   `universities.circle_wallet_id` (so `disburseLoan` can pay them).
3. 🖱️ Subscribe a webhook to `https://YOUR_DOMAIN/api/webhooks/circle`; set a
   shared secret header value → `CIRCLE_WEBHOOK_SECRET` (pilot-grade gate).
4. ⚠️ Before mainnet, replace the shared-secret check with SNS X.509 cert
   verification — see the comment in `src/lib/integrations/circle.ts`.
5. ✅ Test a sandbox transfer; confirm a `circle.transfer.complete` row in `audit_logs`.

### 3d. Sumsub — KYC / KYB / liveness
1. 🔑 https://cockpit.sumsub.com → **Dev space → App Tokens**:
   - `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY`
2. 🖱️ Create a verification level named `basic-kyc-level` (or change the default in
   `src/lib/integrations/sumsub.ts`).
3. 🖱️ **Webhooks** → `https://YOUR_DOMAIN/api/webhooks/sumsub`; set the secret →
   `SUMSUB_WEBHOOK_SECRET`. (Handler verifies the `x-payload-digest` HMAC.)
4. 🛠️ **Code to finish (front-end):** in `student/onboarding`, call
   `generateAccessToken` to launch the Sumsub WebSDK; on `createApplicant` store
   the returned id in `profiles.sumsub_applicant_id` so the webhook can match it.
5. ✅ In Sumsub sandbox, approve/reject a test applicant → the webhook flips
   `profiles.kyc_status` and writes a notification.

---

## Phase 4 — Deploy (Vercel)

1. 🖱️ Import the repo at https://vercel.com/new (framework auto-detected: Next.js).
2. 🖱️ **Project → Settings → Environment Variables**: add every var from
   `.env.local` (Production scope). Set `NEXT_PUBLIC_APP_URL` to the real domain.
3. 🖱️ Re-point every provider webhook (Phase 3) from the ngrok/localhost URL to
   `https://YOUR_DOMAIN/api/webhooks/...`.
4. 💻 Trigger a deploy (push to main) and watch the build logs.
5. ✅ Visit the domain, log in as your admin, confirm dashboards load real data.

---

## Phase 5 — Pilot smoke test (end-to-end)

1. ✅ **Student**: sign up → (KYC) → `/student/apply` submit an application →
   confirm a `loan_applications` row + generated `repayment_schedules`.
2. ✅ **Admin**: `/admin/underwriting` shows it → Approve → Disburse → check
   `audit_logs` and the student's `/student/application-status` timeline advances.
3. ✅ **Investor**: sign up as investor → `/investor/deposit` → submit a deposit →
   row appears `processing` (flips to `confirmed` via Circle webhook when live).
4. ✅ **Collections**: mark a repayment installment `late` in SQL → it surfaces in
   `/admin/collections`; send a reminder / issue default → check the comms log.
5. ✅ **University**: log in as a linked bursar → invoices/settlements scoped to
   their institution only (RLS check).

---

## Phase 6 — Compliance & ops notes

- **Secrets**: never expose `SUPABASE_SERVICE_ROLE_KEY` or any `*_SECRET` to the
  browser. Only `NEXT_PUBLIC_*` reaches the client.
- **RLS** is enforced on every table; admins bypass via `is_admin()`. Audit logs
  are append-only (admin read; writes via service role).
- **Provincial APR caps** live in `src/lib/constants.ts` (`PROVINCES`). The credit
  engine caps APR well under these; confirm against current regulations before launch.
- **Webhook hardening** (do before real money): Plaid ES256, Circle SNS cert — see Phase 3.
- **Backups / PITR**: enable Point-in-Time Recovery in Supabase before pilot.

---

### Quickest path to a working demo (no integrations)
Phase 0 → Phase 1 → Phase 2, then sign up + promote yourself to admin. The full
five-portal app runs on Supabase alone; add Stripe/Plaid/Circle/Sumsub keys when
you're ready to exercise payments, payroll, USDC, and KYC.
