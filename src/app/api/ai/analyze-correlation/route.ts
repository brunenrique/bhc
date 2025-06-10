import {NextResponse} from 'next/server';
import {analyzeCorrelation, type AnalyzeCorrelationInput} from '@/ai/flows/analyze-correlation-flow';

export async function POST(request: Request) {
  try {
    const body: AnalyzeCorrelationInput = await request.json();
    
    if (!body.variable1Name || !body.variable1Description || !body.variable2Name || !body.variable2Description) {
      return NextResponse.json({error: 'Invalid input: All variable names and descriptions are required.'}, {status: 400});
    }

    const result = await analyzeCorrelation(body);
    return NextResponse.json(result);
  } catch (error: any) {
    // console.error('Error in /api/ai/analyze-correlation:', error);
    return NextResponse.json(
        {error: error.message || 'Failed to analyze correlation'},
        {status: 500}
    );
  }
}
