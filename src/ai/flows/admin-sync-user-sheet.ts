
'use server';
/**
 * @fileOverview A Genkit flow for syncing new user data to a Google Sheet.
 *
 * Requirements:
 * - GOOGLE_SHEET_ID: The ID of the Google Sheet.
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: The email of the service account.
 * - GOOGLE_PRIVATE_KEY: The private key of the service account.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';

const SyncUserToSheetInputSchema = z.object({
  name: z.string().describe('Full name of the employee.'),
  email: z.string().email().describe('Email address of the employee.'),
  mobile: z.string().optional().describe('Mobile number.'),
  role: z.string().describe('Assigned role (Admin/Employee).'),
  department: z.string().describe('Department name.'),
  sheetId: z.string().optional().describe('Override Sheet ID.'),
});
export type SyncUserToSheetInput = z.infer<typeof SyncUserToSheetInputSchema>;

const SyncUserToSheetOutputSchema = z.object({
  success: z.boolean().describe('Whether the sync was successful.'),
  message: z.string().describe('Status message or error details.'),
});
export type SyncUserToSheetOutput = z.infer<typeof SyncUserToSheetOutputSchema>;

export async function syncUserToSheet(
  input: SyncUserToSheetInput
): Promise<SyncUserToSheetOutput> {
  return syncUserToSheetFlow(input);
}

const syncUserToSheetFlow = ai.defineFlow(
  {
    name: 'syncUserToSheetFlow',
    inputSchema: SyncUserToSheetInputSchema,
    outputSchema: SyncUserToSheetOutputSchema,
  },
  async (input) => {
    const sheetId = input.sheetId || process.env.GOOGLE_SHEET_ID;
    
    if (!sheetId) {
      return { success: false, message: 'Google Sheet ID is not configured.' };
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return { success: false, message: 'Google API credentials are missing in server environment.' };
    }

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // Append data to the first sheet (A:F)
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            input.name,
            input.email,
            input.mobile || 'N/A',
            input.role,
            input.department,
            new Date().toLocaleString()
          ]],
        },
      });

      return { success: true, message: 'Successfully synced to Google Sheet.' };
    } catch (error: any) {
      console.error('Google Sheet Sync Error:', error);
      return { success: false, message: `Failed to sync: ${error.message}` };
    }
  }
);
