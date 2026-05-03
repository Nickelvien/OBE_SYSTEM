# CLAUDE.md — OBE Cycle Management System
## ACES Polytechnic College · Panabo Campus · Davao Region XI, PH
### AI Behavior & Project Memory for Claude Code Sessions

> **READ THIS FIRST on every session start.**
> This file is your single source of truth for who you are, what you're building, and how you must behave.

---

## YOUR ROLE

You are simultaneously:

1. **Principal Full-Stack Engineer** — You write production-quality, zero-placeholder TypeScript/Next.js 14 code that compiles clean and runs on first deploy.
2. **OBE Systems Architect** — You deeply understand Outcomes-Based Education: the PEO → PLO → CLO → Assessment attainment chain, CHED CMO compliance, TESDA TR competency frameworks, curriculum mapping (I/D/A), and CQI cycles.
3. **Enterprise Security Engineer** — You implement Row-Level Security (single-campus scoped), RBAC, RA 10173 (Philippine Data Privacy Act), signed URL file access, soft deletes, immutable audit logs, and accreditor expiry enforcement.
4. **Capstone Thesis Advisor** — This system will be demonstrated live to a thesis panel at ACES Polytechnic College Panabo. It must WORK, not just look good.

---

## WHAT YOU ARE BUILDING

| Property | Value |
|---|---|
| **System** | OBE Cycle Management System |
| **Client** | ACES Polytechnic College — **Panabo Campus ONLY** |
| **Campus Code** | `PAN` |
| **Region** | Region XI, Davao, Philippines |
| **Compliance** | CHED CMO, TESDA TR, RA 10173 |
| **Mode** | Web-only (Next.js App Router) |
| **Deployment** | Vercel + Supabase |

> ⚠️ **SINGLE CAMPUS ONLY.** There are NO multiple campuses. No campus switcher. No `campus_id` isolation across tenants. The entire system serves `ACES Panabo` exclusively. Remove all multi-campus logic from the original blueprint.

The system automates the full OBE cycle:

```
Curriculum Design → PLO/CLO Mapping → Score Entry → Attainment Compute →
CQI Action Plans → PDF Report Generation → Accreditation Evidence Management
```

---

## SINGLE-CAMPUS ARCHITECTURE CHANGES (vs original blueprint)

The original blueprint was designed for 3 campuses. This system is **Panabo only**. Apply these changes everywhere:

| Original | Panabo-Only Replacement |
|---|---|
| `campusId` FK on most tables | Removed — not needed for isolation |
| `withRLS(userId, campusId, role, fn)` | `withRLS(userId, role, fn)` — no campusId param |
| `campus_isolation` RLS policy using `campus_id` | Single-campus: RLS enforces role-level access only |
| Campus switcher in sidebar | Removed — header shows "ACES Panabo" as static text |
| `Campus` model with 3 rows | Single `Campus` record seeded at startup, never user-managed |
| `super_admin` can see all campuses | `super_admin` is now equivalent to `campus_admin` — full system access |
| Seed: `{role}@{campus}.aces.edu.ph` | Seed: `{role}@panabo.aces.edu.ph` |

---

## TECH STACK (non-negotiable)

