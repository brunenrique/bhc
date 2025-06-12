import { NextResponse } from "next/server";
import {
  generateReportDraft,
  GenerateReportDraftInputSchema,
} from "@/ai/flows/generate-report-draft-flow";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = GenerateReportDraftInputSchema.parse(body);
    const result = await generateReportDraft(input);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados de entrada inválidos" },
        { status: 400 },
      );
    }
    console.error("Error generating report draft:", e);
    return NextResponse.json(
      { error: "Failed to generate report draft" },
      { status: 500 },
    );
  }
}
