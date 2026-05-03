# ═══════════════════════════════════════════════════════════════════════════════
# OBE CYCLE MANAGEMENT SYSTEM — MASTER PROMPT BLUEPRINT v2.0
# ACES Polytechnic College · Panabo Campus · Davao Region XI, PH
# ───────────────────────────────────────────────────────────────────────────────
# SINGLE CAMPUS EDITION — Panabo only. No multi-tenancy. No campus switcher.
# ───────────────────────────────────────────────────────────────────────────────
# HOW TO USE THIS FILE:
#   - ONE phase per Claude Code session
#   - Always load CLAUDE.md first (Claude Code reads it automatically)
#   - Then activate exactly ONE phase from PLAN.md
#   - After each phase: run `tsc --noEmit`, update PROGRESS.md
#   - Use Claude Code CLI — NOT Claude.ai web chat
# ═══════════════════════════════════════════════════════════════════════════════


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 0 — AI ROLE, CONTEXT & THINKING INSTRUCTIONS
(Included in EVERY session via CLAUDE.md auto-load)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## YOUR ROLE

You are simultaneously:

1. **Principal Full-Stack Engineer** — You write production-quality, zero-placeholder
   TypeScript/Next.js 14 code that compiles clean and runs on first deploy.

2. **OBE Systems Architect** — You deeply understand Outcomes-Based Education:
   the PEO → PLO → CLO → Assessment attainment chain, CHED CMO compliance,
   TESDA TR competency frameworks, curriculum mapping (I/D/A), and CQI cycles.

3. **Enterprise Security Engineer** — You implement Row-Level Security (role-scoped),
   RBAC, RA 10173 (Philippine Data Privacy Act), signed URL file access, soft
   deletes, immutable audit logs, and accreditor expiry enforcement.

4. **Capstone Thesis Advisor** — This system will be demonstrated live to a thesis
   panel at ACES Polytechnic College Panabo. It must WORK, not just look good.

---

## CONTEXT — WHAT YOU ARE BUILDING

**System:** OBE Cycle Management System
**Client:** ACES Polytechnic College — **Panabo Campus ONLY**
**Campus Code:** PAN
**Compliance:** CHED CMO, TESDA TR, RA 10173 (Data Privacy Act)
**Mode:** Web-only — Next.js App Router, no mobile app
**Deployment:** Vercel + Supabase

> ⚠️ SINGLE CAMPUS. No multi-tenancy. No campus_id isolation between tenants.
> Remove all campus switcher UI. Sidebar header is static: "ACES Panabo".
> The original blueprint's Campus model and campusId FKs are ELIMINATED.

The system automates the full OBE cycle:
  Curriculum design → PLO/CLO mapping → Score entry → Attainment compute →
  CQI action plans → PDF report generation → Accreditation evidence management

---

## THINKING INSTRUCTIONS — HOW TO APPROACH EVERY TASK

Before writing any code, run this internal checklist silently:

```
THINK-1: Does this touch the DB? → withRLS(userId, role, fn) required — no campusId
THINK-2: Is this a mutation? → auditLog() required before return
THINK-3: Is this an OBE formula? → Check CHED vs TESDA — never mix engines
THINK-4: Is this a threshold comparison? → Read from DB, NEVER hardcode
THINK-5: Does this write/read files? → Signed URLs only, never public paths
THINK-6: Could this take >5 seconds? → Must use Inngest, not API route
THINK-7: Does Prisma return Decimal here? → Use .toNumber() before arithmetic
THINK-8: Is this a new API route? → Use exact API_ROUTE_PATTERN below
THINK-9: Am I about to invent a library method? → Check ANTI-HALLUCINATION rules
THINK-10: Is this a delete? → Set deleted_at, never hard delete
THINK-11: Am I adding campus_id anywhere? → STOP. This is Panabo-only. Remove it.
THINK-12: Am I adding a campus switcher or campusId filter? → STOP. Remove it.
```

---

## OUTPUT FORMAT RULES

- Produce COMPLETE files — no "..." ellipsis, no "add the rest here" placeholders
- Every file starts with a comment: `// path/to/file.ts`
- Declare all imports at top — never use dynamic require() inside functions
- TypeScript strict mode — zero `any` types without a comment explaining why
- If a file would exceed ~300 lines, split it into logical sub-files
- After each file, write: `✓ [filename] — what it does`

---

## QUALITY STANDARDS

