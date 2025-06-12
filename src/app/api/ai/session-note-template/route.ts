import { NextResponse } from "next/server";
import {
  generateSessionNoteTemplate,
  GenerateSessionNoteTemplateInputSchema,
} from "@/ai/flows/generate-session-note-template";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = GenerateSessionNoteTemplateInputSchema.parse(body);
    const result = await generateSessionNoteTemplate(input);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados de entrada inválidos" },
        { status: 400 },
      );
    }
    console.error("Error generating session note template:", e);
    return NextResponse.json(
      { error: "Failed to generate session note template" },
      { status: 500 },
    );
  }
}
