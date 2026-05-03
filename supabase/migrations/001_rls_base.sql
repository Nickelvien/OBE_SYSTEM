-- supabase/migrations/001_rls_base.sql
-- OBE Cycle Management System — ACES Panabo
-- Row Level Security: role-based, no campus filter (single campus)

-- ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

-- Returns the current user's role from session config
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text AS $$
  SELECT current_setting('app.current_role', true)
$$ LANGUAGE sql STABLE;

-- Returns the current user's ID from session config
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid AS $$
  SELECT current_setting('app.current_user_id', true)::uuid
$$ LANGUAGE sql STABLE;

-- ─── ENABLE RLS ON ALL TABLES ──────────────────────────────────────────────

ALTER TABLE departments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_systems           ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_periods          ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_goals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_ed_objectives     ENABLE ROW LEVEL SECURITY;
ALTER TABLE peo_goal_links            ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE peo_plo_links             ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_learning_outcomes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plo_clo_mapping           ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_map            ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_snapshots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_tools          ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_clo_alignment  ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_scores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attainment_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cqi_action_plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_privacy_consents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tesda_qualifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_units          ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_criteria      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pc_assessments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_criteria           ENABLE ROW LEVEL SECURITY;

-- ─── ADMIN ROLES (full access to all non-sensitive tables) ─────────────────

-- Departments
CREATE POLICY "admin_full_access" ON departments
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

-- Users — admins see all, others see only themselves
CREATE POLICY "admin_see_all_users" ON users
  USING (current_user_role() IN ('super_admin', 'campus_admin'));

CREATE POLICY "self_see_own_user" ON users
  USING (id = current_user_id());

-- Grading systems — readable by all staff
CREATE POLICY "staff_read_grading" ON grading_systems
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

-- Programs — readable by most roles
CREATE POLICY "programs_read" ON programs
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'student', 'accreditor'));

-- Academic periods
CREATE POLICY "periods_read" ON academic_periods
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'student', 'accreditor'));

-- Institutional goals
CREATE POLICY "goals_read" ON institutional_goals
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

-- OBE hierarchy tables: PEO, PLO, courses, CLO, maps
CREATE POLICY "obe_read" ON program_ed_objectives
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "peo_goal_links_read" ON peo_goal_links
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "plo_read" ON program_learning_outcomes
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'student', 'accreditor'));

CREATE POLICY "peo_plo_links_read" ON peo_plo_links
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "courses_read" ON courses
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'student', 'accreditor'));

CREATE POLICY "clo_read" ON course_learning_outcomes
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'student', 'accreditor'));

CREATE POLICY "plo_clo_mapping_read" ON plo_clo_mapping
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "curriculum_map_read" ON curriculum_map
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "snapshots_read" ON curriculum_snapshots
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'accreditor'));

-- Faculty assignments
CREATE POLICY "assignments_admin" ON faculty_course_assignments
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head'));

CREATE POLICY "assignments_own_faculty" ON faculty_course_assignments
  USING (
    current_user_role() = 'faculty'
    AND faculty_id = current_user_id()
  );

-- Enrollments
CREATE POLICY "enrollments_staff" ON enrollments
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty'));

CREATE POLICY "enrollments_own_student" ON enrollments
  USING (
    current_user_role() = 'student'
    AND student_id = current_user_id()
  );

-- Assessment tools
CREATE POLICY "assessments_read" ON assessment_tools
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "assessment_clo_read" ON assessment_clo_alignment
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

-- Student scores: faculty can see all, student sees own, admin sees all
CREATE POLICY "scores_faculty_admin" ON student_scores
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty'));

CREATE POLICY "scores_own_student" ON student_scores
  USING (
    current_user_role() = 'student'
    AND student_id = current_user_id()
  );

-- Attainment results — readable by most roles including accreditor
CREATE POLICY "attainment_read" ON attainment_results
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

-- Evidence files
CREATE POLICY "evidence_staff" ON evidence_files
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "evidence_own_student" ON evidence_files
  USING (
    current_user_role() = 'student'
    AND uploader_id = current_user_id()
  );

-- CQI plans
CREATE POLICY "cqi_read" ON cqi_action_plans
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'accreditor'));

-- Reports
CREATE POLICY "reports_read" ON reports
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'accreditor'));

-- Notifications — user sees own only
CREATE POLICY "notifications_own" ON notifications
  USING (
    user_id = current_user_id()
    OR current_user_role() IN ('super_admin', 'campus_admin')
  );

-- ─── AUDIT LOGS — APPEND-ONLY (immutable) ─────────────────────────────────
-- INSERT allowed for all authenticated roles
-- NO UPDATE policy — NO DELETE policy = blocked for all roles
CREATE POLICY "audit_insert_only" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "audit_read_admin" ON audit_logs
  FOR SELECT
  USING (current_user_role() IN ('super_admin', 'campus_admin'));

-- ─── DATA PRIVACY CONSENTS ─────────────────────────────────────────────────
CREATE POLICY "privacy_own" ON data_privacy_consents
  USING (
    user_id = current_user_id()
    OR current_user_role() IN ('super_admin', 'campus_admin')
  );

-- ─── TESDA TABLES ──────────────────────────────────────────────────────────
CREATE POLICY "tesda_qual_read" ON tesda_qualifications
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "competency_units_read" ON competency_units
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "perf_criteria_read" ON performance_criteria
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "pc_assessments_staff" ON pc_assessments
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty'));

CREATE POLICY "pc_assessments_own_student" ON pc_assessments
  USING (
    current_user_role() = 'student'
    AND student_id = current_user_id()
  );

-- ─── RUBRICS ───────────────────────────────────────────────────────────────
CREATE POLICY "rubrics_read" ON rubrics
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));

CREATE POLICY "rubric_criteria_read" ON rubric_criteria
  USING (current_user_role() IN ('super_admin', 'campus_admin', 'dean', 'program_head', 'faculty', 'accreditor'));
