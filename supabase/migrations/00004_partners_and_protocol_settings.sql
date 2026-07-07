-- Migration 00004: partner management + persisted protocol settings
--
-- 1. universities gains partner-facing columns (contact email, lifecycle status)
--    so the admin "Partners" page can manage real rows instead of local state.
-- 2. protocol_settings is a single-row table backing the origination
--    kill-switch; enforced in submitLoanApplication.

-- ---- 1. University partner columns -----------------------------------------
ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'inactive'));

-- Agents are provisioned by admins (service role creates the auth user, then
-- inserts here). Admin insert policy for parity with the manual SQL path.
CREATE POLICY "agent_profile_admin_insert" ON agent_profiles
  FOR INSERT WITH CHECK (public.is_admin());

-- ---- 2. Protocol settings (single row) --------------------------------------
CREATE TABLE IF NOT EXISTS protocol_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    originations_paused BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO protocol_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE protocol_settings ENABLE ROW LEVEL SECURITY;

-- Any signed-in user may read (the student loan submit path checks the flag);
-- only admins may flip it.
CREATE POLICY "protocol_settings_select_authed" ON protocol_settings
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "protocol_settings_admin_update" ON protocol_settings
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
