# PROGRESS.md — OBE Cycle Management System
## ACES Polytechnic College · Panabo Campus · Build Tracker

> **Update this file at the end of every Claude Code session.**
> Mark phases ✅ complete, 🔄 in-progress, or ⬜ not started.
> Record blockers, decisions, and deviations from the plan here.

---

## PROJECT STATUS

| Property | Value |
|---|---|
| **Started** | — |
| **Target Demo Date** | — |
| **Current Phase** | Phase 2 - Admin Panel & User Management |
| **Build Health** | `tsc --noEmit` ⬜ · `vitest run` ⬜ · `npm run build` ⬜ |

---

## PHASE TRACKER

### ✅ Phase 1 — Foundation & Database
- [x] `package.json` — all dependencies installed
- [x] `tsconfig.json` — strict mode, path aliases configured
- [x] `prisma/schema.prisma` — Panabo schema (no campus_id on tenant tables)
- [x] `prisma/seed.ts` — 7 roles seeded, 2 departments, 2 programs, 1 period
- [x] `lib/db.ts` — Prisma singleton
- [x] `lib/db-rls.ts` — `withRLS(userId, role, fn)` — no campusId param
- [x] `lib/auth.ts` — Auth.js v5 with Prisma adapter
- [x] `lib/auth-helpers.ts` — `requireAuth(allowedRoles?)`
- [x] `lib/audit.ts` — `auditLog(tx, params)`
- [x] `lib/inngest.ts` — Inngest client
- [x] `types/auth.ts` — session type augmentation
- [x] `middleware.ts` — route protection + accreditor expiry check
- [x] `next.config.js` — CSP headers
- [x] `app/(auth)/login/` — login page + form component
- [x] `app/(dashboard)/layout.tsx` — sidebar, "ACES Panabo" header (no campus switcher)
- [x] `app/api/auth/[...nextauth]/route.ts`
- [x] `app/api/inngest/route.ts`
- [x] `vitest.config.ts` + `playwright.config.ts` + `.env.example`
- [x] `supabase/migrations/001_rls_base.sql` — RLS, role-based policies

**Acceptance Gate:**
- [x] `npm run build` — zero errors
- [x] `npx prisma db seed` — succeeds
- [x] Login works for all 7 roles

**Session Notes:**
```
Date: —
Duration: —
Files created: —
Blockers: —
Decisions: —
```

---

### ⬜ Phase 2 — Admin Panel & User Management
- [ ] `app/(dashboard)/admin/users/` — full CRUD with role filter
- [ ] `app/(dashboard)/admin/departments/` — CRUD
- [ ] `app/(dashboard)/admin/programs/` — CRUD, assign program head, CHED/TESDA mode
- [ ] `app/(dashboard)/admin/periods/` — CRUD, activate/lock controls
- [ ] `app/(dashboard)/admin/grading-systems/` — threshold management (DB-read only)
- [ ] `app/(dashboard)/admin/audit-logs/` — read-only viewer with filters
- [ ] API routes: `/api/admin/users/`, `/api/admin/departments/`, `/api/admin/programs/`, `/api/admin/periods/`
- [ ] `components/ui/data-table.tsx` — shared DataTable
- [ ] `components/layout/dashboard-shell.tsx` + `page-header.tsx`

**Acceptance Gate:**
- [ ] All CRUD operations work for admin roles
- [ ] Soft-deletes respected (deleted_at set, not hard deleted)
- [ ] Every mutation appears in audit_logs
- [ ] Accreditor expiry date can be set via date picker

**Session Notes:**
```
Date: —
Duration: —
Files created: —
Blockers: —
Decisions: —
```

---

### ⬜ Phase 3 — Curriculum & OBE Structure
- [ ] `app/(dashboard)/programs/[id]/` — program dashboard
- [ ] Goals management — Institutional Goals CRUD
- [ ] PEO management — CRUD + goal linking
- [ ] PLO management — CRUD + PEO-PLO weight matrix
- [ ] Course catalog — CRUD
- [ ] CLO management — CRUD + PLO-CLO weight mapping
- [ ] Curriculum map — I/D/A matrix (Course × PLO grid, color coded)
- [ ] `lib/curriculum/snapshot.ts` — auto-snapshot on PLO/CLO/map changes
- [ ] Snapshot viewer page — history list
- [ ] TESDA track — qualification + units + performance criteria CRUD
- [ ] All curriculum APIs

**Acceptance Gate:**
- [ ] Full OBE hierarchy editable end-to-end
- [ ] Curriculum map renders with correct I/D/A colors
- [ ] Snapshot created on every PLO/CLO/mapping change
- [ ] Snapshot history shows correct effective dates

**Session Notes:**
```
Date: —
Duration: —
Files created: —
Blockers: —
Decisions: —
```

---

### ⬜ Phase 4 — Assessment, Scores & Attainment Engine
- [ ] Faculty assignment view — assigned courses per period
- [ ] Score entry grid — student × assessment, bulk CSV import, excused flag
- [ ] Stale badge appears immediately after score save
- [ ] Assessment tool management — define tools + CLO alignment
- [ ] `lib/obe/ched-engine.ts` — CLO/PLO/PEO attainment formulas
- [ ] `lib/obe/tesda-engine.ts` — unit/qualification competency logic (SEPARATE FILE)
- [ ] `inngest/functions/compute-period-attainment.ts`
- [ ] `inngest/functions/mark-attainment-stale.ts`
- [ ] Attainment dashboard — badges, charts, compute trigger button
- [ ] TESDA PC assessment entry grid
- [ ] `tests/obe/ched-engine.test.ts` — 20+ unit tests

