import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken} from '../../auth';
import { API_BASE } from '../../config';

 const user_id = 5;
// Add authToken to schemas as an optional string
const deleteSessionParamsSchema = withAuthToken(z.object({
  session_id: z.number().int().describe('The ID of the session to delete.'),
  user_id: z.number().int().default(user_id).describe('The ID of the user deleting the workout session to authorize.'),
}));

async function deleteSession(params: z.infer<typeof deleteSessionParamsSchema>,): Promise<{ message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('deleteSession params:', rest);
  const res = await fetch(`${API_BASE}/api/workouts`, {
    method: 'DELETE',   
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rest),
  });

  console.log('deleteSession response status:', res.status);
  const data = await res.json();
  console.log('deleteSession response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to delete session.',
      message: 'Failed to delete session.',
    };
  }

  return {
    message: data.data.message ?? 'Session deleted successfully.',
  };
}

export const deleteSessionTool = new FunctionTool({
  name: 'deleteSession',
  description:
    'Deletes a workout session for a user (DELETE /api/workouts).',
  parameters: deleteSessionParamsSchema,
  execute: deleteSession,
});

