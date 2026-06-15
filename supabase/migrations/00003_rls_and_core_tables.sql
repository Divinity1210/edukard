-- =============================================================================
-- Migration 00003: Complete RLS, role helpers, missing core tables, indexes
-- =============================================================================
-- This migration hardens the database for production:
--   1. Non-recursive role helper functions (SECURITY DEFINER).
--   2. University<->user linkage.
--   3. Missing operational tables (audit_logs, communication_logs,
--      notifications, deposits) referenced by the app types/UI.
--   4. A complete, role-aware RLS policy set for every table.
--   5. Performance indexes on foreign keys and hot filter columns.
-- It is safe to run on top of 00001 + 00002.
-- =============================================================================

-- ---- 1. Role helper functions ----------------------------------------------
-- SECURITY DEFINER so they read `profiles` WITHOUT triggering RLS, which would
-- otherwise recurse (policy on profiles -> reads profiles -> policy ...).

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- The agent's profile id IS their agent_profiles id (shared PK).
CREATE OR REPLACE FUNCTION public.current_agent_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.agent_profiles WHERE id = auth.uid();
$$;

-- ---- 2. University <-> user linkage ----------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id);

-- Stable slug bridges the front-end DLI constants (e.g. "uoft") to the UUID PK.
ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE OR REPLACE FUNCTION public.current_university_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT university_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ---- 3. Missing core tables ------------------------------------------------
DO $$ BEGIN
  CREATE TYPE comm_channel AS ENUM ('email', 'sms', 'phone', 'letter');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Immutable action log (compliance).
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections / borrower communication log.
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    channel comm_channel NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_by UUID REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- In-app notifications.
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor fiat deposits (fiat -> USDC).
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL DEFAULT 'eft',
    status deposit_status NOT NULL DEFAULT 'pending',
    usdc_equivalent NUMERIC NOT NULL DEFAULT 0,
    stripe_payment_intent_id TEXT UNIQUE,
    circle_transfer_id TEXT UNIQUE,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- ---- 4. RLS: enable on new tables ------------------------------------------
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- ---- 4a. PROFILES ----------------------------------------------------------
-- Replace the permissive "viewable by everyone" policy (leaks PII).
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE POLICY "profiles_select_self_or_admin" ON profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_self" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self_or_admin" ON profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ---- 4b. UNIVERSITIES (public read for DLI list) ---------------------------
DROP POLICY IF EXISTS "Universities are viewable by everyone." ON universities;
CREATE POLICY "universities_select_all" ON universities
  FOR SELECT USING (true);
CREATE POLICY "universities_admin_write" ON universities
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "universities_manager_update" ON universities
  FOR UPDATE USING (id = public.current_university_id());

-- ---- 4c. CREDIT ASSESSMENTS ------------------------------------------------
CREATE POLICY "credit_select_self_or_admin" ON credit_assessments
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "credit_admin_write" ON credit_assessments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- 4d. LOAN APPLICATIONS -------------------------------------------------
DROP POLICY IF EXISTS "Students can view their own loan applications." ON loan_applications;
DROP POLICY IF EXISTS "Students can insert their own loan applications." ON loan_applications;

CREATE POLICY "loans_select_scoped" ON loan_applications
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR referral_agent_id = public.current_agent_id()
    OR university_id = public.current_university_id()
  );
CREATE POLICY "loans_insert_self" ON loan_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Student may edit only while still a draft; admin may always edit.
CREATE POLICY "loans_update_scoped" ON loan_applications
  FOR UPDATE USING (
    (auth.uid() = user_id AND status = 'draft') OR public.is_admin()
  );

-- ---- 4e. REPAYMENT SCHEDULES -----------------------------------------------
DROP POLICY IF EXISTS "Students can view their own repayment schedules." ON repayment_schedules;
CREATE POLICY "repay_select_scoped" ON repayment_schedules
  FOR SELECT USING (
    loan_id IN (SELECT id FROM loan_applications WHERE user_id = auth.uid())
    OR public.is_admin()
  );
CREATE POLICY "repay_admin_write" ON repayment_schedules
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- 4f. INVESTOR PROFILES + INVESTMENTS + POOLS + DEPOSITS -----------------
CREATE POLICY "investor_profile_self_or_admin" ON investor_profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "investor_profile_insert_self" ON investor_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "investor_profile_update_self" ON investor_profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Investors can view their own investments." ON investments;
CREATE POLICY "investments_select_self_or_admin" ON investments
  FOR SELECT USING (auth.uid() = investor_id OR public.is_admin());
CREATE POLICY "investments_insert_self" ON investments
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Pool stats are visible to any authenticated user (transparency page).
CREATE POLICY "pools_select_authenticated" ON liquidity_pools
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "pools_admin_write" ON liquidity_pools
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "deposits_select_self_or_admin" ON deposits
  FOR SELECT USING (auth.uid() = investor_id OR public.is_admin());
CREATE POLICY "deposits_insert_self" ON deposits
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- ---- 4g. UNIVERSITY INVOICES + SETTLEMENTS ---------------------------------
CREATE POLICY "uni_invoices_scoped" ON university_invoices
  FOR SELECT USING (university_id = public.current_university_id() OR public.is_admin());
CREATE POLICY "uni_invoices_admin_write" ON university_invoices
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "uni_settlements_scoped" ON university_settlements
  FOR SELECT USING (university_id = public.current_university_id() OR public.is_admin());
CREATE POLICY "uni_settlements_admin_write" ON university_settlements
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- 4h. AGENT PROFILES + REFERRALS ----------------------------------------
CREATE POLICY "agent_profile_self_or_admin" ON agent_profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "agent_profile_update_self" ON agent_profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "agent_referrals_scoped" ON agent_referrals
  FOR SELECT USING (agent_id = public.current_agent_id() OR public.is_admin());
CREATE POLICY "agent_referrals_admin_write" ON agent_referrals
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- 4i. PLAID ITEMS (add admin visibility) --------------------------------
CREATE POLICY "plaid_items_admin_select" ON plaid_items
  FOR SELECT USING (public.is_admin());

-- ---- 4j. AUDIT / COMMS / NOTIFICATIONS -------------------------------------
-- Audit + comms: admin read only; all writes come from the service-role client.
CREATE POLICY "audit_admin_select" ON audit_logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "comms_admin_select" ON communication_logs
  FOR SELECT USING (public.is_admin());

-- Notifications: each user sees and updates (mark-read) their own.
CREATE POLICY "notifications_select_self" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_self" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ---- 5. Indexes ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_loans_user ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_university ON loan_applications(university_id);
CREATE INDEX IF NOT EXISTS idx_loans_agent ON loan_applications(referral_agent_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_repay_loan ON repayment_schedules(loan_id);
CREATE INDEX IF NOT EXISTS idx_repay_status ON repayment_schedules(status);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_credit_user ON credit_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_uni_invoices_uni ON university_invoices(university_id);
CREATE INDEX IF NOT EXISTS idx_uni_settlements_uni ON university_settlements(university_id);
CREATE INDEX IF NOT EXISTS idx_agent_referrals_agent ON agent_referrals(agent_id);
CREATE INDEX IF NOT EXISTS idx_deposits_investor ON deposits(investor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_comms_loan ON communication_logs(loan_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
