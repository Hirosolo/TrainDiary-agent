import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const updateExercisesStatusParamsSchema = withAuthToken(z.object({
  session_id: z.string().describe('Existing workout session_id to update exercises status.'),
  exercise_ids: z.array(z.number().int().describe('Exercise ID to update status for in this session.'),
  ).nonempty().describe('List of exercises to update status for in the session.'),
}));
async function updateExercisesStatus(params: z.infer<typeof updateExercisesStatusParamsSchema>): Promise<{ session_detail_ids?: number[]; error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);

  const res = await fetch(`${API_BASE}/api/ai/session-details`, {
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
      error: data.error ?? 'Failed to update exercises status.',
      message: 'Failed to update exercises status.',
    };
  }

  return {
    message: data.message ?? 'Exercises status updated successfully.',
  };
}
export const updateExercisesStatusTool = new FunctionTool({
  name: 'updateExercisesStatus',
  description:
    'Updates the status of one or more exercises in an existing workout session (PUT /session-details).',
  parameters: updateExercisesStatusParamsSchema,
  execute: updateExercisesStatus,
});