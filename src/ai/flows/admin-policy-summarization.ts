'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing an uploaded policy.
 *
 * - adminPolicySummarization - A function that triggers the policy summarization process.
 * - AdminPolicySummarizationInput - The input type for the summarization function.
 * - AdminPolicySummarizationOutput - The return type for the summarization function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminPolicySummarizationInputSchema = z.object({
  policyContent: z.string().describe('The full text content of the policy to be summarized.'),
});
export type AdminPolicySummarizationInput = z.infer<typeof AdminPolicySummarizationInputSchema>;

const AdminPolicySummarizationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the policy content.'),
});
export type AdminPolicySummarizationOutput = z.infer<typeof AdminPolicySummarizationOutputSchema>;

export async function adminPolicySummarization(
  input: AdminPolicySummarizationInput
): Promise<AdminPolicySummarizationOutput> {
  return adminPolicySummarizationFlow(input);
}

const adminPolicySummarizationPrompt = ai.definePrompt({
  name: 'adminPolicySummarizationPrompt',
  input: { schema: AdminPolicySummarizationInputSchema },
  output: { schema: AdminPolicySummarizationOutputSchema },
  prompt: `You are an AI assistant tasked with summarizing policy documents.

Read the following policy content carefully and provide a concise, objective summary that captures its core points. The summary should be suitable for a brief overview for employees.

Policy Content:
"""{{{policyContent}}}"""

Please provide the summary in the 'summary' field of the JSON output.`,
});

const adminPolicySummarizationFlow = ai.defineFlow(
  {
    name: 'adminPolicySummarizationFlow',
    inputSchema: AdminPolicySummarizationInputSchema,
    outputSchema: AdminPolicySummarizationOutputSchema,
  },
  async (input) => {
    const { output } = await adminPolicySummarizationPrompt(input);
    return output!;
  }
);
