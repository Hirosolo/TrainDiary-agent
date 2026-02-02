import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const deleteExercisesParamsSchema = withAuthToken(z.object({
  session_detail_id: z.array(z.number().int()).describe('Existing workout session_detail_id of exercises to delete.'),
}));
async function deleteExercisesFromSession(params: z.infer<typeof deleteExercisesParamsSchema>): Promise<{ session_detail_ids?: number[]; error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);

  const res = await fetch(`${API_BASE}/api/ai/session-details`, {
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
      error: data.error ?? 'Failed to add exercises to session.',
      message: 'Failed to add exercises to session.',
    };
  }

  return {
    message: data.message ?? 'Exercises deleted from session successfully.',
  };
}
export const deleteExercisesFromSessionTool = new FunctionTool({
  name: 'deleteExercisesFromSession',
  description:
    'Deletes one or more exercises from an existing workout session (DELETE /session-exercises).',
  parameters: deleteExercisesParamsSchema,
  execute: deleteExercisesFromSession,
});