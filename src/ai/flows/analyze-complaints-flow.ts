
'use server';
/**
 * @fileOverview An AI flow to analyze patient complaints and extract common themes.
 *
 * - analyzeComplaints - A function that processes a list of complaints and returns frequent themes.
 * - AnalyzeComplaintsInput - The input type for the analyzeComplaints function.
 * - AnalyzeComplaintsOutput - The return type for the analyzeComplaints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplaintItemSchema = z.object({
  text: z.string().describe('A single patient complaint or issue reported.'),
});

const AnalyzeComplaintsInputSchema = z.object({
  complaints: z.array(ComplaintItemSchema).describe('A list of patient complaints.'),
});
export type AnalyzeComplaintsInput = z.infer<typeof AnalyzeComplaintsInputSchema>;

const WordCloudItemSchema = z.object({
  text: z.string().describe('A common theme or topic identified from the complaints.'),
  value: z.number().describe('A numerical weight, frequency, or importance score for the theme (e.g., count of related complaints or a score from 1-100). This value will be used to size the word in a word cloud.'),
});

const AnalyzeComplaintsOutputSchema = z.object({
  themes: z.array(WordCloudItemSchema).describe('A list of the top themes identified, along with their weights, suitable for a word cloud display. Should contain up to 20 themes.'),
});
export type AnalyzeComplaintsOutput = z.infer<typeof AnalyzeComplaintsOutputSchema>;

export async function analyzeComplaints(input: AnalyzeComplaintsInput): Promise<AnalyzeComplaintsOutput> {
  return analyzeComplaintsFlow(input);
}

const systemPrompt = `You are an AI assistant specializing in analyzing textual data from patient complaints in a clinical psychology context.
Your task is to identify common themes, group similar complaints, determine the frequency or importance of each theme, and return a list of the top 20 themes.
For each theme, provide the theme's text and a numerical value representing its frequency or importance (e.g., a count of how many complaints relate to it, or a score from 1 to 100).
The output should be a JSON array of objects, where each object has a 'text' (string) and 'value' (number) field.
Ensure the 'text' field is concise (1-3 words preferably) and suitable for a word cloud display. The 'value' should be a positive integer.
Focus on psychological or symptom-related themes like "Anxiety", "Stress at work", "Sleep problems", "Sadness", "Relationship issues", "Low motivation", "Panic attacks", etc.
Avoid overly generic themes like "Problem" or "Issue" unless they are highly specific in context.
The more frequently a specific concept or symptom appears across multiple complaints, the higher its 'value' should be.
If very few distinct themes are present, you can return fewer than 20 themes.
`;

const complaintsPrompt = ai.definePrompt({
  name: 'analyzeComplaintsPrompt',
  system: systemPrompt,
  input: {schema: AnalyzeComplaintsInputSchema},
  output: {schema: AnalyzeComplaintsOutputSchema},
  prompt: `Please analyze the following list of patient complaints:
{{#each complaints}}
- {{{this.text}}}
{{/each}}

Identify the top themes and their weights as described in the system prompt.
`,
});

const analyzeComplaintsFlow = ai.defineFlow(
  {
    name: 'analyzeComplaintsFlow',
    inputSchema: AnalyzeComplaintsInputSchema,
    outputSchema: AnalyzeComplaintsOutputSchema,
  },
  async (input) => {
    const {output} = await complaintsPrompt(input);
    if (!output) {
        // console.error("No output from complaintsPrompt for input:", input);
        return { themes: [] };
    }
    // Ensure themes are sorted by value in descending order and limited to 20
    const sortedThemes = output.themes
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 20);
    return { themes: sortedThemes };
  }
);