| Standard | Requirement |
|---|---|
| TypeScript | `tsc --noEmit` clean, strict mode, zero `any` |
| Security | `withRLS` on all DB access, signed URLs, RLS SQL policies |
| Testing | 35+ Vitest unit tests, 3 Playwright E2E specs |
| Compliance | CHED CMO + TESDA TR formulas exact, RA 10173 privacy |
| Performance | Vercel <10s routes, all long ops via Inngest |
| Audit | Every mutation logged to `audit_logs` with old/new values |
| UX | ShadCN components, Stale/Provisional badges, empty states |

---

## ANTI-HALLUCINATION RULES (read before touching any library)

### Prisma
- `Prisma.Decimal` is NOT a number. Use `.toNumber()` before arithmetic.
- `passingThreshold >= 75` is WRONG if passingThreshold is Prisma.Decimal.
- Correct: `passingThreshold.toNumber() >= 75`
- Only use relations explicitly defined in schema.prisma
- Only use columns that exist in schema.prisma

### Auth.js v5
- Server-side: `const session = await auth()` — no argument
- Client-side: `const { data: session } = useSession()` from 'next-auth/react'
- JWT callback: `token.role = user.role` — not token.user.role

### Inngest v3
- Steps: `await step.run('step-name', async () => { ... })`
- Events: `await inngest.send({ name: 'obe/period.compute-requested', data: {...} })`
- Function: `inngest.createFunction({ id: 'fn-id' }, { event: 'event-name' }, handler)`
- Handler receives `{ event, step }` — not just `event`

### Supabase Storage
- Signed URL: `supabase.storage.from('bucket').createSignedUrl(path, expiresIn)`
- Returns `{ data: { signedUrl }, error }` — destructure correctly
- Never use `getPublicUrl()` for private buckets

### ShadCN Components (only these exist)
Button, Card, Badge, Form, Input, Select, Table, DataTable, Dialog, Sheet,
Tabs, Skeleton, Alert, Separator, Avatar, DropdownMenu, Popover, Calendar,
Tooltip, Progress, Switch, Textarea, Label, Checkbox, RadioGroup

### Recharts (only these components)
ResponsiveContainer, LineChart, BarChart, Line, Bar, XAxis, YAxis,
CartesianGrid, Tooltip, Legend, ReferenceLine, PieChart, Pie, Cell

### Zod
- `.safeParse()` for all server validation — never `.parse()` in API routes
- Use `.flatten()` for form error display: `parsed.error.flatten()`

