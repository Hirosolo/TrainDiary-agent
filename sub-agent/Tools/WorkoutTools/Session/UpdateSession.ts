import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config'; 

const updateSessionStatusParamsSchema = withAuthToken(z.object({
  session_ids: z.array(z.number().int()).describe('An array of session IDs to update.'),
}));
async function updateSessionStatus(params: z.infer<typeof updateSessionStatusParamsSchema>): Promise<{ error?: string; message: string }> {
    const { authToken, rest } = extractAuthToken(params);   
    const token = getAuthToken(authToken);

    const res = await fetch(`${API_BASE}/ai/workout-sessions`, {
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
            error: data.error || 'Failed to update sessions in bulk.',
            message: 'An error occurred during bulk update.',
        };
  }

  return {
    message: data.message ?? `Successfully updated ${rest.session_ids?.length || 0} sessions.`,
  };
}
export const updateWorkoutSessionStatusTool = new FunctionTool({
  name: 'updateWorkoutSessionStatus',  
  description:
    'Updates the status and optional note of an existing workout session (PUT /ai/workout-sessions).',
  parameters: updateSessionStatusParamsSchema,
  execute: updateSessionStatus,
});