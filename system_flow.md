# OBE Cycle Management System - Architecture & Flow Analysis

This document provides a comprehensive analysis of the OBE (Outcomes-Based Education) Cycle Management System, based on a scan of the project's codebase, schema, and directory structure. 

## 1. System Overview

The OBE Cycle Management System is a comprehensive platform designed for ACES Polytechnic College (Panabo Campus) to manage and track the entire Outcomes-Based Education process. It supports dual compliance for both **CHED** (Commission on Higher Education) and **TESDA** (Technical Education and Skills Development Authority).

**Tech Stack:**
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database Provider:** PostgreSQL (Supabase)
- **Styling:** Tailwind CSS

---

## 2. Core Entities & Database Schema

The database schema (`prisma/schema.prisma`) is organized into several key domains:

### A. Core Administration
- **Department:** Organizational units containing programs.
- **Program:** Academic programs (CHED or TESDA mode) with specific grading systems and levels.
- **User:** Users with distinct roles (`super_admin`, `campus_admin`, `dean`, `program_head`, `faculty`, `student`, `accreditor`).
- **AcademicPeriod:** Semesters or school terms used to track enrollments and assessments over time.
- **GradingSystem:** Configurable grading rules (percentage, points, competency) for programs.

### B. OBE Hierarchy (Curriculum Mapping)
- **InstitutionalGoal:** High-level goals of the institution.
- **ProgramEdObjective (PEO):** Broad goals for graduates a few years after graduation. Mapped to Institutional Goals.
- **ProgramLearningOutcome (PLO):** What students are expected to know upon graduation. Mapped to PEOs.
- **Course:** Subjects offered under a program.
- **CourseLearningOutcome (CLO):** Specific outcomes for a course. Mapped to PLOs.
- **CurriculumMap:** Maps Courses to PLOs with Introduced/Developed/Demonstrated (I/D/A) levels.

### C. Assessment & Scores
- **FacultyCourseAssignment:** Links faculty to specific courses and periods.
- **Enrollment:** Links students to courses.
- **AssessmentTool:** Tools used to evaluate students (formative, summative, performance, portfolio). Mapped to CLOs with specific weights.
- **StudentScore:** The actual scores achieved by students in assessments.
- **Rubric & RubricCriterion:** Structured grading tools for complex assessments.

### D. Attainment & Analytics
- **CurriculumSnapshot:** Version-controlled states of the curriculum for historical attainment tracking.
- **AttainmentResult:** The computed OBE attainment percentages for entities (CLO, PLO, PEO) based on student scores.

### E. TESDA Specific Models
- **TesdaQualification:** Specific NC (National Certificate) levels.
- **CompetencyUnit:** Units of competency under a qualification.
- **PerformanceCriteria:** Specific criteria for each unit.
- **PcAssessment:** Competency results (`competent`, `not_yet_competent`) for students.

### F. CQI (Continuous Quality Improvement) & Reports
- **CqiActionPlan:** Plans triggered when attainment falls below targets.
- **Report:** Generated reports (CHED compliance, TESDA competency, syllabus, etc.).

---

## 3. System User Flows & Dashboards

The UI is divided by roles and domains under `app/dashboard/`:

### A. Admin Flow (`/dashboard/admin`)
- **Functions:** System-wide configuration and oversight.
- **Pages:** 
  - Manage Users, Departments, Programs, Grading Systems, Academic Periods, and Audit Logs.

### B. Program Head / Dean Flow (`/dashboard/programs`)
- **Functions:** Curriculum design and OBE mapping.
- **Pages:**
  - View Program Details (`/programs/[id]`).
  - Manage the OBE Hierarchy: PEOs, PLOs, Courses, CLOs.
  - Establish Mappings: PLO-CLO mappings, Curriculum Map.
  - Track Attainment at the program level.
  - Manage Curriculum Snapshots.

### C. Faculty Flow (`/dashboard/faculty`)
- **Functions:** Teaching, assessment, and grading.
- **Pages:**
  - View Assigned Courses (`/faculty/assignments`).
  - Manage Assessments for courses.
  - Input Student Scores.

### D. Student Flow (`/dashboard/student`)
- **Functions:** View progress and grades.
- **Pages:**
  - View overall outcomes and competency attainment.

### E. Accreditor Flow (`/dashboard/accreditor`)
- **Functions:** Read-only access to verify OBE compliance and evidence.

---

## 4. API Endpoints & Functions

The backend logic is exposed via Next.js Route Handlers (`app/api/`):

- **Admin APIs:** `api/admin/*` (CRUD operations for periods, grading systems, departments, users, programs).
- **Program & OBE APIs:** `api/programs/[id]/*` (Manage PEOs, PLOs, Courses, CLOs, Curriculum mapping, Qualifications).
- **Faculty APIs:** `api/faculty/*` (Fetch assignments, manage course assessments, enrollments).
- **Scores APIs:** `api/scores` (Batch process or update student scores).
- **Attainment APIs:** `api/attainment/compute` (Trigger algorithms to calculate attainment percentages based on nested weights: Score -> Assessment -> CLO -> PLO -> PEO).
- **CQI & Reports APIs:** Manage Continuous Quality Improvement plans and trigger report generation downloads.
- **Analytics APIs:** `api/analytics/summary` (Fetch high-level statistics for dashboard widgets).

---

## 5. Architectural Patterns

1. **Role-Based Access Control (RBAC):** Using NextAuth and Middleware (`middleware.ts`), the system ensures that faculty cannot access admin routes, students cannot edit scores, etc.
2. **Relational Constraints & Cascades:** Prisma enforces strict relational links (e.g., you cannot have a CLO without a Course).
3. **Background Processing / Queues:** The presence of `api/inngest/route.ts` suggests the use of **Inngest** for background jobs (like batch calculation of attainment, report generation, or sending notifications asynchronously).
4. **Data Privacy:** Implements an Audit Log (`AuditLog`) and Data Privacy consents (`DataPrivacyConsent`) to track data changes and user consent, crucial for institutional compliance.

## Summary

The system is a fully-fledged, relational web application that models the strict hierarchy of educational outcomes. It starts from high-level Institutional Goals down to the individual Student Score on a specific Assessment Tool, with algorithms designed to roll those scores back up into aggregate "Attainment" metrics for program evaluation.
