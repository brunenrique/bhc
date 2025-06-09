'use server';

/**
 * @fileOverview An AI agent for generating session insights.
 *
 * - generateSessionInsights - A function that generates insights from session notes.
 * - GenerateSessionInsightsInput - The input type for the generateSessionInsights function.
 * - GenerateSessionInsightsOutput - The return type for the generateSessionInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSessionInsightsInputSchema = z.object({
  sessionNotes: z
    .string()
    .describe('The session notes from a patient session.'),
});
export type GenerateSessionInsightsInput = z.infer<
  typeof GenerateSessionInsightsInputSchema
>;

const GenerateSessionInsightsOutputSchema = z.object({
  insights: z.string().describe('The generated insights from the session notes.'),
});
export type GenerateSessionInsightsOutput = z.infer<
  typeof GenerateSessionInsightsOutputSchema
>;

export async function generateSessionInsights(
  input: GenerateSessionInsightsInput
): Promise<GenerateSessionInsightsOutput> {
  return generateSessionInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSessionInsightsPrompt',
  input: {schema: GenerateSessionInsightsInputSchema},
  output: {schema: GenerateSessionInsightsOutputSchema},
  prompt: `You are an AI assistant for psychologists. Your task is to generate insights from patient session notes.

Session Notes: {{{sessionNotes}}}

Insights:`,
});

const generateSessionInsightsFlow = ai.defineFlow(
  {
    name: 'generateSessionInsightsFlow',
    inputSchema: GenerateSessionInsightsInputSchema,
    outputSchema: GenerateSessionInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
