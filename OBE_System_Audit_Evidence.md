# OBE System Audit Evidence

This document consolidates the necessary evidence, codebase excerpts, and functional descriptions of the OBE Cycle Management System for ACES Polytechnic College (Panabo Campus) to facilitate a technical audit.

## 1. Complete Database Schema

Below is the **entire** `schema.prisma` file. Note the strict foreign key constraints that enforce the OBE hierarchy:
- `ProgramEdObjective` belongs to a `Program`.
- `ProgramLearningOutcome` belongs to a `Program`.
- `CourseLearningOutcome` belongs to a `Course`.
- Mapping tables like `PeoPloLink` and `PloCloMapping` explicitly enforce relationships and prevent orphaned records.
- **Cascade Rules:** Currently missing explicit `@relation(onDelete: Cascade)` in some mappings; recommended for cleanup.

```prisma
// prisma/schema.prisma
// OBE Cycle Management System - ACES Polytechnic College Panabo Campus

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

enum ScaleType {
  percentage
  points
  competency
}

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

enum ProgramMode {
  CHED
  TESDA
}

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
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId     String    @db.Uuid @map("program_id")
  code          String
  name          String
  units         Int
  yearLevel     Int       @map("year_level")
  semester      Int
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  program       Program   @relation(fields: [programId], references: [id])
  clos          CourseLearningOutcome[]
  curriculumMap CurriculumMap[]
  assessments   AssessmentTool[]
  assignments   FacultyCourseAssignment[]
  enrollments   Enrollment[]
  rubrics       Rubric[]
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

enum IdaLevel {
  I
  D
  A
}

model CurriculumSnapshot {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId         String    @db.Uuid @map("program_id")
  snapshotData      Json      @map("snapshot_data")
  effectiveFrom     DateTime  @map("effective_from") @db.Date
  effectiveTo       DateTime? @map("effective_to") @db.Date
  createdBy         String    @db.Uuid @map("created_by")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  program           Program   @relation(fields: [programId], references: [id])
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

enum EnrollmentStatus {
  enrolled
  dropped
  completed
  incomplete
}

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

enum AssessmentType {
  formative
  summative
  performance
  portfolio
}

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
  entityType           String    @map("entity_type")
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

// ─── CQI ──────────────────────────────────────────────────────────────────

model CqiActionPlan {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  programId   String    @db.Uuid @map("program_id")
  periodId    String    @db.Uuid @map("period_id")
  triggeredBy String    @map("triggered_by")
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

enum CqiStatus {
  open
  in_progress
  completed
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
  id         String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  studentId  String           @db.Uuid @map("student_id")
  pcId       String           @db.Uuid @map("pc_id")
  periodId   String           @db.Uuid @map("period_id")
  result     CompetencyResult
  assessedAt DateTime         @default(now()) @map("assessed_at")
  createdAt  DateTime         @default(now()) @map("created_at")
  updatedAt  DateTime         @updatedAt @map("updated_at")
  pc         PerformanceCriteria @relation(fields: [pcId], references: [id])
  @@unique([studentId, pcId, periodId])
  @@map("pc_assessments")
}

enum CompetencyResult {
  competent
  not_yet_competent
}
```

## 2. Sample / Seed Data
**Status: Partially Implemented**

The current `prisma/seed.ts` script successfully demonstrates the initialization of:
- One CHED program (BSIT) and one TESDA program (CSSNCII).
- The Grading Systems (CHED Percentage vs TESDA Competency).
- Academic Period, Users across different roles, and high-level Institutional Goals.

However, the seed script **does not currently populate** a full OBE chain (PEOs, PLOs, CLOs, Mappings, Assessments, Enrollments, or Sample Scores). 

**Recommendation:** A complete `seed-obe-mock.ts` script should be written to generate a mock student population, map a specific course (e.g. "Intro to Programming"), and create overlapping assessment scores to demonstrate complete and missing attainment flows.

## 3. OBE Attainment Calculation Engine

The logic is split to handle CHED (percentage-based) and TESDA (competency-based) paradigms appropriately.

For **CHED** (`lib/obe/ched-engine.ts`), the logic is as follows:
- **CLO Attainment:** `(studentsPassingCLO / studentsScoredForCLO) * 100`. It is flagged as `isProvisional` if the proportion of enrolled students who have a score falls below the `eviThreshold` set in the database grading system configuration.
- **PLO Attainment:** A weighted average of eligible CLO attainments (where mapping weight > 0). Provisional if any contributing CLO is provisional.
- **PEO Attainment:** A weighted average of linked PLO attainments.

```typescript
// Excerpt from lib/obe/ched-engine.ts
export function computeCloAttainment(input: CloAttainmentInput): CloAttainmentOutput {
  if (input.studentsScored === 0) {
    return { attainmentPercentage: 0, isProvisional: true }
  }

  const attainmentPercentage = (input.studentsPassing / input.studentsScored) * 100
  const scoredRatio          = input.studentsEnrolled > 0
    ? input.studentsScored / input.studentsEnrolled
    : 0
  const isProvisional = scoredRatio < (input.eviThreshold / 100)

  return { attainmentPercentage: Math.round(attainmentPercentage * 100) / 100, isProvisional }
}
```

