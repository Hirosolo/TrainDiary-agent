import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config'; 

const updateSessionStatusParamsSchema = withAuthToken(z.object({
  session_id: z.string().describe('Existing workout session_id to update.'),
  userId: z.number().int().describe('The ID of the user updating the workout session for authorization.'),
  status: z.string().describe('New status of the workout session (e.g., "complete", "incomplete").'),
  note: z.string().optional().describe('Optional note to add to the workout session.'),
}));

async function updateSessionStatus(params: z.infer<typeof updateSessionStatusParamsSchema>,): Promise<{error?: string; message: string }> {
    const { authToken, rest } = extractAuthToken(params);   
    const token = getAuthToken(authToken);
    const res = await fetch(`${API_BASE}/api/workouts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rest),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.error ?? 'Failed to update session status.',
        message: 'Failed to update session status.',
      };
    }
    return {
      message: data.message ?? 'Session status updated successfully.',
    };
    }
export const updateSessionStatusTool = new FunctionTool({
  name: 'updateSessionStatus',  
  description:
    'Updates the status and optional note of an existing workout session (PUT /workout-sessions).',
  parameters: updateSessionStatusParamsSchema,
  execute: updateSessionStatus,
});