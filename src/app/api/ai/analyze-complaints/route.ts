
import {NextResponse} from 'next/server';
import {analyzeComplaints, type AnalyzeComplaintsInput} from '@/ai/flows/analyze-complaints-flow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.complaints || !Array.isArray(body.complaints)) {
      return NextResponse.json({error: 'Invalid input: "complaints" array is required.'}, {status: 400});
    }

    // Transform the input strings to the expected schema for the flow
    const flowInput: AnalyzeComplaintsInput = {
      complaints: body.complaints.map((text: string) => ({ text })),
    };

    const result = await analyzeComplaints(flowInput);
    return NextResponse.json(result);
  } catch (error: any) {
    // console.error('Error in /api/ai/analyze-complaints:', error);
    return NextResponse.json(
        {error: error.message || 'Failed to analyze complaints'},
        {status: 500}
    );
  }
}