**Acceptance Gate:**
- [ ] Score entry → Stale badge visible
- [ ] Compute trigger → Inngest processes → attainment results appear
- [ ] CHED and TESDA engines are SEPARATE (no shared imports)
- [ ] All 20+ CHED formula unit tests pass
- [ ] Provisional badge shown when <80% of students scored

**Session Notes:**
```
Date: —
Duration: —
Files created: —
Blockers: —
Decisions: —
```

---

### ⬜ Phase 5 — Reports, Analytics & PDF Generation
- [ ] Report request list — status badges (pending/processing/ready/failed)
- [ ] Report request form — program, period, type selector
- [ ] Download button — signed URL, 24hr expiry
- [ ] `inngest/functions/generate-accreditation-report.ts`
- [ ] PDF templates (all via Inngest, never in API routes):
  - [ ] `lib/pdf/ched-compliance-template.tsx`
  - [ ] `lib/pdf/tesda-competency-template.tsx`
  - [ ] `lib/pdf/curriculum-map-template.tsx`
  - [ ] `lib/pdf/syllabus-template.tsx`
- [ ] Analytics dashboard — stat cards, trend chart, program comparison
- [ ] `/api/reports/` + `/api/reports/[id]/download/` — signed URL endpoint
- [ ] `/api/analytics/summary/` — aggregated stats

**Acceptance Gate:**
- [ ] Report requested → Inngest fires → status transitions: pending → processing → ready
- [ ] PDF downloadable via signed URL (expires after 24hr)
- [ ] Analytics charts render with real data
- [ ] No PDF rendering happens inside an API route

**Session Notes:**
```
Date: —
Duration: —
Files created: —
Blockers: —
Decisions: —
```

---

### ⬜ Phase 6 — CQI, Compliance & Security Hardening
- [ ] `inngest/functions/notify-program-head.ts` — CQI auto-trigger
- [ ] CQI dashboard — list, edit, mark completed
- [ ] Privacy dashboard — student export, consent table (DPO only)
- [ ] Accreditor read-only dashboard + `/expired` page
- [ ] Evidence file upload — linked to CLO/PLO/CQI
- [ ] `supabase/migrations/005_rls_audit_immutable.sql` — audit_logs immutable
- [ ] `/api/privacy/export/[userId]/route.ts` — RA 10173 export
- [ ] CSP headers verified in `next.config.js`
- [ ] `docs/DEMO_SCRIPT.md` — 10-step panel walkthrough
- [ ] `tests/obe/tesda-engine.test.ts` — 10 competency tests
- [ ] `tests/api/scores.test.ts` — 5 API validation tests
- [ ] `tests/e2e/score-entry.spec.ts`
- [ ] `tests/e2e/report-generation.spec.ts`
- [ ] `tests/e2e/accreditor-expiry.spec.ts`

**Acceptance Gate (all must pass before demo):**
- [ ] Login as all 7 roles — each sees only correct nav items
- [ ] Faculty enters scores → Stale → Compute → results update
- [ ] PLO below threshold → CQI plan auto-created by Inngest
- [ ] CHED PDF generated and downloadable
- [ ] TESDA competency matrix PDF generated
- [ ] Accreditor with past expiry cannot access dashboard
- [ ] Privacy export returns all student data as JSON
- [ ] `tsc --noEmit` — zero errors
- [ ] `npx vitest run` — all 35+ unit tests pass
- [ ] `npx playwright test` — all 3 E2E tests pass
- [ ] `audit_logs` has NO UPDATE/DELETE RLS policy
- [ ] `grep -r "getPublicUrl" .` → 0 results
- [ ] `grep -rE "\b(75|80|0\.75|0\.80)\b" lib/` → 0 hardcoded threshold results

**Session Notes:**
```
Date: —
Duration: —
Files created: —
Blockers: —
Decisions: —
```

---

## ARCHITECTURAL DECISIONS LOG

| Date | Decision | Rationale |
|---|---|---|
| — | Single campus (Panabo only) — removed `campus_id` from tenant tables | Scope simplification for capstone; no multi-tenant needed |
| — | `withRLS(userId, role, fn)` — no `campusId` param | No campus isolation needed; RLS enforces role-level access only |
| — | Removed `Campus` model entirely | Single institution; no user-facing campus concept |
| — | `super_admin` ≡ full system access (no cross-campus view) | Same as `campus_admin` but with audit log access and system config |
| — | Sidebar: "ACES Panabo" is static header text | No campus switcher needed; users always see their institution |

---

## BLOCKERS & OPEN QUESTIONS

*(Add blockers here as they arise)*

| # | Phase | Blocker | Status | Resolution |
|---|---|---|---|---|
| — | — | — | — | — |

---

## FINAL SECURITY CHECKLIST

Run these checks before the capstone demo:

```bash
# 1. TypeScript clean build
npx tsc --noEmit

# 2. Unit tests
npx vitest run

# 3. E2E tests
npx playwright test

# 4. No public storage URLs
grep -r "getPublicUrl" . --include="*.ts" --include="*.tsx"
# Expected: 0 results

# 5. No hardcoded thresholds
grep -rE "\b(75|80|0\.75|0\.80)\b" lib/ --include="*.ts"
# Expected: 0 results in lib/obe/ and lib/

# 6. Confirm audit_logs is append-only
# Check supabase/migrations/005_rls_audit_immutable.sql
# Must have INSERT policy, NO UPDATE or DELETE policies

# 7. Confirm accreditor expiry in middleware
grep -n "accreditorExpiresAt" middleware.ts
# Must appear

# 8. Confirm no raw prisma calls in API routes
grep -rn "prisma\." app/api/ --include="*.ts" | grep -v "withRLS"
# Expected: 0 direct prisma calls outside withRLS
```

---

*ACES Polytechnic College · OBE Cycle Management System · Panabo Campus · Davao Region XI, PH*
*Last Updated: — · Updated By: —*