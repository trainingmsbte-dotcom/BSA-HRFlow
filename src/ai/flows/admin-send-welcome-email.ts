
'use server';
/**
 * @fileOverview A Genkit flow for drafting and "sending" a welcome email to a new employee.
 *
 * - sendWelcomeEmail - A function that drafts a professional welcome email with credentials.
 * - SendWelcomeEmailInput - Input containing user details and login info.
 * - SendWelcomeEmailOutput - Output indicating success and the drafted body.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendWelcomeEmailInputSchema = z.object({
  email: z.string().email().describe('The email address of the new employee.'),
  name: z.string().describe('The full name of the employee.'),
  employeeId: z.string().describe('The assigned unique Employee ID.'),
  passkey: z.string().describe('The temporary passkey for their first login.'),
  loginLink: z.string().describe('The URL to the portal login page.'),
});
export type SendWelcomeEmailInput = z.infer<typeof SendWelcomeEmailInputSchema>;

const SendWelcomeEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was successfully drafted/sent.'),
  message: z.string().describe('Status message or error details.'),
  emailBody: z.string().optional().describe('The drafted text of the welcome email.'),
});
export type SendWelcomeEmailOutput = z.infer<typeof SendWelcomeEmailOutputSchema>;

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput
): Promise<SendWelcomeEmailOutput> {
  return sendWelcomeEmailFlow(input);
}

const welcomeEmailPrompt = ai.definePrompt({
  name: 'welcomeEmailPrompt',
  input: { schema: SendWelcomeEmailInputSchema },
  prompt: `You are a professional HR assistant at BSA. 

Draft a warm, professional, and clear welcome email for a new employee. 

The email must include:
1. A welcoming introduction to BSA.
2. Their unique Employee ID: {{{employeeId}}}
3. Their temporary login passkey: {{{passkey}}}
4. A direct link to access the portal: {{{loginLink}}}

Instructions for the user:
- They should login using their email and the provided passkey.
- They will be prompted to change their passkey upon first login for security.
- They should begin reviewing their assigned induction policies immediately.

Keep the tone encouraging and professional. Return ONLY the text of the email body.`,
});

const sendWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'sendWelcomeEmailFlow',
    inputSchema: SendWelcomeEmailInputSchema,
    outputSchema: SendWelcomeEmailOutputSchema,
  },
  async (input) => {
    try {
      const { text } = await welcomeEmailPrompt(input);

      // In a production environment, you would integrate with an SMTP service or API (e.g., SendGrid).
      // For this prototype, we simulate the send by logging the drafted content and returning it.
      console.log(`[SIMULATED EMAIL SEND TO: ${input.email}]`);
      console.log('Subject: Welcome to BSA HRFlow - Your Login Credentials');
      console.log('--- EMAIL CONTENT START ---');
      console.log(text);
      console.log('--- EMAIL CONTENT END ---');

      return {
        success: true,
        message: 'Welcome email drafted and "sent" successfully (Simulated).',
        emailBody: text,
      };
    } catch (error: any) {
      console.error('Welcome Email Flow Error:', error);
      return {
        success: false,
        message: `Failed to draft welcome email: ${error.message}`,
      };
    }
  }
);
