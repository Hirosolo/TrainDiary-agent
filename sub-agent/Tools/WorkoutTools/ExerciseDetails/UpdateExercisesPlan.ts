import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken, DEFAULT_TOKEN } from '../../auth';
import { API_BASE } from '../../config'; 

const updateExercisesLogParamsSchema = withAuthToken(z.object({
  set_id: z.string().describe('Existing workout set_id to update.'),
  userId: z.number().int().describe('The ID of the user updating the exercises.'),
  actual_reps: z.number().int().optional().describe('Actual number of reps completed for this set.'),
  weight_kg: z.number().optional().describe('Weight in kg used for this set.'),
  duration: z.number().int().optional().describe('Duration in minutes for time-based exercises.'),
  status: z.string().optional().describe('Status of the exercise set, e.g., "completed", "skipped".'),
  notes: z.string().optional().describe('Optional notes about the exercise performance.'),
}));

async function updateExercises(params: z.infer<typeof updateExercisesLogParamsSchema>,): Promise<{session_detail_id?: number; sets?:Array<{set_id: number}>; error?: string; message?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/workouts/logs`, {
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
      error: data.error ?? 'Failed to update exercises.',
      message: 'Failed to update exercises.',
    };
  }
  return {
    message: data.message ?? 'Exercises updated successfully.',
  };
}
export const updateExercisesTool = new FunctionTool({
  name: 'updateExercises',
  description:
    'Updates exercises set for an existing workout session (PUT /workouts/logs with set_id).',
  parameters: updateExercisesLogParamsSchema,
  execute: updateExercises,
});