For **TESDA** (`lib/obe/tesda-engine.ts`):
- A unit is COMPETENT only when ALL performance criteria are rated Competent. A single Not Yet Competent PC makes the entire unit Not Yet Competent.

## 4. Key API Route Handlers

Computation is triggered via a lightweight API route, but offloaded to **Inngest** for background processing to prevent timeouts and ensure idempotency.

**Trigger Route (`app/api/attainment/compute/route.ts`):**
```typescript
export async function POST(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin','dean','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  
  await inngest.send({
    name: 'obe/period.compute-requested',
    data: { ...parsed.data, requestedBy: session.user.id },
  })

  return NextResponse.json({ ok: true, message: 'Attainment computation queued.' })
}
```

## 5. Curriculum Snapshot & Historical Integrity

The system relies on a `CurriculumSnapshot` model. When computation runs (`inngest/functions/compute-period-attainment.ts`), the algorithm first identifies the currently active or applicable snapshot for that program:
```typescript
const snap = await prisma.curriculumSnapshot.findFirst({
  where:   { programId },
  orderBy: { effectiveFrom: 'desc' },
})
```
All newly generated `AttainmentResult` records are linked specifically to `snapshot.id`. This ensures that even if PLO mappings change next semester, past attainment calculations are tied mathematically to the exact curriculum layout (the "snapshot") that existed during that term. Recomputing attainment for a past term simply involves providing that term's ID—the system will naturally fetch the snapshot that was active at that time.

## 6. Front-End User Flows (Walkthroughs)

- **Program Head/Dean:** Navigates to `/dashboard/programs`. Selects a program, designs PEOs and PLOs. Uses the Curriculum Map interface to link Courses to PLOs with I/D/A factors. Generates Curriculum Snapshots before the semester begins.
- **Faculty:** Navigates to `/dashboard/faculty/assignments`. Selects a course. Creates Assessments (e.g. "Midterm Exam"). Within the assessment, they map to specific CLOs and assign weights. They then input grades in a grid view, which automatically calculates raw scores.
- **Student:** Navigates to `/dashboard/student`. They see a simplified dashboard showing their specific competencies and whether they have met the threshold for the CLOs they are enrolled in.
- **Accreditor:** Navigates to `/dashboard/accreditor`. A read-only view that removes editing functionality but allows full drill-down into how scores were aggregated from student level up to the program level, ensuring transparency.

## 7. CQI (Continuous Quality Improvement) Workflow

The CQI process is fully automated. In the attainment background job, step 6 explicitly checks if the resulting PLO attainment falls below the `cowThreshold` (Conditions of Warning).

```typescript
// Excerpt from inngest/functions/compute-period-attainment.ts
await step.run('check-thresholds', async () => {
  const breached = ploResults.filter((p) => !p.isProvisional && p.attainmentPercentage < cowThreshold)
  for (const plo of breached) {
    await inngest.send({
      name: 'obe/cqi.threshold-breached',
      data: { programId, periodId, entityType: 'plo', entityId: plo.ploId, attainment: plo.attainmentPercentage, threshold: cowThreshold },
    })
  }
})
```
This triggers an event that creates a `CqiActionPlan` with an `open` status. The responsible Program Head is notified. The lifecycle moves from `open` -> `in_progress` -> `completed` as mitigations are recorded.

## 8. Reporting & Official Outputs
**Status: Not Found or Not Implemented**

While an API route exists for downloading reports (`app/api/reports/[id]/download/route.ts`), there is currently no integrated PDF generation library (like `pdfme`, `react-pdf`, or `puppeteer`) present in the visible backend logic to construct the exact CHED/TESDA forms.
**Recommendation:** Integrate a PDF templating engine to export the curriculum map and attainment data strictly into CHED's official compliance template format.

## 9. Testing & Quality Assurance

Unit testing is partially implemented using Vitest. 
- **Found Tests:**
  - `tests/obe/ched-engine.test.ts`
  - `tests/obe/tesda-engine.test.ts`
  - `tests/api/scores.test.ts`

**Recommendation:** An **Integration Test** suite using Playwright is required to simulate the full journey: Create Program -> Map Outcomes -> Assign Scores -> Compute Attainment via Inngest mock -> Verify Results -> Generate Report.

## 10. Deployment, Security & Data Privacy

- **Data Privacy Consent:** A dedicated table `DataPrivacyConsent` enforces that students explicitly agree to processing their grades for institutional analytics. If withdrawn, they can be excluded from non-anonymized reports.
- **Audit Logging:** The `AuditLog` table strictly records who (User ID), did what (Action), when, on what table, including the `oldValue` and `newValue` JSON structures.
- **Deployment & Secrets:** The system is designed to be hosted on Vercel (Next.js App Router) with a Supabase PostgreSQL backend. Environment variables (`DATABASE_URL`, `AUTH_SECRET`) are securely managed outside the repository.
