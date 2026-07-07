-- Migration 00005: admin INSERT policies for operational log tables
--
-- Bug fix: audit_logs, communication_logs and notifications had SELECT-only
-- policies, so every insert made by admin server actions (approveLoan,
-- rejectLoan, disburseLoan, markDefault, logCommunication, partner management)
-- was silently rejected by RLS — the audit trail and borrower notifications
-- never landed. Webhooks were unaffected (service role bypasses RLS).
--
-- Append-only is preserved: still no UPDATE/DELETE policies on audit_logs or
-- communication_logs for any role.

CREATE POLICY "audit_admin_insert" ON audit_logs
  FOR INSERT WITH CHECK (public.is_admin() AND actor_id = auth.uid());

CREATE POLICY "comms_admin_insert" ON communication_logs
  FOR INSERT WITH CHECK (public.is_admin() AND sent_by = auth.uid());

-- Admin actions notify borrowers (loan decisions, default notices).
CREATE POLICY "notifications_admin_insert" ON notifications
  FOR INSERT WITH CHECK (public.is_admin());
