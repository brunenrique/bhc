'use server';
/**
 * @fileOverview Um fluxo de IA para gerar um resumo conciso a partir de notas clínicas.
 *
 * - summarizeClinicalNotes - Função que processa notas clínicas e retorna um resumo.
 * - SummarizeClinicalNotesInput - Tipo de entrada para a função.
 * - SummarizeClinicalNotesOutput - Tipo de saída para a função.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeClinicalNotesInputSchema = z.object({
  clinicalNotes: z.string().describe('O texto completo das notas clínicas a serem resumidas, incluindo queixas, histórico de sessões, e conclusões.'),
});
export type SummarizeClinicalNotesInput = z.infer<typeof SummarizeClinicalNotesInputSchema>;

const SummarizeClinicalNotesOutputSchema = z.object({
  summary: z.string().describe('Um resumo conciso das notas clínicas, destacando pontos chave, progresso, e preocupações. Formatado em markdown leve para fácil leitura.'),
});
export type SummarizeClinicalNotesOutput = z.infer<typeof SummarizeClinicalNotesOutputSchema>;

export async function summarizeClinicalNotes(input: SummarizeClinicalNotesInput): Promise<SummarizeClinicalNotesOutput> {
  return summarizeClinicalNotesFlow(input);
}

const systemPrompt = `Você é um assistente de IA altamente qualificado, especializado em resumir informações clínicas complexas de forma concisa e profissional para psicólogos.
Sua tarefa é analisar as notas clínicas fornecidas e gerar um resumo claro e objetivo.
O resumo deve:
1.  Identificar a queixa principal ou motivo do acompanhamento.
2.  Destacar as principais intervenções ou abordagens terapêuticas utilizadas.
3.  Descrever o progresso geral do paciente.
4.  Apontar quaisquer preocupações significativas ou pontos que necessitam de atenção contínua.
5.  Ser escrito em linguagem profissional, adequada para um prontuário clínico.
6.  Utilizar markdown leve (como listas, negrito, itálico) para melhorar a legibilidade, se apropriado. Evite tabelas complexas.
7.  Ser sucinto, mas abrangente, capturando a essência das notas. Idealmente, 3-5 parágrafos curtos ou uma lista de pontos principais.

Se as notas forem insuficientes para um resumo detalhado, indique isso educadamente.
O objetivo é fornecer uma visão rápida e útil do caso para o profissional.`;

const summaryPrompt = ai.definePrompt({
  name: 'summarizeClinicalNotesPrompt',
  system: systemPrompt,
  input: {schema: SummarizeClinicalNotesInputSchema},
  output: {schema: SummarizeClinicalNotesOutputSchema},
  prompt: `Por favor, analise as seguintes notas clínicas e gere um resumo conciso e informativo, conforme as instruções do sistema:

Notas Clínicas Consolidadas:
{{{clinicalNotes}}}

Resumo Gerado:
`,
});

const summarizeClinicalNotesFlow = ai.defineFlow(
  {
    name: 'summarizeClinicalNotesFlow',
    inputSchema: SummarizeClinicalNotesInputSchema,
    outputSchema: SummarizeClinicalNotesOutputSchema,
  },
  async (input) => {
    if (input.clinicalNotes.trim().length < 100) { // Basic check for very short notes
      return { summary: "As notas clínicas fornecidas são muito curtas para gerar um resumo detalhado. Por favor, forneça mais informações." };
    }
    const {output} = await summaryPrompt(input);
    if (!output) {
        // console.error("No output from summaryPrompt for input:", input);
        return { summary: "Não foi possível gerar o resumo clínico no momento. Verifique as notas ou tente novamente." };
    }
    return { summary: output.summary };
  }
);