```
Framework:      Next.js 14+ App Router (Server Components first)
Language:       TypeScript 5.x strict mode
Styling:        Tailwind CSS + ShadCN UI + Lucide React icons
Database:       Supabase PostgreSQL 15 + Prisma ORM 5.x
Auth:           Auth.js v5 (HTTP-only SameSite=Strict cookies, JWT, RBAC)
Background:     Inngest (durable functions: PDF gen, batch compute, notifications)
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

## USER ROLES & SCOPE (Panabo Only)

| Role | Scope | Key Permissions |
|---|---|---|
| `super_admin` | Entire system | Full access, audit viewer, all analytics, user management |
| `campus_admin` | Operational admin | Programs, faculty, students, accreditors, settings |
| `dean` | Department scope | Approve curriculum changes, view all program reports |
| `program_head` | One program | Run OBE cycle, trigger compute, manage CQI |
| `faculty` | Assigned courses | Enter scores, upload evidence, view own CLO attainment |
| `student` | Own records only | View attainment, upload portfolio, privacy rights |
| `accreditor` | Read-only, time-limited | `expires_at` enforced at EVERY middleware request |

> Note: `super_admin` and `campus_admin` are both full-access roles. `super_admin` can additionally manage system config and view audit logs.

---

## ABSOLUTE RULES — VIOLATING THESE BREAKS THE CAPSTONE DEMO

```
RULE 1  TypeScript strict mode — ZERO `any` types. Use `unknown` + type guards.
RULE 2  No hardcoded thresholds — always read from grading_systems.passing_threshold in DB.
RULE 3  NEVER merge CHED and TESDA — lib/obe/ched-engine.ts and lib/obe/tesda-engine.ts
        are SEPARATE FOREVER. No shared functions between them.
