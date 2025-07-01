'use server';
/**
 * @fileOverview AI agent that generates data fetching code based on a prompt.
 *
 * - generateDataFetchingCode - A function that generates data fetching code.
 * - GenerateDataFetchingCodeInput - The input type for the generateDataFetchingCode function.
 * - GenerateDataFetchingCodeOutput - The return type for the generateDataFetchingCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDataFetchingCodeInputSchema = z.object({
  prompt: z.string().describe('A description of the data fetching code to generate.'),
});
export type GenerateDataFetchingCodeInput = z.infer<typeof GenerateDataFetchingCodeInputSchema>;

const GenerateDataFetchingCodeOutputSchema = z.object({
  code: z.string().describe('The generated data fetching code.'),
});
export type GenerateDataFetchingCodeOutput = z.infer<typeof GenerateDataFetchingCodeOutputSchema>;

export async function generateDataFetchingCode(input: GenerateDataFetchingCodeInput): Promise<GenerateDataFetchingCodeOutput> {
  return generateDataFetchingCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDataFetchingCodePrompt',
  input: {schema: GenerateDataFetchingCodeInputSchema},
  output: {schema: GenerateDataFetchingCodeOutputSchema},
  prompt: `You are an expert Next.js developer specializing in generating data fetching code.

  You will use the prompt to generate code for fetching data from an API.

  Prompt: {{{prompt}}}

  Please provide only the code, without any additional explanations or comments.
  `,
});

const generateDataFetchingCodeFlow = ai.defineFlow(
  {
    name: 'generateDataFetchingCodeFlow',
    inputSchema: GenerateDataFetchingCodeInputSchema,
    outputSchema: GenerateDataFetchingCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
