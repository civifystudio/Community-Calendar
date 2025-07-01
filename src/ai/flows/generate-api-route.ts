'use server';

/**
 * @fileOverview An AI agent for generating Next.js API route code.
 *
 * - generateApiRoute - A function that generates Next.js API route code.
 * - GenerateApiRouteInput - The input type for the generateApiRoute function.
 * - GenerateApiRouteOutput - The return type for the generateApiRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateApiRouteInputSchema = z.object({
  description: z
    .string()
    .describe('A description of the desired API route functionality.'),
});
export type GenerateApiRouteInput = z.infer<typeof GenerateApiRouteInputSchema>;

const GenerateApiRouteOutputSchema = z.object({
  code: z
    .string()
    .describe('The generated Next.js API route code, ready to be saved to a file.'),
});
export type GenerateApiRouteOutput = z.infer<typeof GenerateApiRouteOutputSchema>;

export async function generateApiRoute(input: GenerateApiRouteInput): Promise<GenerateApiRouteOutput> {
  return generateApiRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApiRoutePrompt',
  input: {schema: GenerateApiRouteInputSchema},
  output: {schema: GenerateApiRouteOutputSchema},
  prompt: `You are a Next.js expert, and your job is to generate API route code based on a user's description.

  The code should be complete, including all necessary imports.

  Here is the description of the desired API route:
  {{{description}}}

  Here is the generated code:
  `,
});

const generateApiRouteFlow = ai.defineFlow(
  {
    name: 'generateApiRouteFlow',
    inputSchema: GenerateApiRouteInputSchema,
    outputSchema: GenerateApiRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
