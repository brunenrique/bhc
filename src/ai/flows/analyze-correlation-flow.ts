'use server';
/**
 * @fileOverview An AI flow to generate plausible correlation insights between two described variables.
 *
 * - analyzeCorrelation - A function that takes descriptions of two variables and returns a textual insight.
 * - AnalyzeCorrelationInput - The input type for the analyzeCorrelation function.
 * - AnalyzeCorrelationOutput - The return type for the analyzeCorrelation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCorrelationInputSchema = z.object({
  variable1Name: z.string().describe('The display name of the first variable.'),
  variable1Description: z.string().describe('A description of the nature and type of the first variable (e.g., categorical, numerical, what it measures).'),
  variable2Name: z.string().describe('The display name of the second variable.'),
  variable2Description: z.string().describe('A description of the nature and type of the second variable.'),
});
export type AnalyzeCorrelationInput = z.infer<typeof AnalyzeCorrelationInputSchema>;

const AnalyzeCorrelationOutputSchema = z.object({
  correlationInsight: z.string().describe('A plausible textual insight about the potential correlation or relationship between the two variables.'),
});
export type AnalyzeCorrelationOutput = z.infer<typeof AnalyzeCorrelationOutputSchema>;

export async function analyzeCorrelation(input: AnalyzeCorrelationInput): Promise<AnalyzeCorrelationOutput> {
  return analyzeCorrelationFlow(input);
}

const systemPrompt = `You are a data analyst and researcher in a clinical psychology setting.
Your task is to generate a plausible, insightful, and qualitative correlation hypothesis based on the descriptions of two variables provided.
The output should be a single, concise paragraph. Frame the insight as a potential observation that might warrant further investigation, not as a definitive statistical finding.
Consider the nature of each variable (e.g., symptom scale, demographic factor, treatment variable) when crafting the insight.
Use professional and clinical language appropriate for a psychology context.

Example:
If Variable 1 is "Tipo de Demanda Principal (e.g., Conflitos de relacionamento)" and Variable 2 is "Score (Escala de Satisfação Geral)", a plausible insight could be:
"Observa-se uma tendência onde pacientes que apresentam 'Conflitos de relacionamento' como demanda principal demonstram uma melhora mais acentuada nos scores da 'Escala de Satisfação Geral' após o início da terapia. Isso pode sugerir que as intervenções focadas em habilidades interpessoais e resolução de conflitos para este grupo têm um impacto positivo significativo no bem-estar geral percebido."

If Variable 1 is "Nível de Estresse no Trabalho (Escala 1-10)" and Variable 2 is "Qualidade do Sono (Horas médias por noite)", a plausible insight could be:
"Há uma indicação de que níveis mais elevados de 'Estresse no Trabalho', reportados pelos pacientes, podem estar associados a uma menor 'Qualidade do Sono'. Pacientes com alto estresse laboral frequentemente relatam menos horas de sono e maior dificuldade em manter um sono reparador, sugerindo uma área importante para intervenção terapêutica."
`;

const correlationPrompt = ai.definePrompt({
  name: 'analyzeCorrelationPrompt',
  system: systemPrompt,
  input: {schema: AnalyzeCorrelationInputSchema},
  output: {schema: AnalyzeCorrelationOutputSchema},
  prompt: `Baseado nas descrições abaixo, gere uma hipótese de correlação clinicamente plausível entre as duas variáveis:

Variável 1: "{{variable1Name}}"
Natureza: {{variable1Description}}

Variável 2: "{{variable2Name}}"
Natureza: {{variable2Description}}

Formule a conclusão como um parágrafo único.
`,
});

const analyzeCorrelationFlow = ai.defineFlow(
  {
    name: 'analyzeCorrelationFlow',
    inputSchema: AnalyzeCorrelationInputSchema,
    outputSchema: AnalyzeCorrelationOutputSchema,
  },
  async (input) => {
    const {output} = await correlationPrompt(input);
    if (!output) {
        // console.error("No output from analyzeCorrelationPrompt for input:", input);
        return { correlationInsight: "Não foi possível gerar um insight de correlação no momento." };
    }
    return { correlationInsight: output.correlationInsight };
  }
);
