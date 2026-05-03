import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateReportStream } from './generator';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const report = await prisma.report.findUniqueOrThrow({
      where: { id: params.id },
      include: { program: true }
    });

    const stream = await generateReportStream(report.reportType, report.program.name);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.program.code}-report.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
