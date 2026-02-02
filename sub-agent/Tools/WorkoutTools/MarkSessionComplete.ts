import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken, DEFAULT_TOKEN } from '../auth';
import { API_BASE } from '../config'; 

const markSessionCompleteParamsSchema = withAuthToken(z.object({
  session_id: z.string().describe('Existing workout session_id to mark as complete.'),
}));

async function markSessionComplete(params: z.infer<typeof markSessionCompleteParamsSchema>,): Promise<{error?: string; message: string }> {
    const { authToken, rest } = extractAuthToken(params);   
    const token = getAuthToken(authToken);
    const res = await fetch(`${API_BASE}/workouts-sessions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.error ?? 'Failed to mark session as complete.',
        message: 'Failed to mark session as complete.',
      };
    }
    return {
      message: data.message ?? 'Session marked as complete.',
    };
    }
export const markSessionCompleteTool = new FunctionTool({
  name: 'markSessionComplete',  
  description:
    'Marks an existing workout session as complete (PUT /workout-sessions).',
  parameters: markSessionCompleteParamsSchema,
  execute: markSessionComplete,
});