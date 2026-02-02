import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken, DEFAULT_TOKEN } from '../../auth';
import { API_BASE } from '../../config'; 

const logExercisesParamsSchema = withAuthToken(z.object({
  set_id: z.string().describe('Existing workout session_detail_id to log exercises sets to.'),
  actual_rep: z.number().int().describe('Actual number of reps performed.'),
  
}));

async function logExercises(params: z.infer<typeof logExercisesParamsSchema>,): Promise<{error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/workout-sessions`, {
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
      error: data.error ?? 'Failed to log exercises.',
      message: 'Failed to log exercises.',
    };
  }
  return {
    message: data.message ?? 'Exercises logged successfully.',
  };
}
export const logExercisesTool = new FunctionTool({
  name: 'logExercises',
  description:
    'Logs completed sets for an existing workout session (POST /workout-sessions with session_detail_id + sets).',
  parameters: logExercisesParamsSchema,
  execute: logExercises,
});