import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken} from '../../auth';
import { API_BASE } from '../../config';


// Updated Schema to support multiple IDs
const deleteSessionParamsSchema = withAuthToken(z.object({
  session_ids: z.array(z.number().int()).describe('An array of session IDs to delete.'),
}));

async function deleteSessions(params: z.infer<typeof deleteSessionParamsSchema>): Promise<{ message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  
  const res = await fetch(`${API_BASE}/ai/workout-sessions`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rest),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.data.error || 'Failed to delete sessions.',
      message: 'An error occurred during bulk deletion.',
    };
  }

  // Return a single message since the API handled the batch
  return {
    message: data.message ?? `Successfully processed deletion request for ${rest.session_ids?.length || 0} sessions.`,
  };
}
export const deleteWorkoutSessionTool = new FunctionTool({
  name: 'deleteWorkoutSession',
  description:
    'Deletes a workout session for a user (DELETE /ai/workout-sessions).',
  parameters: deleteSessionParamsSchema,
  execute: deleteSessions,
});

