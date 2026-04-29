
import { config } from 'dotenv';
config();

import '@/ai/flows/admin-quiz-question-generation.ts';
import '@/ai/flows/admin-policy-summarization.ts';
import '@/ai/flows/admin-sync-user-sheet.ts';
import '@/ai/flows/admin-send-welcome-email.ts';
