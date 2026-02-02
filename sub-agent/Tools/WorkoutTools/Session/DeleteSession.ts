import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken} from '../../auth';
import { API_BASE } from '../../config';


// Updated Schema to support multiple IDs
const deleteSessionParamsSchema = withAuthToken(z.object({
  session_ids: z.array(z.number().int()).describe('An array of session IDs to delete.'),
}));

async function deleteSessions(params: z.infer<typeof deleteSessionParamsSchema>): Promise<{ message: string; results?: any[]; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  
  const results = [];
  const ids = rest.session_ids;

  // Loop through each ID and perform the delete
  for (const id of ids) {
    try {
      const res = await fetch(`${API_BASE}/ai/workout-sessions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      results.push({ id, status: res.ok ? 'success' : 'failed', message: data.message });
    } catch (err) {
      results.push({ id, status: 'error', message: 'Network or System error' });
    }
  }

  const successCount = results.filter(r => r.status === 'success').length;

  return {
    message: `Processed ${ids.length} deletions. ${successCount} successful.`,
    results: results // Returns details of which ones succeeded or failed
  };
}
export const deleteWorkoutSessionTool = new FunctionTool({
  name: 'deleteWorkoutSession',
  description:
    'Deletes a workout session for a user (DELETE /ai/workout-sessions).',
  parameters: deleteSessionParamsSchema,
  execute: deleteSessions,
});