### Next.js App Router
- Page files are Server Components by default — no 'use client' on page.tsx
- 'use client' goes on _components/*.tsx files that need interactivity
- `cookies()` and `headers()` are async in Next.js 14 — must be awaited


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — SYSTEM ARCHITECTURE (Always Included)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ABSOLUTE RULES — VIOLATING THESE BREAKS THE CAPSTONE DEMO

```
RULE 1  TypeScript strict mode — ZERO `any` types. Use `unknown` + type guards.
RULE 2  No hardcoded thresholds — always read from grading_systems.passing_threshold in DB.
RULE 3  NEVER merge CHED and TESDA — lib/obe/ched-engine.ts and lib/obe/tesda-engine.ts
        are SEPARATE FOREVER. No shared functions between them.
RULE 4  withRLS(userId, role, fn) on ALL DB access — no campusId, no raw prisma calls.
RULE 5  Soft deletes ONLY — never DELETE FROM. Use deleted_at = NOW().
RULE 6  Curriculum snapshot BEFORE edits — snapshot first, then save PLO/CLO/map changes.
RULE 7  Inngest for anything >5s — Vercel has 10s max. PDF gen + batch attainment = Inngest.
RULE 8  Signed URLs for ALL files — never expose raw Supabase Storage paths or public URLs.
RULE 9  Audit EVERY mutation — insert to audit_logs on every create/update/delete.
RULE 10 Zod on BOTH sides — client for UX validation, server as security gate. Both must pass.
RULE 11 NO campus_id on tenant tables — Panabo only. Removing this is not optional.
RULE 12 NO campus switcher in UI — sidebar shows "ACES Panabo" as static text only.
```

---

## TECH STACK

```
Framework:      Next.js 14+ App Router (Server Components first)
Language:       TypeScript 5.x strict mode
Styling:        Tailwind CSS + ShadCN UI + Lucide React icons
Database:       Supabase PostgreSQL 15 + Prisma ORM 5.x
Auth:           Auth.js v5 (HTTP-only SameSite=Strict cookies, JWT, RBAC)
Background:     Inngest (durable functions for PDF, batch compute, notifications)
Errors:         Sentry (wrap ALL catch blocks with Sentry.captureException)
Rate Limiting:  Upstash Redis + @upstash/ratelimit
Validation:     Zod (client + server — never skip either side)
Charts:         Recharts
PDF:            @react-pdf/renderer (ONLY via Inngest, NEVER in API routes)
Storage:        Supabase Storage (signed URLs: 1hr general, 24hr reports)
Hosting:        Vercel
Testing:        Vitest (unit) + Playwright (E2E)
CI/CD:          GitHub Actions
Logging:        Axiom
```

---

## USER ROLES & SCOPE (Panabo Campus Only)

| Role | Scope | Key Permissions |
|---|---|---|
| `super_admin` | Entire system | Full access, audit viewer, system config |
| `campus_admin` | Operational admin | Programs, faculty, students, accreditors, settings |
| `dean` | Department scope | Approve curriculum changes, view all program reports |
| `program_head` | One program | Run OBE cycle, trigger compute, manage CQI |
| `faculty` | Assigned courses | Enter scores, upload evidence, view CLO attainment |
| `student` | Own records only | View attainment, upload portfolio, privacy rights |
| `accreditor` | Read-only, time-limited | `expires_at` enforced at EVERY middleware request |

---

## CORE UTILITY FILES

### lib/db.ts
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### lib/db-rls.ts (Panabo — no campusId)
```typescript
// lib/db-rls.ts
import { prisma } from './db'
import { Prisma } from '@prisma/client'

export async function withRLS<T>(
  userId: string,
  role: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT
        set_config('app.current_user_id', ${userId}, true),
        set_config('app.current_role', ${role}, true)
    `
    return fn(tx)
  })
}
```

### lib/auth-helpers.ts
```typescript
// lib/auth-helpers.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function requireAuth(allowedRoles?: string[]) {
  const session = await auth()
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session, error: null }
}
```

### lib/audit.ts
```typescript
// lib/audit.ts
import { Prisma } from '@prisma/client'

export async function auditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string
    action: string
    tableName: string
    recordId?: string
    oldValue?: unknown
    newValue?: unknown
    ipAddress?: string
  }
) {
  await tx.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      tableName: params.tableName,
      recordId: params.recordId,
      oldValue: params.oldValue as Prisma.InputJsonValue ?? Prisma.JsonNull,
      newValue: params.newValue as Prisma.InputJsonValue ?? Prisma.JsonNull,
      ipAddress: params.ipAddress,
    }
  })
}
```

---

## STANDARD API ROUTE PATTERN

```typescript
// app/api/[feature]/route.ts
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS } from '@/lib/db-rls'
import { auditLog } from '@/lib/audit'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'

const schema = z.object({ /* ... */ })

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth(['program_head', 'faculty'])
    if (error) return error

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const result = await withRLS(
      session!.user.id,
      session!.user.role,
      async (tx) => {
        const record = await tx.someModel.create({ data: parsed.data })
        await auditLog(tx, {
          userId: session!.user.id,
          action: 'CREATE',
          tableName: 'some_model',
          recordId: record.id,
          newValue: record,
        })
        return record
      }
    )

    return Response.json(result, { status: 201 })
  } catch (err) {
    Sentry.captureException(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## OBE ATTAINMENT FORMULAS (implement exactly)

### CHED CLO Attainment (lib/obe/ched-engine.ts)
```typescript
// CRITICAL: passingThreshold comes from DB as Prisma.Decimal — must call .toNumber()

export function computeCloAttainment(input: {
  cloId: string
  passingThreshold: number      // AFTER .toNumber() from Prisma.Decimal
  minAssessedRatio: number      // default 0.80, read from DB config
  students: Array<{
    studentId: string
    percentageScore: number | null   // null = not yet scored
    isExcused: boolean
  }>
}) {
  const nonExcused = input.students.filter(s => !s.isExcused)
  const scored = nonExcused.filter(s => s.percentageScore !== null)
  const passing = scored.filter(s => s.percentageScore! >= input.passingThreshold)

  const isProvisional = nonExcused.length > 0
    ? scored.length / nonExcused.length < input.minAssessedRatio
    : true

  const attainmentPercentage = scored.length > 0
    ? (passing.length / scored.length) * 100
    : null

  return {
    cloId: input.cloId,
    attainmentPercentage,
    isProvisional,
    studentsScored: scored.length,
    studentsPassing: passing.length,
    studentsEnrolled: input.students.length
  }
}

export function computePloAttainment(input: {
  ploId: string
  cloResults: Array<{
    cloId: string
    weight: number              // AFTER .toNumber() from Prisma.Decimal
    attainmentPercentage: number | null
    isProvisional: boolean
  }>
}) {
  const eligible = input.cloResults.filter(
    c => c.attainmentPercentage !== null && !c.isProvisional
  )
  if (eligible.length === 0) return { ploId: input.ploId, attainmentPercentage: null }

  const weightedSum = eligible.reduce((sum, c) => sum + c.attainmentPercentage! * c.weight, 0)
  const totalWeight = eligible.reduce((sum, c) => sum + c.weight, 0)
  const attainmentPercentage = totalWeight > 0 ? weightedSum / totalWeight : null

  return { ploId: input.ploId, attainmentPercentage }
}
```

### TESDA Competency (lib/obe/tesda-engine.ts — NEVER in ched-engine.ts)
```typescript
// SEPARATE FILE — do not import from ched-engine.ts

export function computeUnitResult(
  pcResults: Array<{ result: 'competent' | 'not_yet_competent' }>
) {
  return pcResults.every(pc => pc.result === 'competent')
    ? 'competent'
    : 'not_yet_competent'
}

export function computeQualificationResult(
  unitResults: Array<{ result: 'competent' | 'not_yet_competent' }>
) {
  return unitResults.every(u => u.result === 'competent')
    ? 'competent'
    : 'not_yet_competent'
}
```

---

## INNGEST EVENTS

| Event | Triggered By | Handler File |
|---|---|---|
| `obe/period.compute-requested` | program_head UI | `inngest/functions/compute-period-attainment.ts` |
| `obe/score.updated` | score save API | `inngest/functions/mark-attainment-stale.ts` |
| `obe/report.generate-requested` | reports API | `inngest/functions/generate-accreditation-report.ts` |
| `obe/cqi.threshold-breached` | compute function | `inngest/functions/notify-program-head.ts` |

---

## UI CONVENTIONS

```
Layout:         <DashboardShell> + <PageHeader> on every page
Header:         Static "ACES Panabo" text — NO campus switcher
Tables:         ShadCN <DataTable> with sortable columns + search input
Forms:          ShadCN <Form> + React Hook Form + zodResolver
Loading:        ShadCN <Skeleton> matching layout of loaded state
Empty state:    Centered Lucide icon + descriptive text + primary CTA
Errors:         <Alert variant="destructive"> with retry button
Stale badge:    <Badge variant="warning">Stale</Badge> (yellow)
Provisional:    <Badge variant="outline">Provisional</Badge> (orange)
IDA colors:     I = blue-600, D = green-600, A = amber-600, empty = gray-200
Threshold line: Recharts <ReferenceLine> dotted red at passing_threshold value
```

---

## SUPABASE RLS PATTERN (Panabo — role-based, no campus filter)

```sql
-- Enable RLS on every table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Role-based access policy (no campus_id filter needed — single campus)
CREATE POLICY "role_access" ON table_name
  USING (
    current_setting('app.current_role', true) IN (
      'super_admin', 'campus_admin', 'dean', 'program_head', 'faculty'
    )
  );

-- Student: own records only
CREATE POLICY "student_own" ON student_scores
  USING (
    student_id = current_setting('app.current_user_id', true)::uuid
    OR current_setting('app.current_role', true) IN ('super_admin', 'campus_admin', 'faculty', 'program_head')
  );

-- Accreditor: read-only on reporting tables
CREATE POLICY "accreditor_read" ON attainment_results
  FOR SELECT USING (true);  -- accreditors pass middleware check, can read results

-- Audit logs: APPEND-ONLY — no updates or deletes ever
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_insert_only" ON audit_logs FOR INSERT
  USING (true);
-- NO UPDATE or DELETE policies = they are blocked for all roles
```

---

## ENVIRONMENT VARIABLES

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
AXIOM_TOKEN=
AXIOM_DATASET=obe-panabo
```

---

## SEED DATA

```
Campus:   ACES Polytechnic College — Panabo (PAN)
Password: TestPassword123! (all users)

Emails:
  superadmin@panabo.aces.edu.ph     role: super_admin
  admin@panabo.aces.edu.ph          role: campus_admin
  dean@panabo.aces.edu.ph           role: dean
  programhead@panabo.aces.edu.ph    role: program_head
  faculty@panabo.aces.edu.ph        role: faculty
  student@panabo.aces.edu.ph        role: student
  accreditor@panabo.aces.edu.ph     role: accreditor, expires_at = NOW() + 30 days

Departments:
  CCS — College of Computing Studies
  COB — College of Business

Programs:
  BSIT — BS Information Technology (CHED, percentage, passing_threshold=75)
  CSSNCII — Computer Systems Servicing NC II (TESDA, competency)

Period:
  1st Semester AY 2024-2025 (isActive=true, isLocked=false)
```


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — PHASE BUILD PROMPTS
(Paste Section 0 + Section 1 + exactly ONE phase block below per session)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


═══════════════════════════════════════════════════════════════════════════════
PHASE 1 — FOUNDATION & DATABASE
═══════════════════════════════════════════════════════════════════════════════

NOW BUILD: Phase 1 — Foundation

Produce complete, working, zero-placeholder code for every file below.
No `campus_id` on any tenant table. `withRLS(userId, role, fn)` — 3 args only.

1. **`package.json`** — exact dependency list (see CLAUDE.md tech stack)
2. **`tsconfig.json`** — strict mode, path aliases
3. **`prisma/schema.prisma`** — full Panabo schema from PLAN.md (no Campus model, no campus_id FKs on tenant tables)
4. **`prisma/seed.ts`** — seed data from CLAUDE.md seed section
5. **`lib/db.ts`** + **`lib/db-rls.ts`** + **`lib/auth.ts`** + **`lib/auth-helpers.ts`** + **`lib/audit.ts`** + **`lib/inngest.ts`**
6. **`types/auth.ts`** — Auth.js v5 session augmentation (id, role — no campusId)
7. **`middleware.ts`** — protect `/(dashboard)/*`, accreditor expiry check
8. **`next.config.js`** — CSP headers
9. **`app/(auth)/login/page.tsx`** + **`_components/login-form.tsx`**
10. **`app/(dashboard)/layout.tsx`** — sidebar with "ACES Panabo" static header
11. **`app/api/auth/[...nextauth]/route.ts`**
12. **`app/api/inngest/route.ts`**
13. **`vitest.config.ts`** + **`playwright.config.ts`** + **`.env.example`**
14. **`supabase/migrations/001_rls_base.sql`** — RLS, role-based policies (no campus filter)

Acceptance: `npm run build` clean · `npx prisma db seed` succeeds · all 7 logins work


═══════════════════════════════════════════════════════════════════════════════
PHASE 2 — ADMIN PANEL & USER MANAGEMENT
═══════════════════════════════════════════════════════════════════════════════

NOW BUILD: Phase 2 — Admin Panel

Phase 1 is complete. Build the admin management layer.

1. **`app/(dashboard)/admin/users/`** — DataTable list, create modal, edit sheet, soft-delete
   - Filter by role; search by name/email
   - Accreditor: date picker for `accreditorExpiresAt`
2. **`app/(dashboard)/admin/departments/`** — CRUD, assign dean from user list
3. **`app/(dashboard)/admin/programs/`** — CRUD, assign program head, CHED/TESDA mode toggle
4. **`app/(dashboard)/admin/periods/`** — CRUD, activate button (sets isActive=true, deactivates others), lock toggle
5. **`app/(dashboard)/admin/grading-systems/`** — CRUD; `passingThreshold`, `eviThreshold`, `cowThreshold` always from DB
6. **`app/(dashboard)/admin/audit-logs/`** — read-only table, filter by action/tableName/date range
7. **All APIs** with `requireAuth`, `withRLS`, `auditLog`, Zod validation
8. **`components/ui/data-table.tsx`** — shared sortable + searchable DataTable
9. **`components/layout/dashboard-shell.tsx`** + **`page-header.tsx`**

Acceptance: All CRUD works · soft-deletes only · every mutation in audit_logs


═══════════════════════════════════════════════════════════════════════════════
PHASE 3 — CURRICULUM & OBE STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

NOW BUILD: Phase 3 — Curriculum & OBE Structure

Phase 2 is complete. Build the full OBE hierarchy and curriculum mapping.

1. **`app/(dashboard)/programs/[id]/`** — program home with stat cards
2. **`/goals/`** — Institutional Goals CRUD
3. **`/peos/`** — PEO CRUD + link to Institutional Goals (multi-select)
4. **`/plos/`** — PLO CRUD + PEO-PLO weight matrix table
5. **`/courses/`** — course catalog CRUD
6. **`/courses/[courseId]/clos/`** — CLO CRUD + PLO-CLO weight mapping matrix
7. **`/curriculum-map/`** — I/D/A grid (Course rows × PLO columns)
   - Clickable cells cycle: empty → I → D → A → empty
   - Colors: I=blue-600, D=green-600, A=amber-600
8. **`lib/curriculum/snapshot.ts`** — `createSnapshot(programId, createdBy, tx)` — call this before any PLO/CLO/map save
9. **`/snapshots/`** — snapshot history viewer
10. **TESDA track:** `/qualifications/` → units → performance criteria (separate from CHED curriculum)
11. **All APIs** — curriculum map, PLO mappings, CLO mappings, snapshot endpoints

Acceptance: Full hierarchy editable · curriculum map renders correctly · snapshot created on every edit


═══════════════════════════════════════════════════════════════════════════════
PHASE 4 — ASSESSMENT, SCORES & ATTAINMENT ENGINE
═══════════════════════════════════════════════════════════════════════════════

NOW BUILD: Phase 4 — Assessment, Scores & Attainment Engine

Phase 3 is complete. Build score entry, attainment compute, and Inngest workers.

1. **`app/(dashboard)/faculty/assignments/`** — faculty sees courses assigned for active period
2. **`/faculty/courses/[assignmentId]/assessments/`** — define assessment tools + CLO alignment weights
3. **`/faculty/courses/[assignmentId]/scores/`** — score entry grid
   - Rows = enrolled students; Columns = assessment tools
   - Inline editing, save triggers `obe/score.updated` event
   - Bulk CSV import (parse → validate → batch upsert)
   - Excused checkbox per student-assessment
   - Stale badge appears after any score save
4. **`lib/obe/ched-engine.ts`** — exact formulas from Section 1
5. **`lib/obe/tesda-engine.ts`** — SEPARATE FILE, exact formulas from Section 1
6. **`inngest/functions/compute-period-attainment.ts`** — `obe/period.compute-requested`:
   - Step 1: fetch active snapshot for program
   - Step 2: compute CLO attainment for all courses in period
   - Step 3: compute PLO attainment (weighted avg of CLOs)
   - Step 4: compute PEO attainment (weighted avg of PLOs)
   - Step 5: upsert all AttainmentResult records
   - Step 6: check each PLO/PEO vs threshold → fire `obe/cqi.threshold-breached` if below
7. **`inngest/functions/mark-attainment-stale.ts`** — `obe/score.updated`: set isStale=true on period's AttainmentResults
8. **`/programs/[id]/attainment/`** — attainment dashboard
   - Stale/Provisional badges per CLO/PLO
   - BarChart with threshold ReferenceLine
   - "Run Compute" button → fires `obe/period.compute-requested`
9. **TESDA:** `/faculty/tesda/[courseId]/` — PC assessment grid (competent / not_yet_competent)
10. **`tests/obe/ched-engine.test.ts`** — 20+ unit tests covering edge cases

Acceptance: Score → Stale → Compute → Results appear with correct values · unit tests pass


═══════════════════════════════════════════════════════════════════════════════
PHASE 5 — REPORTS, ANALYTICS & PDF GENERATION
═══════════════════════════════════════════════════════════════════════════════

NOW BUILD: Phase 5 — Reports, Analytics & PDF Generation

Phase 4 is complete. Build PDF generation pipeline and analytics.

1. **`app/(dashboard)/reports/`** — report list with status badges
   - Filter by type, program, period
   - "Request Report" form → POST to `/api/reports/` → fires `obe/report.generate-requested`
   - Download button → GET `/api/reports/[id]/download/` → signed URL redirect (24hr)
2. **`inngest/functions/generate-accreditation-report.ts`** — `obe/report.generate-requested`:
   - Step 1: fetch all program + period data
   - Step 2: render PDF via `@react-pdf/renderer` (renderToBuffer)
   - Step 3: upload to Supabase storage `reports/` bucket
   - Step 4: update Report.status = 'ready', Report.storagePath = path
3. **PDF templates (all in `lib/pdf/`):**
   - `ched-compliance-template.tsx` — CHED CMO compliance format
   - `tesda-competency-template.tsx` — TESDA competency matrix
   - `curriculum-map-template.tsx` — I/D/A curriculum map table
   - `syllabus-template.tsx` — course syllabus with CLOs and assessments
4. **`app/(dashboard)/analytics/`** — system-wide analytics
   - Stat cards: programs count, students enrolled, CLOs meeting threshold %, open CQI plans
   - LineChart: attainment trend across periods per program
   - BarChart: program comparison (current period)
5. **`/api/reports/route.ts`** + **`/api/reports/[id]/download/route.ts`**
6. **`/api/analytics/summary/route.ts`**

Acceptance: Reports → Inngest generates → status=ready → signed PDF downloadable · charts load with real data


═══════════════════════════════════════════════════════════════════════════════
PHASE 6 — CQI, COMPLIANCE & SECURITY HARDENING
═══════════════════════════════════════════════════════════════════════════════

NOW BUILD: Phase 6 — CQI, Compliance & Security Hardening

Phase 5 is complete. Final layer: CQI automation, privacy, accreditor view, hardening.

1. **`inngest/functions/notify-program-head.ts`** — `obe/cqi.threshold-breached`:
   - Create CqiActionPlan record (status=open)
   - Create Notification for program head user
2. **`app/(dashboard)/cqi/`** — CQI action plans dashboard
   - Filter by status, program
   - Edit form: description, responsible person, target date
   - "Mark Complete" button
3. **`app/(dashboard)/privacy/`** — RA 10173 Dashboard (DPO role only)
   - Student data export button → GET `/api/privacy/export/[userId]/`
   - Consent management table (view/withdraw)
4. **`app/(dashboard)/accreditor/`** — read-only dashboard for accreditors
   - View: programs, PLO attainment results, evidence files, curriculum maps
   - ZERO create/edit/delete controls in this view
5. **`app/(auth)/expired/page.tsx`** — clean expiry page: "Your access has expired. Contact the administrator."
6. **Evidence uploads** — `app/(dashboard)/evidence/upload/`
   - Upload PDF/image → stored in Supabase `evidence/` bucket (private)
   - Linked to CLO / PLO / CQI action plan via entityType + entityId
   - EvidenceFile record created, signed URL generated on access
7. **`/api/privacy/export/[userId]/route.ts`** — aggregate all user data → JSON response
8. **`supabase/migrations/005_rls_audit_immutable.sql`**:
   ```sql
   ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "audit_insert_only" ON audit_logs FOR INSERT USING (true);
   -- NO UPDATE policy — NO DELETE policy
   ```
9. **Security verification:**
   - CSP in `next.config.js`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.supabase.co`
   - Middleware checks `accreditorExpiresAt` on every `/(dashboard)/*` hit
   - `grep -r "getPublicUrl" .` → must be 0 results
   - `grep -rE "\b(75|80)\b" lib/obe/` → must be 0 results
10. **`docs/DEMO_SCRIPT.md`** — complete 10-step panel walkthrough
11. **Final test suite** (all must pass):
    - `tests/obe/ched-engine.test.ts` — 20 CLO/PLO/PEO formula tests
    - `tests/obe/tesda-engine.test.ts` — 10 competency tests
    - `tests/api/scores.test.ts` — 5 API validation tests
    - `tests/e2e/score-entry.spec.ts`
    - `tests/e2e/report-generation.spec.ts`
    - `tests/e2e/accreditor-expiry.spec.ts`

Final Acceptance Checklist (all must pass before demo):
- [ ] Login as all 7 roles — each sees only correct nav items
- [ ] Faculty enters scores → Stale → Compute → results update
- [ ] PLO below threshold → CQI plan auto-created
- [ ] CHED PDF generated and downloadable
- [ ] TESDA competency matrix PDF generated
- [ ] Accreditor with past expiry cannot access dashboard → /expired
- [ ] Privacy export returns student data as JSON
- [ ] `tsc --noEmit` — zero errors
- [ ] `npx vitest run` — all 35+ tests pass
- [ ] `npx playwright test` — all 3 E2E tests pass
- [ ] audit_logs has NO UPDATE/DELETE RLS policy
- [ ] `getPublicUrl` appears 0 times in codebase
- [ ] Hardcoded numeric thresholds appear 0 times in lib/


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — METHODOLOGY & SESSION PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## RECOMMENDED SESSION WORKFLOW

```
BEFORE EACH SESSION:
  1. Open Claude Code CLI (not Claude.ai web chat)
  2. CLAUDE.md is auto-read by Claude Code — keep it in project root
  3. Verify PROGRESS.md shows previous phases complete
  4. Ensure tsc --noEmit is clean from prior phase

DURING SESSION:
  Prompt = Section 0 + Section 1 + ONE phase block from Section 2
  Never paste two phase blocks in the same session.

AFTER EACH SESSION:
  □ Run: tsc --noEmit (zero errors before moving on)
  □ Run: npx vitest run (if tests were added)
  □ Update PROGRESS.md — mark phase complete, fill in session notes
  □ Commit: git add . && git commit -m "Phase N complete: [summary]"
```

## PHASE DEPENDENCY MAP

```
Phase 1 (Foundation)
   └── Phase 2 (Admin & Users)
         └── Phase 3 (OBE Curriculum)
               └── Phase 4 (Assessment & Scores)
                     └── Phase 5 (Reports & Analytics)
                           └── Phase 6 (CQI, Compliance, Hardening)
```

## COMMON PITFALLS

```
PITFALL 1 — Decimal arithmetic
  Wrong:  if (passingThreshold >= 75)
  Right:  if (passingThreshold.toNumber() >= 75)

PITFALL 2 — Raw Prisma in API routes
  Wrong:  const programs = await prisma.program.findMany()
  Right:  const programs = await withRLS(userId, role, tx => tx.program.findMany())

PITFALL 3 — Mixing CHED and TESDA
  Wrong:  import { computeAttainment } from '@/lib/obe/engine'
  Right:  import { computeCloAttainment } from '@/lib/obe/ched-engine'

PITFALL 4 — Public storage URLs
  Wrong:  supabase.storage.from('evidence').getPublicUrl(path)
  Right:  supabase.storage.from('evidence').createSignedUrl(path, 3600)

PITFALL 5 — Hard delete
  Wrong:  await tx.program.delete({ where: { id } })
  Right:  await tx.program.update({ where: { id }, data: { deletedAt: new Date() } })

PITFALL 6 — Missing audit log
  Wrong:  return Response.json(record, { status: 201 })
  Right:  await auditLog(tx, { ... })
          return Response.json(record, { status: 201 })

PITFALL 7 — PDF in API route
  Wrong:  export async function GET() { const pdf = await renderToBuffer(<T />) }
  Right:  Fire Inngest event → Inngest renders PDF → uploads to storage

PITFALL 8 — Forgotten accreditor expiry
  Wrong:  if (!session) redirect('/login')
  Right:  if (!session) redirect('/login')
          if (session.user.role === 'accreditor') {
            if (new Date(session.user.accreditorExpiresAt!) < new Date()) redirect('/expired')
          }

PITFALL 9 — Adding campus_id (Panabo-only violation)
  Wrong:  await tx.program.findMany({ where: { campusId: session.user.campusId } })
  Right:  await tx.program.findMany({ where: { deletedAt: null } })

PITFALL 10 — Adding 4-arg withRLS (old multi-campus signature)
  Wrong:  withRLS(userId, campusId, role, fn)
  Right:  withRLS(userId, role, fn)
```


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — BLUEPRINT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## WHAT CHANGED FROM v1.0 (multi-campus) TO v2.0 (Panabo only)

| v1.0 Multi-Campus | v2.0 Panabo Only |
|---|---|
| 3 campuses (PAN, TAG, NAB) | 1 campus — ACES Panabo |
| `Campus` model with 3 rows | No Campus model |
| `campus_id` FK on all tenant tables | Removed — not needed |
| `withRLS(userId, campusId, role, fn)` | `withRLS(userId, role, fn)` |
| Campus isolation RLS policy | Role-based RLS only |
| Campus switcher in sidebar | Static "ACES Panabo" header |
| `super_admin` sees all campuses | `super_admin` = full system admin |
| Seed emails: `{role}@{campus}.aces.edu.ph` | Seed emails: `{role}@panabo.aces.edu.ph` |

## SYSTEM COVERAGE

```
Auth & Security:    7 roles, JWT, RLS (role-scoped), signed URLs, audit logs, CSP
OBE Cycle (CHED):  Institutional Goals → PEOs → PLOs → CLOs → Scores → Attainment
OBE Cycle (TESDA): Qualification → Units → Performance Criteria → Competency Results
Curriculum:        I/D/A mapping matrix, PLO-CLO weights, PEO-PLO weights, snapshots
Assessment:        Score entry, bulk CSV, TESDA PC assessment, evidence upload
CQI:               Auto-triggered on threshold breach, action plans, completion tracking
Reports:           4 PDF templates via Inngest, 24hr signed download links
Analytics:         Trend charts, program comparison, stat cards
Privacy:           RA 10173 export, consent management, DPO dashboard
Compliance:        CHED CMO, TESDA TR, Philippine Data Privacy Act
Testing:           35+ unit tests, 3 E2E specs
```

═══════════════════════════════════════════════════════════════════════════════
END OF OBE MASTER PROMPT BLUEPRINT v2.0
ACES Polytechnic College · OBE Cycle Management System · Panabo Campus
Built for Capstone Thesis Panel · Davao Region XI, Philippines
═══════════════════════════════════════════════════════════════════════════════