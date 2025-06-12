"use client";

import type {
  GenerateSessionInsightsInput,
  GenerateSessionInsightsOutput,
} from "@/ai/flows/generate-session-insights";
import type {
  GenerateReportDraftInput,
  GenerateReportDraftOutput,
} from "@/ai/flows/generate-report-draft-flow";
import type {
  GenerateSessionNoteTemplateInput,
  GenerateSessionNoteTemplateOutput,
} from "@/ai/flows/generate-session-note-template";

async function requestAI<T>(url: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Erro na requisição AI");
    }
    return res.json() as Promise<T>;
  } catch (e) {
    console.error("Erro na comunicação com o serviço de IA:", e);
    throw new Error(
      "Não foi possível conectar ao serviço de IA. Verifique sua conexão e tente novamente.",
    );
  }
}

export async function generateSessionInsights(
  input: GenerateSessionInsightsInput,
): Promise<GenerateSessionInsightsOutput> {
  return requestAI<GenerateSessionInsightsOutput>(
    "/api/ai/session-insights",
    input,
  );
}

export async function generateReportDraft(
  input: GenerateReportDraftInput,
): Promise<GenerateReportDraftOutput> {
  return requestAI<GenerateReportDraftOutput>("/api/ai/report-draft", input);
}

export async function generateSessionNoteTemplate(
  input: GenerateSessionNoteTemplateInput,
): Promise<GenerateSessionNoteTemplateOutput> {
  return requestAI<GenerateSessionNoteTemplateOutput>(
    "/api/ai/session-note-template",
    input,
  );
}
