-- supabase/migrations/002_rls_programs.sql
-- RLS policies for program, curriculum, and OBE entity tables

ALTER TABLE programs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_systems           ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_ed_objectives     ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_learning_outcomes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_map            ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_snapshots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE plo_clo_mapping           ENABLE ROW LEVEL SECURITY;
ALTER TABLE peo_plo_links             ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT all program data
CREATE POLICY "programs_select_authenticated"
  ON programs FOR SELECT TO authenticated USING (true);

CREATE POLICY "departments_select_authenticated"
  ON departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "grading_systems_select_authenticated"
  ON grading_systems FOR SELECT TO authenticated USING (true);

CREATE POLICY "peos_select_authenticated"
  ON program_ed_objectives FOR SELECT TO authenticated USING (true);

CREATE POLICY "plos_select_authenticated"
  ON program_learning_outcomes FOR SELECT TO authenticated USING (true);

CREATE POLICY "courses_select_authenticated"
  ON courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "clos_select_authenticated"
  ON course_learning_outcomes FOR SELECT TO authenticated USING (true);

CREATE POLICY "curriculum_map_select_authenticated"
  ON curriculum_map FOR SELECT TO authenticated USING (true);

CREATE POLICY "curriculum_snapshots_select_authenticated"
  ON curriculum_snapshots FOR SELECT TO authenticated USING (true);

CREATE POLICY "plo_clo_select_authenticated"
  ON plo_clo_mapping FOR SELECT TO authenticated USING (true);

CREATE POLICY "peo_plo_select_authenticated"
  ON peo_plo_links FOR SELECT TO authenticated USING (true);

-- Mutations enforced at API layer via requireAuth(allowedRoles)
-- INSERT/UPDATE/DELETE policies use app.current_role set by withRLS()

CREATE POLICY "programs_mutate_admin"
  ON programs FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin'));

CREATE POLICY "peos_mutate_admin"
  ON program_ed_objectives FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head'));

CREATE POLICY "plos_mutate_admin"
  ON program_learning_outcomes FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head'));

CREATE POLICY "courses_mutate_admin"
  ON courses FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head'));

CREATE POLICY "clos_mutate_admin"
  ON course_learning_outcomes FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head','faculty'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head','faculty'));

CREATE POLICY "curriculum_map_mutate_admin"
  ON curriculum_map FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','program_head'));
