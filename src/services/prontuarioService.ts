"use client";

export interface SessionNote {
  id: string;
  date: string;
  summary: string;
  [key: string]: unknown;
}

/**
 * Calls a GAS endpoint to generate a patient summary document.
 *
 * @param patientId - Identifier of the patient.
 * @param notes - Notes to be included in the summary.
 * @returns Success flag returned by the GAS script.
 */
export async function gerarProntuario(
  patientId: string,
  notes: SessionNote[],
): Promise<{ success: boolean; message?: string }> {
  const url = process.env.NEXT_PUBLIC_GAS_PRONTUARIO_URL;
  if (!url) {
    throw new Error("GAS URL não configurada");
  }

  const procedimentoAnalise = notes.map((n) => n.summary).join("\n\n");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId,
      procedimentoAnalise,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro ao gerar prontuário");
  }

  return res.json();
}
