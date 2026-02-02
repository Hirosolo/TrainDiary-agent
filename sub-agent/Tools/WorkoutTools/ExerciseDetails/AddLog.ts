import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config'; 

const addLogParamsSchema = withAuthToken(z.object({
  session_detail_id: z.string().describe('Existing workout session_detail_id to log exercises sets to.'),
  exercise_id: z.number().int().describe('Exercise ID to log sets for.'),
  exercise_type: z.string().describe('Type of exercise: strength or cardio.'),
  planned_detail: z.array(
    z.object({
      planned_rep: z.number().int().describe('Planned number of reps for the exercise.'),
      weight_kg: z.number().optional().describe('Optional weight in kg used for the exercise.'),
      duration: z.number().int().optional().describe('Optional duration in minutes (for time-based exercises).'),
      status: z.string().default('In Progress').describe('Status of the exercise is "In Progress"'),
      notes: z.string().optional().describe('Optional notes about performance, RPE, etc.'),
    })
  ).nonempty().describe('List of exercises to log to the session.'),
}));

async function addLogExercises(params: z.infer<typeof addLogParamsSchema>,): Promise<{set_ids?: number[] ;error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/ai/workout-sessions/logs`, {
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
      error: data.error ?? 'Failed  to create log.',
      message: 'Failed to create log.',
    };
  }
  return {
    set_ids: data.set_ids ?? [],
    message: data.message ?? 'Exercises logged successfully.',
  };
}
export const addLogExercisesTool = new FunctionTool({
  name: 'addLogExercises',
  description:
    'Logs planned sets for an existing workout session (POST /workout-sessions with session_detail_id + sets).',
  parameters: addLogParamsSchema,
  execute: addLogExercises,
});