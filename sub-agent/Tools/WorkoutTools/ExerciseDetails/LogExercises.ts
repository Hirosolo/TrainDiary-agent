import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config'; 

const logExercisesParamsSchema = withAuthToken(z.object({
  session_detail_id: z.string().describe('Existing workout session_detail_id to log exercises sets to.'),
  userId: z.number().int().describe('The ID of the user performing the logging for authorization.'),
  actual_rep: z.number().int().describe('Actual number of reps performed.'),
  weight_kg: z.number().optional().describe('Optional weight in kg used for the exercise.'),
  duration: z.number().int().optional().describe('Optional duration in minutes (for time-based exercises).'),
  status: z.string().optional().describe('Optional status of the exercise (e.g., "complete", "incomplete").'),
  notes: z.string().optional().describe('Optional notes about performance, RPE, etc.'),
}));

async function logExercises(params: z.infer<typeof logExercisesParamsSchema>,): Promise<{set_id?: number;error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/workout/logs`, {
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