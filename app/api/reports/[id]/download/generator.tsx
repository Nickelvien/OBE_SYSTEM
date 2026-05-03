import { renderToStream } from '@react-pdf/renderer';
import { ChedComplianceReport } from '@/components/reports/ched-compliance';
import { TesdaCompetencyReport } from '@/components/reports/tesda-competency';

export async function generateReportStream(reportType: string, programName: string) {
  if (reportType === 'ched_compliance') {
    const mockPlos = [{ code: 'PLO1', description: 'Apply computing knowledge', attainment: 82 }];
    return await renderToStream(<ChedComplianceReport programName={programName} periodName="2024-2025" plos={mockPlos} />);
  } else {
    const mockStudents = [{ name: 'Juan Dela Cruz', result: 'competent' }];
    return await renderToStream(<TesdaCompetencyReport programName={programName} students={mockStudents} />);
  }
}
