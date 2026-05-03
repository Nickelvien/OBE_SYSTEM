-- supabase/migrations/004_rls_notifications_cqi.sql
-- RLS for notifications, CQI plans, reports, and evidence

ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cqi_action_plans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files       ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_privacy_consents ENABLE ROW LEVEL SECURITY;

-- Notifications: users see only their own
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "notifications_insert_system"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::uuid);

-- CQI plans: admin/dean/program_head can see all
CREATE POLICY "cqi_select_admin"
  ON cqi_action_plans FOR SELECT TO authenticated
  USING (
    current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head','accreditor')
  );

CREATE POLICY "cqi_mutate_admin"
  ON cqi_action_plans FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head'));

-- Reports: requester or admin can see
CREATE POLICY "reports_select_own"
  ON reports FOR SELECT TO authenticated
  USING (
    requested_by = auth.uid()::uuid
    OR current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head','accreditor')
  );

CREATE POLICY "reports_insert_auth"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head'));

CREATE POLICY "reports_update_system"
  ON reports FOR UPDATE TO authenticated
  USING (true);

-- Evidence files
CREATE POLICY "evidence_select_auth"
  ON evidence_files FOR SELECT TO authenticated USING (true);

CREATE POLICY "evidence_insert_faculty"
  ON evidence_files FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','faculty','program_head'));

-- Data privacy consents: user sees own, DPO/admin can see all
CREATE POLICY "privacy_consents_select"
  ON data_privacy_consents FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()::uuid
    OR current_setting('app.current_role', true) = 'super_admin'
  );