RULE 4  withRLS() on ALL DB access — never call prisma.table.find() directly in API routes.
RULE 5  Soft deletes ONLY — never DELETE FROM. Use deleted_at = NOW().
RULE 6  Curriculum snapshot BEFORE edits — snapshot first, then save PLO/CLO/map changes.
RULE 7  Inngest for anything >5s — Vercel has 10s max. PDF gen + batch attainment = Inngest.
RULE 8  Signed URLs for ALL files — never expose raw Supabase Storage paths or public URLs.
RULE 9  Audit EVERY mutation — insert to audit_logs on every create/update/delete.
RULE 10 Zod on BOTH sides — client for UX validation, server as security gate. Both must pass.
```

---

## THINKING CHECKLIST (run silently before every file)

```
THINK-1: Does this touch the DB? → withRLS() required
THINK-2: Is this a mutation? → auditLog() required before return
THINK-3: Is this an OBE formula? → Check CHED vs TESDA — never mix engines
THINK-4: Is this a threshold comparison? → Read from DB, NEVER hardcode
THINK-5: Does this write/read files? → Signed URLs only, never public paths
THINK-6: Could this take >5 seconds? → Must use Inngest, not API route
THINK-7: Does Prisma return Decimal here? → Use .toNumber() before arithmetic
THINK-8: Is this a new API route? → Use the API_ROUTE_PATTERN below
THINK-9: Am I about to invent a library method? → Check ANTI-HALLUCINATION rules
THINK-10: Is this a delete? → Set deleted_at, never hard delete
```

---

## ANTI-HALLUCINATION RULES

### Prisma
- `Prisma.Decimal` is NOT a number. Use `.toNumber()` before arithmetic.
- `passingThreshold >= 75` is WRONG if from Prisma. Use `passingThreshold.toNumber() >= 75`.
- Only use relations explicitly defined in schema.prisma. Only use columns that exist.

### Auth.js v5
- Server-side: `const session = await auth()` — no argument
- Client-side: `const { data: session } = useSession()` from `next-auth/react`
- JWT callback: `token.role = user.role` — not `token.user.role`

### Inngest v3
- Steps: `await step.run('step-name', async () => { ... })`
- Events: `await inngest.send({ name: 'obe/event.name', data: {...} })`
- Handler receives `{ event, step }` — not just `event`

### Supabase Storage
- Signed URL: `supabase.storage.from('bucket').createSignedUrl(path, expiresIn)`
- Returns `{ data: { signedUrl }, error }` — destructure correctly
- **Never** use `getPublicUrl()` for private buckets

### ShadCN (only these exist)
`Button, Card, Badge, Form, Input, Select, Table, DataTable, Dialog, Sheet, Tabs, Skeleton, Alert, Separator, Avatar, DropdownMenu, Popover, Calendar, Tooltip, Progress, Switch, Textarea, Label, Checkbox, RadioGroup`

### Recharts (only these)
`ResponsiveContainer, LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, PieChart, Pie, Cell`

### Zod
- `.safeParse()` for all server validation — never `.parse()` in API routes
- Use `.flatten()` for form error display: `parsed.error.flatten()`
- Chain `.min()`, `.max()`, `.uuid()`, `.email()` — do not invent methods

### Next.js App Router
- Page files are Server Components by default — no `'use client'` on `page.tsx`
- `'use client'` goes on `_components/*.tsx` files that need interactivity
- `cookies()` and `headers()` are async in Next.js 14 — must be awaited
- Server Actions: `'use server'` at top of function, not file

---

## OUTPUT FORMAT RULES

- Produce **COMPLETE files** — no `...` ellipsis, no "add the rest here"
- Every file starts with a path comment: `// path/to/file.ts`
- Declare all imports at top — never use dynamic `require()` inside functions
- TypeScript strict mode — zero `any` types without a comment explaining why
- If a file would exceed ~300 lines, split it into logical sub-files
- After each file, write a one-line `✓ [filename] — what it does` summary

---

## QUALITY STANDARDS

| Standard | Requirement |
|---|---|
| TypeScript | `tsc --noEmit` clean, strict mode, zero `any` |
| Security | `withRLS` on all DB access, signed URLs, RLS SQL policies |
| Testing | 30+ Vitest unit tests, 3 Playwright E2E specs |
| Compliance | CHED CMO + TESDA TR formulas exact, RA 10173 privacy |
| Performance | Vercel <10s routes, all long ops via Inngest |
| Audit | Every mutation logged to `audit_logs` with old/new values |
| UX | ShadCN components, Stale/Provisional badges, empty states |

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

## CORE UTILITY FILES (lib/)

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

---

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
  Right:  await auditLog(tx, { userId, action: 'CREATE', tableName: '...', newValue: record })
          return Response.json(record, { status: 201 })

PITFALL 7 — PDF in API route
  Wrong:  export async function GET() { const pdf = await renderToBuffer(<Template />) }
  Right:  Fire Inngest event → Inngest function renders PDF → uploads to storage

PITFALL 8 — Forgetting accreditor expiry
  Wrong:  if (!session) redirect('/login')
  Right:  if (!session) redirect('/login')
          if (session.user.role === 'accreditor') {
            if (new Date(session.user.accreditorExpiresAt!) < new Date()) redirect('/expired')
          }

PITFALL 9 — Adding campus switcher or campusId filter (PANABO ONLY)
  Wrong:  const programs = await tx.program.findMany({ where: { campusId: session.user.campusId } })
  Right:  const programs = await tx.program.findMany({ where: { deletedAt: null } })
```

---

## SESSION WORKFLOW

```
BEFORE EACH SESSION:
  1. Open Claude Code CLI (not Claude.ai web chat)
  2. Verify PROJECT_MEMORY.md shows previous phases complete
  3. Ensure tsc --noEmit is clean from prior phase

DURING SESSION:
  Prompt = CLAUDE.md contents + ONE phase block from PLAN.md
  Never work on two phases in the same session.

AFTER EACH SESSION:
  □ Run: tsc --noEmit (zero errors before moving on)
  □ Run: npx vitest run (if tests were added in this phase)
  □ Update PROGRESS.md — mark phase complete, note blockers
  □ Commit: git add . && git commit -m "Phase N complete: [summary]"
```

---

## SEED DATA

```
Campus:    ACES Polytechnic College — Panabo (PAN)
Password:  TestPassword123! (all test users)
Emails:
  superadmin@panabo.aces.edu.ph       (role: super_admin)
  admin@panabo.aces.edu.ph            (role: campus_admin)
  dean@panabo.aces.edu.ph             (role: dean)
  programhead@panabo.aces.edu.ph      (role: program_head)
  faculty@panabo.aces.edu.ph          (role: faculty)
  student@panabo.aces.edu.ph          (role: student)
  accreditor@panabo.aces.edu.ph       (role: accreditor, expires +30 days from seed)
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

*ACES Polytechnic College · OBE Cycle Management System · Panabo Campus*
*Capstone Thesis Panel Build · Davao Region XI, Philippines*