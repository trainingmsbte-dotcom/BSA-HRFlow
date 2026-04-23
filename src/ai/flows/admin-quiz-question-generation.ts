'use server';
/**
 * @fileOverview A Genkit flow for generating multiple-choice quiz questions based on policy content.
 *
 * - generateQuizQuestions - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizQuestionSchema = z.object({
  question: z.string().describe('The multiple-choice question text.'),
  options: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe('An array of possible answer options for the question.'),
  correctAnswerIndex: z
    .number()
    .int()
    .min(0)
    .describe(
      'The zero-based index of the correct answer within the options array.'
    ),
});

const GenerateQuizQuestionsInputSchema = z.object({
  policyContent: z.string().describe('The full text content of the policy.'),
  numberOfQuestions: z
    .number()
    .int()
    .min(3)
    .max(5)
    .default(3)
    .describe('The desired number of quiz questions (between 3 and 5).'),
});
export type GenerateQuizQuestionsInput = z.infer<
  typeof GenerateQuizQuestionsInputSchema
>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z
    .array(QuizQuestionSchema)
    .min(3)
    .max(5)
    .describe('An array of generated multiple-choice quiz questions.'),
});
export type GenerateQuizQuestionsOutput = z.infer<
  typeof GenerateQuizQuestionsOutputSchema
>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return adminQuizQuestionGenerationFlow(input);
}

const quizQuestionGenerationPrompt = ai.definePrompt({
  name: 'quizQuestionGenerationPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an AI assistant tasked with generating multiple-choice quiz questions based on policy content.

Generate exactly {{{numberOfQuestions}}} multiple-choice questions based on the following policy content. Each question should have 2 to 5 options, and you must indicate the correct answer's zero-based index.

Policy Content:
"""
{{{policyContent}}}
"""

Ensure the output is valid JSON, strictly adhering to the following schema:

{
  "questions": [
    {
      "question": "string",
      "options": [
        "string",
        "string"
      ],
      "correctAnswerIndex": "number"
    }
  ]
}

Provide the generated quiz questions in the specified JSON format only, with no additional text or explanations.`,
});

const adminQuizQuestionGenerationFlow = ai.defineFlow(
  {
    name: 'adminQuizQuestionGenerationFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await quizQuestionGenerationPrompt(input);
    return output!;
  }
);
