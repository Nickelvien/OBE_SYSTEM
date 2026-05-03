// prisma/seed.ts
import { PrismaClient, Role, ScaleType, ProgramMode } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding OBE System — ACES Panabo...')

  const PASSWORD = 'TestPassword123!'
  const passwordHash = await hash(PASSWORD, 12)

  // ─── DEPARTMENTS ──────────────────────────────────────────────────────────
  const ccs = await prisma.department.upsert({
    where:  { code: 'CCS' },
    update: {},
    create: {
      name: 'College of Computing Studies',
      code: 'CCS',
    },
  })

  const cob = await prisma.department.upsert({
    where:  { code: 'COB' },
    update: {},
    create: {
      name: 'College of Business',
      code: 'COB',
    },
  })

  console.log('✓ Departments: CCS, COB')

  // ─── GRADING SYSTEMS ──────────────────────────────────────────────────────
  const chedGrading = await prisma.gradingSystem.upsert({
    where:  { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id:              '00000000-0000-0000-0000-000000000001',
      name:            'CHED Percentage Grading',
      passingThreshold: 75,
      eviThreshold:    70,
      cowThreshold:    60,
      scaleType:       ScaleType.percentage,
    },
  })

  const tesdaGrading = await prisma.gradingSystem.upsert({
    where:  { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id:              '00000000-0000-0000-0000-000000000002',
      name:            'TESDA Competency Assessment',
      passingThreshold: 100,
      eviThreshold:    100,
      cowThreshold:    100,
      scaleType:       ScaleType.competency,
    },
  })

  console.log('✓ Grading systems: CHED, TESDA')

  // ─── PROGRAMS ─────────────────────────────────────────────────────────────
  const bsit = await prisma.program.upsert({
    where:  { code: 'BSIT' },
    update: {},
    create: {
      name:            'BS Information Technology',
      code:            'BSIT',
      mode:            ProgramMode.CHED,
      pqfLevel:        6,
      departmentId:    ccs.id,
      gradingSystemId: chedGrading.id,
    },
  })

  const css = await prisma.program.upsert({
    where:  { code: 'CSSNCII' },
    update: {},
    create: {
      name:            'Computer Systems Servicing NC II',
      code:            'CSSNCII',
      mode:            ProgramMode.TESDA,
      departmentId:    ccs.id,
      gradingSystemId: tesdaGrading.id,
    },
  })

  console.log('✓ Programs: BSIT (CHED), CSSNCII (TESDA)')

  // ─── ACADEMIC PERIOD ──────────────────────────────────────────────────────
  await prisma.academicPeriod.upsert({
    where:  { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id:        '00000000-0000-0000-0000-000000000010',
      name:      '1st Semester AY 2024-2025',
      startDate: new Date('2024-08-01'),
      endDate:   new Date('2024-12-31'),
      isActive:  true,
      isLocked:  false,
    },
  })

  console.log('✓ Academic period: 1st Semester AY 2024-2025 (active)')

  // ─── USERS ────────────────────────────────────────────────────────────────
  const users: Array<{
    email:               string
    firstName:           string
    lastName:            string
    role:                Role
    departmentId?:       string
    isDpo?:              boolean
    accreditorExpiresAt?: Date
  }> = [
    {
      email:     'superadmin@panabo.aces.edu.ph',
      firstName: 'Super',
      lastName:  'Admin',
      role:      Role.super_admin,
      isDpo:     true,
    },
    {
      email:     'admin@panabo.aces.edu.ph',
      firstName: 'Campus',
      lastName:  'Admin',
      role:      Role.campus_admin,
    },
    {
      email:        'dean@panabo.aces.edu.ph',
      firstName:    'Maria',
      lastName:     'Santos',
      role:         Role.dean,
      departmentId: ccs.id,
    },
    {
      email:        'programhead@panabo.aces.edu.ph',
      firstName:    'Juan',
      lastName:     'Dela Cruz',
      role:         Role.program_head,
      departmentId: ccs.id,
    },
    {
      email:        'faculty@panabo.aces.edu.ph',
      firstName:    'Ana',
      lastName:     'Reyes',
      role:         Role.faculty,
      departmentId: ccs.id,
    },
    {
      email:        'student@panabo.aces.edu.ph',
      firstName:    'Carlo',
      lastName:     'Bautista',
      role:         Role.student,
      departmentId: ccs.id,
    },
    {
      email:               'accreditor@panabo.aces.edu.ph',
      firstName:           'CHED',
      lastName:            'Accreditor',
      role:                Role.accreditor,
      accreditorExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    },
  ]

  for (const userData of users) {
    await prisma.user.upsert({
      where:  { email: userData.email },
      update: { passwordHash },
      create: {
        email:               userData.email,
        passwordHash,
        firstName:           userData.firstName,
        lastName:            userData.lastName,
        role:                userData.role,
        departmentId:        userData.departmentId,
        isDpo:               userData.isDpo ?? false,
        accreditorExpiresAt: userData.accreditorExpiresAt,
      },
    })
    console.log(`✓ User: ${userData.email} (${userData.role})`)
  }

  // Link program head to BSIT
  const programHeadUser = await prisma.user.findUnique({
    where: { email: 'programhead@panabo.aces.edu.ph' },
  })
  if (programHeadUser) {
    await prisma.program.update({
      where: { id: bsit.id },
      data:  { programHeadId: programHeadUser.id },
    })
  }

  // Link dean to CCS
  const deanUser = await prisma.user.findUnique({
    where: { email: 'dean@panabo.aces.edu.ph' },
  })
  if (deanUser) {
    await prisma.department.update({
      where: { id: ccs.id },
      data:  { deanId: deanUser.id },
    })
  }

  // ─── INSTITUTIONAL GOALS ──────────────────────────────────────────────────
  const goals = [
    { code: 'IG1', description: 'Produce graduates with strong technical competencies relevant to industry needs.' },
    { code: 'IG2', description: 'Foster ethical, socially responsible, and culturally sensitive professionals.' },
    { code: 'IG3', description: 'Cultivate lifelong learning and adaptability in a dynamic technological environment.' },
  ]

  for (const goal of goals) {
    await prisma.institutionalGoal.upsert({
      where:  { code: goal.code },
      update: {},
      create: goal,
    })
  }

  console.log('✓ Institutional goals: IG1, IG2, IG3')
  console.log('')
  console.log('✅ Seed complete!')
  console.log('   All users: TestPassword123!')
  console.log(`   Programs: ${bsit.code} (CHED), ${css.code} (TESDA)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
