import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const addExercisesParamsSchema = withAuthToken(z.object({
  session_id: z.string().describe('Existing workout session_id to add exercises to.'),
  exercise_ids: z.array(z.number().int().describe('Exercise ID to attach to this session.'),
  ).nonempty().describe('List of exercises to add to the session.'),
}));
async function addExercisesToSession(params: z.infer<typeof addExercisesParamsSchema>): Promise<{ session_detail_ids?: number[]; error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);

  const res = await fetch(`${API_BASE}/api/ai/session-details`, {
    method: 'POST',
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
    session_detail_ids: data.data?.session_detail_ids ?? [],
    message: data.message ?? 'Exercises added to session successfully.',
  };
}
export const addExercisesToSessionTool = new FunctionTool({
  name: 'addExercisesToSession',
  description:
    'Adds one or more exercises to an existing workout session (POST /session-exercises).',
  parameters: addExercisesParamsSchema,
  execute: addExercisesToSession,
});