import { NextResponse } from 'next/server';
import { generateSessionInsights } from '@/ai/flows/generate-session-insights';

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const result = await generateSessionInsights(input);
    return NextResponse.json(result);
  } catch (e) {
    console.error('Error generating session insights:', e);
    return NextResponse.json({ error: 'Failed to generate session insights' }, { status: 500 });
  }
}
