import { NextResponse } from 'next/server';
import { generateReportDraft } from '@/ai/flows/generate-report-draft-flow';

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const result = await generateReportDraft(input);
    return NextResponse.json(result);
  } catch (e) {
    console.error('Error generating report draft:', e);
    return NextResponse.json({ error: 'Failed to generate report draft' }, { status: 500 });
  }
}
