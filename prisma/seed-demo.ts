// prisma/seed-demo.ts
import { PrismaClient, Role, ScaleType, ProgramMode, IdaLevel, AssessmentType, EnrollmentStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding OBE System Demo Data...')
  const passwordHash = await hash('TestPassword123!', 12)

  // 1. Departments & Grading Systems
  const ccs = await prisma.department.create({
    data: { name: 'College of Computing Studies', code: 'CCS' }
  })
  
  const chedGrading = await prisma.gradingSystem.create({
    data: { name: 'CHED Percentage', passingThreshold: 75, eviThreshold: 70, cowThreshold: 60, scaleType: ScaleType.percentage }
  })
  const tesdaGrading = await prisma.gradingSystem.create({
    data: { name: 'TESDA Competency', passingThreshold: 100, eviThreshold: 100, cowThreshold: 100, scaleType: ScaleType.competency }
  })

  // 2. Programs
  const bsit = await prisma.program.create({
    data: { name: 'BS Information Technology', code: 'BSIT', mode: ProgramMode.CHED, pqfLevel: 6, departmentId: ccs.id, gradingSystemId: chedGrading.id }
  })
  const css = await prisma.program.create({
    data: { name: 'Computer Systems Servicing NC II', code: 'CSSNCII', mode: ProgramMode.TESDA, departmentId: ccs.id, gradingSystemId: tesdaGrading.id }
  })

  // 3. Academic Period
  const period = await prisma.academicPeriod.create({
    data: { name: '1st Semester AY 2024-2025', startDate: new Date('2024-08-01'), endDate: new Date('2024-12-31'), isActive: true }
  })

  // 4. Users (Admin, Dean, Program Head, Faculty, Accreditor, Students)
  await prisma.user.createMany({
    data: [
      { email: 'admin@aces.edu.ph', passwordHash, firstName: 'System', lastName: 'Admin', role: Role.super_admin },
      { email: 'dean@aces.edu.ph', passwordHash, firstName: 'Maria', lastName: 'Santos', role: Role.dean, departmentId: ccs.id },
      { email: 'ph@aces.edu.ph', passwordHash, firstName: 'Juan', lastName: 'Dela Cruz', role: Role.program_head, departmentId: ccs.id },
      { email: 'faculty@aces.edu.ph', passwordHash, firstName: 'Ana', lastName: 'Reyes', role: Role.faculty, departmentId: ccs.id },
      { email: 'accreditor@ched.gov.ph', passwordHash, firstName: 'CHED', lastName: 'Auditor', role: Role.accreditor },
      ...Array.from({ length: 10 }).map((_, i) => ({
        email: `student${i + 1}@aces.edu.ph`, passwordHash, firstName: 'Student', lastName: `${i + 1}`, role: Role.student, departmentId: ccs.id
      }))
    ]
  })

  const students = await prisma.user.findMany({ where: { role: Role.student } })
  const faculty = await prisma.user.findFirstOrThrow({ where: { role: Role.faculty } })

  // 5. Institutional Goals & PEOs & PLOs (BSIT)
  const ig1 = await prisma.institutionalGoal.create({ data: { code: 'IG1', description: 'Technical Excellence' } })
  const peo1 = await prisma.programEdObjective.create({ data: { programId: bsit.id, code: 'PEO1', description: 'Be employed in IT industry' } })
  await prisma.peoPlanLink.create({ data: { peoId: peo1.id, goalId: ig1.id } })

  const plo1 = await prisma.programLearningOutcome.create({ data: { programId: bsit.id, code: 'PLO1', description: 'Apply computing knowledge' } })
  const plo2 = await prisma.programLearningOutcome.create({ data: { programId: bsit.id, code: 'PLO2', description: 'Design complex systems' } })
  
  await prisma.peoPloLink.createMany({
    data: [
      { peoId: peo1.id, ploId: plo1.id, weight: 0.6 },
      { peoId: peo1.id, ploId: plo2.id, weight: 0.4 }
    ]
  })

  // 6. Courses & CLOs
  const course = await prisma.course.create({
    data: { programId: bsit.id, code: 'IT101', name: 'Intro to Programming', units: 3, yearLevel: 1, semester: 1 }
  })
  
  const clo1 = await prisma.courseLearningOutcome.create({ data: { courseId: course.id, code: 'CLO1', description: 'Write basic algorithms', weight: 0.5 } })
  const clo2 = await prisma.courseLearningOutcome.create({ data: { courseId: course.id, code: 'CLO2', description: 'Debug programs', weight: 0.5 } })

  // Mappings
  await prisma.ploCloMapping.createMany({
    data: [
      { ploId: plo1.id, cloId: clo1.id, weight: 1.0 },
      { ploId: plo2.id, cloId: clo2.id, weight: 1.0 }
    ]
  })
  await prisma.curriculumMap.create({ data: { courseId: course.id, ploId: plo1.id, idaLevel: IdaLevel.I } })

  // 7. Enrollments & Assignments
  await prisma.facultyCourseAssignment.create({ data: { facultyId: faculty.id, courseId: course.id, periodId: period.id, section: 'A' } })
  await prisma.enrollment.createMany({
    data: students.map(s => ({ studentId: s.id, courseId: course.id, periodId: period.id, status: EnrollmentStatus.enrolled }))
  })

  // 8. Assessments & Scores
  const assessment = await prisma.assessmentTool.create({
    data: { courseId: course.id, periodId: period.id, name: 'Midterm Exam', assessmentType: AssessmentType.summative, maxScore: 100, weight: 1.0 }
  })
  await prisma.assessmentCloAlignment.createMany({
    data: [
      { assessmentId: assessment.id, cloId: clo1.id, contributionWeight: 0.5 },
      { assessmentId: assessment.id, cloId: clo2.id, contributionWeight: 0.5 }
    ]
  })

  // 7 high scores, 3 failing scores to trigger CQI warnings
  await prisma.studentScore.createMany({
    data: students.map((s, i) => ({
      studentId: s.id, assessmentId: assessment.id, rawScore: i < 7 ? 85 : 55, percentageScore: i < 7 ? 85 : 55
    }))
  })

  // 9. Curriculum Snapshot
  await prisma.curriculumSnapshot.create({
    data: {
      programId: bsit.id,
      effectiveFrom: new Date('2024-08-01'),
      createdBy: faculty.id,
      snapshotData: { peos: [peo1], plos: [plo1, plo2] }
    }
  })

  console.log('✅ Demo Seed Complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
