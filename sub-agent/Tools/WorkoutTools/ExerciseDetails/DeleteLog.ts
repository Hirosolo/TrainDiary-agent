import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken} from '../../auth';
import { API_BASE } from '../../config';

// Add authToken to schemas as an optional string
const deleteLogParamsSchema = withAuthToken(z.object({
  set_id: z.number().int().describe('The ID of the set to delete.'),
}));

async function deleteLog(params: z.infer<typeof deleteLogParamsSchema>,): Promise<{ message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('deleteLog params:', rest);
  const res = await fetch(`${API_BASE}/api/workouts/logs`, {
    method: 'DELETE',   
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rest),
  });

  console.log('deleteLog response status:', res.status);
  const data = await res.json();
  console.log('deleteLog response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to delete log.',
      message: 'Failed to delete log.',
    };
  }

  return {
    message: data.data.message ?? 'Log deleted successfully.',
  };
}

export const deleteLogTool = new FunctionTool({
  name: 'deleteLog',
  description:
    'Deletes a workout log for a user (DELETE /api/workouts/logs).',
  parameters: deleteLogParamsSchema,
  execute: deleteLog,
});

