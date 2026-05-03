You are a world-class full-stack engineer and educational technology consultant. I have built an OBE (Outcomes-Based Education) Cycle Management System for ACES Polytechnic College (Panabo Campus) using Next.js 14 (App Router), TypeScript, Prisma (PostgreSQL), Tailwind CSS, and Inngest for background jobs. The system handles both CHED and TESDA programs.

The core architecture is complete and correct: the database schema models the full OBE hierarchy with proper mappings (PEO, PLO, CLO, assessments, scores), attainment computation engines for CHED and TESDA, curriculum snapshot locking, and an automated CQI workflow with status tracking. Unit tests for the calculation engines exist.

However, to be “capstone defense-ready,” I must add these items. I need you to generate full, production-quality code and instructions for each of the following, based on the provided context.

1. **Full Mock Data Seed Script (`prisma/seed-demo.ts`)**
   - Populates the database with a realistic OBE scenario: one CHED program (BSIT) and one TESDA program (CSS NCII).
   - Create departmental, user roles (admin, dean, program head, faculty, 10 students, accreditor), academic period, grading systems, institutional goals, PEOs, PLOs, CLOs, courses, curriculum map (with I/D/A), CLO-PLO mappings (with numeric weights), curriculum snapshot, faculty assignments, enrollments, assessment tools with CLO alignment, and student scores (mix of high and low to trigger CQI).
   - Use Prisma client, create records in correct order, show the code.

2. **PDF Report Generation**
   - Implement the download endpoint (`app/api/reports/[id]/download/route.ts`) that generates a PDF using `@react-pdf/renderer`.
   - Provide two PDF templates as React components:
       - `components/reports/ched-compliance.tsx` – a document that outputs a CHED-style OBE compliance report with program details, PLO attainment table, and evidence of CQI.
       - `components/reports/tesda-competency.tsx` – a report listing students and their competency status per unit.
   - The API route should fetch the report record from the database (including associated program), decide which template to use, and return the PDF as a downloadable file.

3. **Database Cascade Migration**
   - Provide the updated Prisma schema snippets for the bridging tables (`PeoPloLink`, `PloCloMapping`, `CurriculumMap`, `AssessmentCloAlignment`) adding `onDelete: Cascade` to their relations, and the command to create the migration.

4. **CQI Management Page (`app/dashboard/programs/[id]/cqi/page.tsx`)**
   - A server component that fetches all `CqiActionPlan` records for the given program.
   - Displays them in cards with status badges (open, in_progress, completed), description, target date, and buttons to change status (using client components for interactivity).
   - Use Tailwind CSS for styling.

5. **Playwright End-to-End Test Script (`tests/e2e/obe-cycle.spec.ts`)**
   - Simulates a full OBE cycle:
       - Login as Program Head, navigate to a program, set up curriculum map, generate snapshot.
       - Logout, login as Faculty, open assigned course, create assessment with CLO alignment, enter scores for students.
       - Logout, login as Admin, trigger attainment computation (via API or UI).
       - Verify attainment results appear and download a report.
   - Use realistic selectors and test assertions.

6. **Capstone Presentation Script Outline**
   - A structured 10-slide outline covering problem statement, system overview, demo of the OBE loop (Plan, Do, Check, Act), reporting, testing, and conclusion.

Please output each item as a separate section with clear headings and the full code in markdown code blocks. Do not omit any part. The final output should be a comprehensive `OBE_Capstone_Completion.md` that I can directly use to implement these missing features.