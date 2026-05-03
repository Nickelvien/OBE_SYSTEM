# PLAN.md — OBE Cycle Management System
## ACES Polytechnic College · Panabo Campus · Build Phases

> **One phase per Claude Code session. Never skip phases.**
> Each phase depends on the previous. Run `tsc --noEmit` + `npx vitest run` before moving on.

---

## PHASE DEPENDENCY MAP

```
Phase 1 — Foundation & Database
    └── Phase 2 — Auth, Users & Admin Panel
          └── Phase 3 — Curriculum & OBE Structure
                └── Phase 4 — Assessment, Scores & Attainment Engine
                      └── Phase 5 — Reports, Analytics & PDF Generation
                            └── Phase 6 — CQI, Compliance & Security Hardening
```

---

## DATABASE SCHEMA (Panabo Edition)

> Every table: `id UUID PK`, `created_at`, `updated_at`, `deleted_at NULL` (soft delete).
> **No `campus_id` foreign keys** — single campus, all records belong to ACES Panabo.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── CORE ──────────────────────────────────────────────────────────────────

model Department {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  deanId    String?   @db.Uuid @map("dean_id")
  name      String
  code      String    @unique
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  programs  Program[]
  @@map("departments")
}

model User {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email               String    @unique
  passwordHash        String    @map("password_hash")
  firstName           String    @map("first_name")
  lastName            String    @map("last_name")
  role                Role
  departmentId        String?   @db.Uuid @map("department_id")
  isDpo               Boolean   @default(false) @map("is_dpo")
  accreditorExpiresAt DateTime? @map("accreditor_expires_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  deletedAt           DateTime? @map("deleted_at")
  @@map("users")
}

enum Role {
  super_admin
  campus_admin
  dean
  program_head
  faculty
  student
  accreditor
}

model GradingSystem {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId        String?   @db.Uuid @map("program_id")
  name             String
  passingThreshold Decimal   @map("passing_threshold") @db.Decimal(5, 2)
  eviThreshold     Decimal   @map("evi_threshold") @db.Decimal(5, 2)
  cowThreshold     Decimal   @map("cow_threshold") @db.Decimal(5, 2)
  scaleType        ScaleType @map("scale_type")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")
  programs         Program[]
  @@map("grading_systems")
}

enum ScaleType { percentage points competency }

model Program {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  departmentId    String?     @db.Uuid @map("department_id")
  gradingSystemId String      @db.Uuid @map("grading_system_id")
  programHeadId   String?     @db.Uuid @map("program_head_id")
  name            String
  code            String      @unique
  mode            ProgramMode
  pqfLevel        Int?        @map("pqf_level")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  deletedAt       DateTime?   @map("deleted_at")
  department      Department? @relation(fields: [departmentId], references: [id])
  gradingSystem   GradingSystem @relation(fields: [gradingSystemId], references: [id])
  peos            ProgramEdObjective[]
  plos            ProgramLearningOutcome[]
  courses         Course[]
  snapshots       CurriculumSnapshot[]
  cqiPlans        CqiActionPlan[]
  reports         Report[]
  @@map("programs")
}

enum ProgramMode { CHED TESDA }

model AcademicPeriod {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  startDate DateTime  @map("start_date") @db.Date
  endDate   DateTime  @map("end_date") @db.Date
  isActive  Boolean   @default(false) @map("is_active")
  isLocked  Boolean   @default(false) @map("is_locked")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  @@map("academic_periods")
}

model InstitutionalGoal {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String    @unique
  description String
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  peoLinks    PeoPlanLink[]
  @@map("institutional_goals")
}

// ─── OBE HIERARCHY ─────────────────────────────────────────────────────────

model ProgramEdObjective {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId   String    @db.Uuid @map("program_id")
  code        String
  description String
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  program     Program   @relation(fields: [programId], references: [id])
  ploLinks    PeoPloLink[]
  goalLinks   PeoPlanLink[]
  @@map("program_ed_objectives")
}

model PeoPlanLink {
  id     String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  peoId  String             @db.Uuid @map("peo_id")
  goalId String             @db.Uuid @map("goal_id")
  peo    ProgramEdObjective @relation(fields: [peoId], references: [id])
  goal   InstitutionalGoal  @relation(fields: [goalId], references: [id])
  @@unique([peoId, goalId])
  @@map("peo_goal_links")
}

model ProgramLearningOutcome {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId     String    @db.Uuid @map("program_id")
  code          String
  description   String
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  program       Program   @relation(fields: [programId], references: [id])
  peoLinks      PeoPloLink[]
  cloMappings   PloCloMapping[]
  curriculumMap CurriculumMap[]
  @@map("program_learning_outcomes")
}

model PeoPloLink {
  id     String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  peoId  String                 @db.Uuid @map("peo_id")
  ploId  String                 @db.Uuid @map("plo_id")
  weight Decimal                @db.Decimal(5, 4)
  peo    ProgramEdObjective     @relation(fields: [peoId], references: [id])
  plo    ProgramLearningOutcome @relation(fields: [ploId], references: [id])
  @@unique([peoId, ploId])
  @@map("peo_plo_links")
}

model Course {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId    String    @db.Uuid @map("program_id")
  code         String
  name         String
  units        Int
  yearLevel    Int       @map("year_level")
  semester     Int
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")
  program      Program   @relation(fields: [programId], references: [id])
  clos         CourseLearningOutcome[]
  curriculumMap CurriculumMap[]
  assessments  AssessmentTool[]
  assignments  FacultyCourseAssignment[]
  enrollments  Enrollment[]
  rubrics      Rubric[]
  @@map("courses")
}

model CourseLearningOutcome {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  courseId             String    @db.Uuid @map("course_id")
  code                 String
  description          String
  weight               Decimal   @db.Decimal(5, 4)
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  deletedAt            DateTime? @map("deleted_at")
  course               Course    @relation(fields: [courseId], references: [id])
  ploMappings          PloCloMapping[]
  assessmentAlignments AssessmentCloAlignment[]
  @@map("course_learning_outcomes")
}

model PloCloMapping {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  ploId     String   @db.Uuid @map("plo_id")
  cloId     String   @db.Uuid @map("clo_id")
  weight    Decimal  @db.Decimal(5, 4)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  plo       ProgramLearningOutcome @relation(fields: [ploId], references: [id])
  clo       CourseLearningOutcome  @relation(fields: [cloId], references: [id])
  @@unique([ploId, cloId])
  @@map("plo_clo_mapping")
}

model CurriculumMap {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  courseId  String   @db.Uuid @map("course_id")
  ploId     String   @db.Uuid @map("plo_id")
  idaLevel  IdaLevel @map("ida_level")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  course    Course   @relation(fields: [courseId], references: [id])
  plo       ProgramLearningOutcome @relation(fields: [ploId], references: [id])
  @@unique([courseId, ploId])
  @@map("curriculum_map")
}

enum IdaLevel { I D A }

model CurriculumSnapshot {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId        String    @db.Uuid @map("program_id")
  snapshotData     Json      @map("snapshot_data")
  effectiveFrom    DateTime  @map("effective_from") @db.Date
  effectiveTo      DateTime? @map("effective_to") @db.Date
  createdBy        String    @db.Uuid @map("created_by")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  program          Program   @relation(fields: [programId], references: [id])
  attainmentResults AttainmentResult[]
  @@map("curriculum_snapshots")
}

// ─── ASSESSMENT & SCORES ───────────────────────────────────────────────────

model FacultyCourseAssignment {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  facultyId String    @db.Uuid @map("faculty_id")
  courseId  String    @db.Uuid @map("course_id")
  periodId  String    @db.Uuid @map("period_id")
  section   String
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  course    Course    @relation(fields: [courseId], references: [id])
  @@map("faculty_course_assignments")
}

model Enrollment {
  id        String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  studentId String           @db.Uuid @map("student_id")
  courseId  String           @db.Uuid @map("course_id")
  periodId  String           @db.Uuid @map("period_id")
  status    EnrollmentStatus @default(enrolled)
  createdAt DateTime         @default(now()) @map("created_at")
  updatedAt DateTime         @updatedAt @map("updated_at")
  deletedAt DateTime?        @map("deleted_at")
  course    Course           @relation(fields: [courseId], references: [id])
  @@map("enrollments")
}

enum EnrollmentStatus { enrolled dropped completed incomplete }

model AssessmentTool {
  id             String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  courseId       String         @db.Uuid @map("course_id")
  periodId       String         @db.Uuid @map("period_id")
  name           String
  assessmentType AssessmentType @map("assessment_type")
  maxScore       Decimal        @map("max_score") @db.Decimal(7, 2)
  weight         Decimal        @db.Decimal(5, 4)
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  deletedAt      DateTime?      @map("deleted_at")
  course         Course         @relation(fields: [courseId], references: [id])
  cloAlignments  AssessmentCloAlignment[]
  scores         StudentScore[]
  @@map("assessment_tools")
}

enum AssessmentType { formative summative performance portfolio }

model AssessmentCloAlignment {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  assessmentId       String   @db.Uuid @map("assessment_id")
  cloId              String   @db.Uuid @map("clo_id")
  contributionWeight Decimal  @map("contribution_weight") @db.Decimal(5, 4)
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")
  assessment         AssessmentTool        @relation(fields: [assessmentId], references: [id])
  clo                CourseLearningOutcome @relation(fields: [cloId], references: [id])
  @@unique([assessmentId, cloId])
  @@map("assessment_clo_alignment")
}

model StudentScore {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  studentId       String    @db.Uuid @map("student_id")
  assessmentId    String    @db.Uuid @map("assessment_id")
  rawScore        Decimal?  @map("raw_score") @db.Decimal(7, 2)
  percentageScore Decimal?  @map("percentage_score") @db.Decimal(5, 2)
  isExcused       Boolean   @default(false) @map("is_excused")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  assessment      AssessmentTool @relation(fields: [assessmentId], references: [id])
  @@unique([studentId, assessmentId])
  @@map("student_scores")
}

// ─── ATTAINMENT ────────────────────────────────────────────────────────────

model AttainmentResult {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  snapshotId           String    @db.Uuid @map("snapshot_id")
  periodId             String    @db.Uuid @map("period_id")
  entityType           String    @map("entity_type")   // 'clo' | 'plo' | 'peo'
  entityId             String    @db.Uuid @map("entity_id")
  attainmentPercentage Decimal?  @map("attainment_percentage") @db.Decimal(5, 2)
  studentsPassing      Int?      @map("students_passing")
  studentsScored       Int?      @map("students_scored")
  studentsEnrolled     Int?      @map("students_enrolled")
  isProvisional        Boolean   @default(false) @map("is_provisional")
  isStale              Boolean   @default(false) @map("is_stale")
  computedAt           DateTime? @map("computed_at")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  snapshot             CurriculumSnapshot @relation(fields: [snapshotId], references: [id])
  @@map("attainment_results")
}

// ─── EVIDENCE ──────────────────────────────────────────────────────────────

model EvidenceFile {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  uploaderId  String    @db.Uuid @map("uploader_id")
  storagePath String    @map("storage_path")
  mimeType    String    @map("mime_type")
  sizeBytes   Int       @map("size_bytes")
  entityType  String    @map("entity_type")  // 'clo' | 'plo' | 'cqi_action_plan'
  entityId    String    @db.Uuid @map("entity_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  @@map("evidence_files")
}

// ─── CQI ──────────────────────────────────────────────────────────────────

model CqiActionPlan {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId   String    @db.Uuid @map("program_id")
  periodId    String    @db.Uuid @map("period_id")
  triggeredBy String    @map("triggered_by")  // 'plo_below_threshold' | 'peo_below_threshold'
  entityId    String    @db.Uuid @map("entity_id")
  status      CqiStatus @default(open)
  description String
  responsible String?
  targetDate  DateTime? @map("target_date") @db.Date
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  program     Program   @relation(fields: [programId], references: [id])
  @@map("cqi_action_plans")
}

enum CqiStatus { open in_progress completed }

// ─── REPORTS ──────────────────────────────────────────────────────────────

model Report {
  id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  requestedBy String       @db.Uuid @map("requested_by")
  programId   String       @db.Uuid @map("program_id")
  periodId    String       @db.Uuid @map("period_id")
  reportType  ReportType   @map("report_type")
  status      ReportStatus @default(pending)
  storagePath String?      @map("storage_path")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")
  program     Program      @relation(fields: [programId], references: [id])
  @@map("reports")
}

enum ReportType   { ched_compliance tesda_competency curriculum_map syllabus }
enum ReportStatus { pending processing ready failed }

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────

model Notification {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String    @db.Uuid @map("user_id")
  title     String
  body      String
  type      String    // 'cqi_triggered' | 'report_ready' | 'approval_needed'
  entityId  String?   @db.Uuid @map("entity_id")
  readAt    DateTime? @map("read_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  @@map("notifications")
}

// ─── AUDIT & PRIVACY ──────────────────────────────────────────────────────

model AuditLog {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid @map("user_id")
  action    String
  tableName String   @map("table_name")
  recordId  String?  @db.Uuid @map("record_id")
  oldValue  Json?    @map("old_value")
  newValue  Json?    @map("new_value")
  ipAddress String?  @map("ip_address")
  createdAt DateTime @default(now()) @map("created_at")
  @@map("audit_logs")
}

model DataPrivacyConsent {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String    @db.Uuid @map("user_id")
  consentType String    @map("consent_type")
  withdrawnAt DateTime? @map("withdrawn_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  @@map("data_privacy_consents")
}

// ─── TESDA ────────────────────────────────────────────────────────────────

model TesdaQualification {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId String    @db.Uuid @map("program_id")
  ncLevel   String    @map("nc_level")
  name      String
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  units     CompetencyUnit[]
  @@map("tesda_qualifications")
}

model CompetencyUnit {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  qualificationId String    @db.Uuid @map("qualification_id")
  code            String
  name            String
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")
  qualification   TesdaQualification @relation(fields: [qualificationId], references: [id])
  criteria        PerformanceCriteria[]
  @@map("competency_units")
}

model PerformanceCriteria {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  unitId      String    @db.Uuid @map("unit_id")
  code        String
  description String
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  unit        CompetencyUnit @relation(fields: [unitId], references: [id])
  assessments PcAssessment[]
  @@map("performance_criteria")
}

model PcAssessment {
  id         String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  studentId  String          @db.Uuid @map("student_id")
  pcId       String          @db.Uuid @map("pc_id")
  periodId   String          @db.Uuid @map("period_id")
  result     CompetencyResult
  assessedAt DateTime        @default(now()) @map("assessed_at")
  createdAt  DateTime        @default(now()) @map("created_at")
  updatedAt  DateTime        @updatedAt @map("updated_at")
  pc         PerformanceCriteria @relation(fields: [pcId], references: [id])
  @@unique([studentId, pcId, periodId])
  @@map("pc_assessments")
}

enum CompetencyResult { competent not_yet_competent }

// ─── RUBRICS ──────────────────────────────────────────────────────────────

model Rubric {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  courseId  String    @db.Uuid @map("course_id")
  cloId     String    @db.Uuid @map("clo_id")
  name      String
  maxScore  Decimal   @map("max_score") @db.Decimal(7, 2)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  course    Course    @relation(fields: [courseId], references: [id])
  criteria  RubricCriterion[]
  @@map("rubrics")
}

model RubricCriterion {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rubricId    String   @db.Uuid @map("rubric_id")
  description String
  maxPoints   Decimal  @map("max_points") @db.Decimal(5, 2)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  rubric      Rubric   @relation(fields: [rubricId], references: [id])
  @@map("rubric_criteria")
}
```

---

## INNGEST EVENTS

| Event | Triggered By | Handler |
|---|---|---|
| `obe/period.compute-requested` | `program_head` UI | `inngest/functions/compute-period-attainment.ts` |
| `obe/score.updated` | Score save API | `inngest/functions/mark-attainment-stale.ts` |
| `obe/report.generate-requested` | Reports API | `inngest/functions/generate-accreditation-report.ts` |
| `obe/cqi.threshold-breached` | Compute function | `inngest/functions/notify-program-head.ts` |

---

## PHASE 1 — FOUNDATION & DATABASE

> **Goal:** Project bootstrapped, schema migrated, seed data working, auth wired up, login page functional.

### Deliverables

1. **`package.json`** — exact dependencies:
   - `next@14`, `react@18`, `typescript@5`, `tailwindcss`, `@prisma/client`, `prisma`
   - `next-auth@5` (beta), `@auth/prisma-adapter`, `inngest`, `@sentry/nextjs`
   - `@upstash/redis`, `@upstash/ratelimit`, `zod`, `react-hook-form`, `@hookform/resolvers`
   - `@react-pdf/renderer`, `recharts`, `lucide-react`, `@radix-ui/react-*`
   - `vitest`, `@playwright/test`

2. **`tsconfig.json`** — strict mode, path aliases (`@/lib/*`, `@/app/*`, `@/components/*`, `@/types/*`, `@/inngest/*`)

3. **`prisma/schema.prisma`** — full Panabo schema above (no `campus_id` on tenant tables)

4. **`prisma/seed.ts`** — seed:
   - 2 departments: `College of Computing Studies (CCS)`, `College of Business (COB)`
   - 2 grading systems: one CHED (percentage, threshold 75%), one TESDA (competency)
   - 2 programs: `BS Information Technology` (CHED), `Computer Systems Servicing NC II` (TESDA)
   - 1 academic period: `1st Semester AY 2024–2025` (active)
   - 7 users (one per role) with emails `{role}@panabo.aces.edu.ph`
   - Accreditor `accreditor_expires_at` = 30 days from now

5. **`lib/db.ts`** — Prisma singleton
6. **`lib/db-rls.ts`** — `withRLS(userId, role, fn)` — no campusId
7. **`lib/auth.ts`** — Auth.js v5 config with Prisma adapter, credential provider, JWT callbacks
8. **`lib/auth-helpers.ts`** — `requireAuth(allowedRoles?)`
9. **`lib/audit.ts`** — `auditLog(tx, params)`
10. **`lib/inngest.ts`** — Inngest client init
11. **`types/auth.ts`** — Auth.js session type augmentation
12. **`middleware.ts`** — protect `/(dashboard)/*`, accreditor expiry check
13. **`next.config.js`** — CSP headers, Supabase image domain
14. **`app/(auth)/login/page.tsx`** + **`_components/login-form.tsx`** — email/password login
15. **`app/(dashboard)/layout.tsx`** — sidebar with role-based nav, "ACES Panabo" header (no campus switcher)
16. **`app/api/auth/[...nextauth]/route.ts`** — Auth.js route handler
17. **`app/api/inngest/route.ts`** — Inngest webhook handler
18. **`vitest.config.ts`** + **`playwright.config.ts`** + **`.env.example`**
19. **`supabase/migrations/001_rls_base.sql`** — RLS on all tables, role-based policies (no campus filter)

**Acceptance:** `npm run build` clean, `npx prisma db seed` succeeds, login works for all 7 roles.

---

## PHASE 2 — ADMIN PANEL & USER MANAGEMENT

> **Goal:** Admin can manage users, departments, programs, academic periods, and grading systems.

### Deliverables

1. **`app/(dashboard)/admin/users/`** — full CRUD: list, create, edit, soft-delete users
   - Filter by role, department, search by name/email
   - Set accreditor expiry date via date picker
   - Reassign department
2. **`app/(dashboard)/admin/departments/`** — CRUD: manage departments, assign dean
3. **`app/(dashboard)/admin/programs/`** — CRUD: manage programs, assign program head, set mode (CHED/TESDA)
4. **`app/(dashboard)/admin/periods/`** — CRUD: academic periods, activate/lock controls
5. **`app/(dashboard)/admin/grading-systems/`** — CRUD: thresholds (all DB-read, never hardcoded)
6. **`app/(dashboard)/admin/audit-logs/`** — read-only audit log viewer with filters
7. **`app/api/admin/users/route.ts`** + **`[id]/route.ts`** — user API with RLS + audit
8. **`app/api/admin/departments/route.ts`** + **`[id]/route.ts`**
9. **`app/api/admin/programs/route.ts`** + **`[id]/route.ts`**
10. **`app/api/admin/periods/route.ts`** + **`[id]/route.ts`**
11. **`components/ui/data-table.tsx`** — shared DataTable with sort, search, pagination
12. **`components/layout/dashboard-shell.tsx`** + **`page-header.tsx`**

**Acceptance:** All admin CRUD operations work, soft-delete respected, audit logs appear for every mutation.

---

## PHASE 3 — CURRICULUM & OBE STRUCTURE

> **Goal:** Program heads can define the full OBE hierarchy and curriculum map.

### Deliverables

1. **`app/(dashboard)/programs/[id]/`** — program dashboard
2. **`app/(dashboard)/programs/[id]/goals/`** — Institutional Goals management
3. **`app/(dashboard)/programs/[id]/peos/`** — PEO management + link to institutional goals
4. **`app/(dashboard)/programs/[id]/plos/`** — PLO management + PEO-PLO weight matrix
5. **`app/(dashboard)/programs/[id]/courses/`** — Course catalog management
6. **`app/(dashboard)/programs/[id]/courses/[courseId]/clos/`** — CLO management + PLO-CLO weight mapping
7. **`app/(dashboard)/programs/[id]/curriculum-map/`** — I/D/A matrix (Course × PLO grid)
   - Color coded: I = blue-600, D = green-600, A = amber-600
8. **Curriculum snapshot logic** — `lib/curriculum/snapshot.ts`
   - Auto-snapshot on any PLO/CLO/mapping change (snapshot before save)
   - Snapshot viewer page showing history
9. **TESDA track:** `app/(dashboard)/programs/[id]/qualifications/` — TESDA qualification + units + performance criteria CRUD
10. All APIs: `app/api/programs/[id]/peos/`, `plos/`, `clos/`, `curriculum-map/`, `snapshots/`

**Acceptance:** Full OBE hierarchy editable, curriculum map renders correctly, snapshot created on every edit.

---

## PHASE 4 — ASSESSMENT, SCORES & ATTAINMENT ENGINE

> **Goal:** Faculty enters scores; attainment is computed and stored.

### Deliverables

1. **`app/(dashboard)/faculty/assignments/`** — faculty sees their assigned courses per period
2. **`app/(dashboard)/faculty/courses/[assignmentId]/scores/`** — score entry grid (student × assessment)
   - Bulk CSV import support
   - Mark as excused
   - Shows Stale badge after score save
3. **`app/(dashboard)/faculty/courses/[assignmentId]/assessments/`** — define assessment tools + CLO alignment
4. **`lib/obe/ched-engine.ts`** — exact formulas:
   - `computeCloAttainment(input)` — students passing / scored * 100
   - `computePloAttainment(input)` — weighted average of eligible CLOs
   - `computePeoAttainment(input)` — weighted average of PLOs
5. **`lib/obe/tesda-engine.ts`** — SEPARATE, NEVER import from ched-engine:
   - `computeUnitResult(pcResults)` — all competent → competent
   - `computeQualificationResult(unitResults)`
6. **`inngest/functions/compute-period-attainment.ts`** — triggered by `obe/period.compute-requested`
   - Steps: fetch snapshot → compute CLO → compute PLO → compute PEO → upsert results → check thresholds → fire CQI if breached
7. **`inngest/functions/mark-attainment-stale.ts`** — triggered by `obe/score.updated`
   - Sets `isStale = true` on all AttainmentResults for the period
8. **`app/(dashboard)/programs/[id]/attainment/`** — attainment dashboard
   - Stale / Provisional badges
   - Recharts bar chart with threshold reference line
   - Trigger compute button (fires Inngest event)
9. **TESDA track:** `app/(dashboard)/faculty/tesda/[courseId]/`** — PC assessment entry grid
10. All APIs: `app/api/scores/`, `app/api/attainment/compute/`, `app/api/tesda/assessments/`
11. **`tests/obe/ched-engine.test.ts`** — 20+ unit tests for attainment formulas

**Acceptance:** Score entry → Stale badge → Compute → Attainment results appear with correct values.

---

## PHASE 5 — REPORTS, ANALYTICS & PDF GENERATION

> **Goal:** Reports generated via Inngest, analytics dashboards visible by role.

### Deliverables

1. **`app/(dashboard)/reports/`** — report request list + status (pending / processing / ready / failed)
   - Download button (signed URL, 24hr expiry)
   - Request new report form (program, period, type)
2. **`inngest/functions/generate-accreditation-report.ts`** — triggered by `obe/report.generate-requested`
   - Steps: fetch data → render PDF → upload to Supabase storage → update Report record to `ready`
3. **PDF templates** (via `@react-pdf/renderer`, Inngest only):
   - `lib/pdf/ched-compliance-template.tsx` — CHED CMO compliance report
   - `lib/pdf/tesda-competency-template.tsx` — TESDA competency matrix
   - `lib/pdf/curriculum-map-template.tsx` — I/D/A curriculum map
   - `lib/pdf/syllabus-template.tsx` — course syllabus
4. **`app/(dashboard)/analytics/`** — analytics dashboard
   - Stat cards: total programs, active students, CLOs meeting threshold, open CQI plans
   - Trend chart: attainment per period (Recharts LineChart)
   - Program comparison chart (Recharts BarChart)
5. **`app/api/reports/route.ts`** + **`[id]/download/route.ts`** — signed URL generation
6. **`app/api/analytics/summary/route.ts`** — aggregated stats

**Acceptance:** Reports requested → Inngest processes → status updates to `ready` → signed PDF downloadable.

---

## PHASE 6 — CQI, COMPLIANCE & SECURITY HARDENING

> **Goal:** CQI auto-triggers, RA 10173 compliance, full security hardening, demo-ready.

### Deliverables

1. **`inngest/functions/notify-program-head.ts`** — triggered by `obe/cqi.threshold-breached`
   - Creates `CqiActionPlan` record, creates `Notification` for program head
2. **`app/(dashboard)/cqi/`** — CQI action plans dashboard
   - List with filters: status, program, period
   - Edit action plan: description, responsible person, target date, status
   - Mark as completed
3. **`app/(dashboard)/privacy/`** — RA 10173 Privacy Dashboard (DPO only)
   - Student data export (JSON download)
   - Consent management table
   - Pseudonymization controls
4. **`app/(dashboard)/accreditor/`** — accreditor read-only dashboard
   - View programs, PLO attainment, evidence files, curriculum maps
   - No create/edit/delete controls visible
   - `/expired` page shown when `accreditorExpiresAt` is past
5. **`supabase/migrations/005_rls_audit_immutable.sql`**:
   - Enable RLS on `audit_logs`
   - INSERT policy for all authenticated roles
   - NO UPDATE, NO DELETE policies (immutable)
6. **Evidence upload** — `app/(dashboard)/evidence/upload/`
   - Upload files linked to a CLO, PLO, or CQI action plan
   - Store as signed URLs, `EvidenceFile` record created
7. **`app/api/privacy/export/[userId]/route.ts`** — RA 10173 data export
8. **Security checks:**
   - `next.config.js` CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.supabase.co`
   - Middleware checks `accreditorExpiresAt` on EVERY protected route
   - Grep codebase: `getPublicUrl` must return 0 results
   - Grep codebase: hardcoded numeric thresholds (75, 80, etc.) must return 0 results
9. **`docs/DEMO_SCRIPT.md`** — 10-step panel demo walkthrough (see below)
10. **Final test suite:**
    - `tests/obe/ched-engine.test.ts` — 20 CLO/PLO/PEO formula tests
    - `tests/obe/tesda-engine.test.ts` — 10 competency tests
    - `tests/api/scores.test.ts` — 5 API validation tests
    - `tests/e2e/score-entry.spec.ts` — Playwright: faculty enters scores → stale badge
    - `tests/e2e/report-generation.spec.ts` — Playwright: request report → status ready
    - `tests/e2e/accreditor-expiry.spec.ts` — Playwright: expired accreditor redirected

**Acceptance:** Full acceptance checklist passes (see PROGRESS.md).

---

## PANEL DEMO SCRIPT (10 Steps)

```
1. Login as super_admin → show full dashboard, audit log access
2. Login as campus_admin → manage users, show accreditor with expiry date
3. Login as program_head → edit PLO mapping → verify snapshot auto-created
4. Login as faculty → enter 3 scores → verify Stale badge appears
5. Trigger compute → attainment results appear with correct percentages
6. PLO below threshold → CQI action plan auto-created by Inngest
7. Generate CHED Compliance PDF → download and open
8. Show accreditor login with future expiry → works
   → Set expiry to past via admin → login attempt → redirected to /expired
9. Show audit log with all actions logged (immutable)
10. Privacy export for a student → JSON output (RA 10173)
```

---

*ACES Polytechnic College · OBE Cycle Management System · Panabo Campus · Davao Region XI, PH*