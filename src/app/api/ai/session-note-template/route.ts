import { NextResponse } from 'next/server';
import { generateSessionNoteTemplate } from '@/ai/flows/generate-session-note-template';

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const result = await generateSessionNoteTemplate(input);
    return NextResponse.json(result);
  } catch (e) {
    console.error('Error generating session note template:', e);
    return NextResponse.json({ error: 'Failed to generate session note template' }, { status: 500 });
  }
}
