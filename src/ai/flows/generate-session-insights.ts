
'use server';
/**
 * @fileOverview Um fluxo de IA para gerar insights a partir de notas de sessão.
 *
 * - generateSessionInsights - Função que processa notas de sessão e retorna insights.
 * - GenerateSessionInsightsInput - Tipo de entrada para a função.
 * - GenerateSessionInsightsOutput - Tipo de saída para a função.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSessionInsightsInputSchema = z.object({
  sessionNotes: z.string().describe('As notas textuais completas de uma sessão de terapia.'),
});
export type GenerateSessionInsightsInput = z.infer<typeof GenerateSessionInsightsInputSchema>;

const GenerateSessionInsightsOutputSchema = z.object({
  insights: z.string().describe('Um resumo conciso, temas chave, ou sentimentos identificados a partir das notas da sessão. Deve ser formatado em markdown leve para fácil leitura.'),
});
export type GenerateSessionInsightsOutput = z.infer<typeof GenerateSessionInsightsOutputSchema>;

export async function generateSessionInsights(input: GenerateSessionInsightsInput): Promise<GenerateSessionInsightsOutput> {
  return generateSessionInsightsFlow(input);
}

const systemPrompt = `Você é um assistente de IA especializado em psicologia clínica. Sua tarefa é analisar as notas de uma sessão de terapia e fornecer insights úteis para o psicólogo.
Concentre-se em:
1.  Gerar um resumo conciso da sessão (2-3 frases).
2.  Identificar os principais temas ou problemas discutidos.
3.  Apontar possíveis sentimentos predominantes expressos pelo paciente.
4.  Sugerir 1-2 pontos de foco ou acompanhamento para a próxima sessão, se aplicável.

Formate a saída de forma clara e organizada, usando markdown leve (como listas ou negrito) para melhor legibilidade. Evite jargões excessivos e seja direto ao ponto.
Se as notas forem muito curtas ou insuficientes para uma análise profunda, indique isso de forma educada.
O objetivo é auxiliar o profissional, não substituí-lo.`;

const insightsPrompt = ai.definePrompt({
  name: 'generateSessionInsightsPrompt',
  system: systemPrompt,
  input: {schema: GenerateSessionInsightsInputSchema},
  output: {schema: GenerateSessionInsightsOutputSchema},
  prompt: `Por favor, analise as seguintes notas da sessão de terapia e gere os insights conforme descrito nas instruções do sistema:

Notas da Sessão:
{{{sessionNotes}}}

Insights Gerados:
`,
});

const generateSessionInsightsFlow = ai.defineFlow(
  {
    name: 'generateSessionInsightsFlow',
    inputSchema: GenerateSessionInsightsInputSchema,
    outputSchema: GenerateSessionInsightsOutputSchema,
  },
  async (input) => {
    // Adiciona uma verificação para notas muito curtas, embora o prompt também trate disso.
    if (input.sessionNotes.length < 50) {
      return { insights: "As notas da sessão são muito curtas para uma análise detalhada. Por favor, forneça mais informações." };
    }
    const {output} = await insightsPrompt(input);
    if (!output) {
        // console.error("No output from insightsPrompt for input:", input);
        return { insights: "Não foi possível gerar insights no momento. Verifique as notas ou tente novamente." };
    }
    return { insights: output.insights };
  }
);
