-- supabase/migrations/005_rls_audit_immutable.sql
-- RA 10173 Compliance: audit_logs table is APPEND-ONLY
-- INSERT is allowed for all authenticated roles
-- NO UPDATE, NO DELETE policies (immutable record)

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to INSERT audit logs
CREATE POLICY "audit_logs_insert_authenticated"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to SELECT their own audit entries
-- Super admins can see all entries (enforced at API layer via requireAuth)
CREATE POLICY "audit_logs_select_own"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::uuid);

-- CRITICAL: NO UPDATE POLICY
-- CRITICAL: NO DELETE POLICY
-- This makes audit_logs append-only and tamper-resistant

-- Verify: the following should return 0 rows if correctly configured
-- SELECT * FROM pg_policies WHERE tablename = 'audit_logs' AND cmd IN ('UPDATE', 'DELETE');

COMMENT ON TABLE audit_logs IS
  'Immutable audit trail — INSERT only. Complies with RA 10173 (Data Privacy Act 2012, Philippines). No UPDATE or DELETE policies exist.';
