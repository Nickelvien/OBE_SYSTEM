-- supabase/migrations/003_rls_assessment_scores.sql
-- RLS for assessment tools, student scores, attainment results

ALTER TABLE assessment_tools         ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_clo_alignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_scores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE attainment_results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments              ENABLE ROW LEVEL SECURITY;

-- Assessment tools: faculty can see their own course assessments
CREATE POLICY "assessment_tools_select_auth"
  ON assessment_tools FOR SELECT TO authenticated USING (true);

CREATE POLICY "assessment_tools_mutate_faculty"
  ON assessment_tools FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin','faculty'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','faculty'));

-- Student scores: faculty enter scores, students view own scores
CREATE POLICY "student_scores_select_own"
  ON student_scores FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()::uuid
    OR current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head','faculty')
  );

CREATE POLICY "student_scores_insert_faculty"
  ON student_scores FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin','faculty'));

CREATE POLICY "student_scores_update_faculty"
  ON student_scores FOR UPDATE TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin','faculty'));

-- Attainment results: accessible to admin/dean/program_head/accreditor
CREATE POLICY "attainment_results_select_auth"
  ON attainment_results FOR SELECT TO authenticated
  USING (
    current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head','accreditor')
  );

CREATE POLICY "attainment_results_mutate_system"
  ON attainment_results FOR ALL TO authenticated
  USING (current_setting('app.current_role', true) IN ('super_admin','campus_admin'))
  WITH CHECK (current_setting('app.current_role', true) IN ('super_admin','campus_admin'));

-- Enrollments
CREATE POLICY "enrollments_select_own"
  ON enrollments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()::uuid
    OR current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head','faculty')
  );

-- Faculty assignments
CREATE POLICY "faculty_assignments_select_own"
  ON faculty_course_assignments FOR SELECT TO authenticated
  USING (
    faculty_id = auth.uid()::uuid
    OR current_setting('app.current_role', true) IN ('super_admin','campus_admin','dean','program_head')
  );
