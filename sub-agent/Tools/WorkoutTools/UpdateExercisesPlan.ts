import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken, DEFAULT_TOKEN } from '../auth';
import { API_BASE } from '../config'; 

const updateExercisesLogParamsSchema = withAuthToken(z.object({
  session_id: z.string().describe('Existing workout session_id to update exercises for.'),
  exercises: z.array(
    z.object({
      exercise_id: z.number().int().describe('Exercise ID to attach to this session.'),
      exercise_type: z.enum(['strength', 'cardio']).describe('Type of exercise: strength or cardio.'),
      sets: z.array(
        z.object({
          set_id: z.number().int().describe('Unique identifier for the set.'),
          planned_reps: z.number().int().optional().describe('Planned number of reps for this set.'),
          planned_duration_min: z.number().int().optional().describe('Planned duration in minutes (for cardio).'),
        })
      ),
    })
  ).nonempty().describe('List of exercises to update to the session.'),
}));

async function updateExercises(params: z.infer<typeof updateExercisesLogParamsSchema>,): Promise<{session_detail_id?: number; sets?:Array<{set_id: number}>; error?: string; message?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/workout-sessions`, {
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
    session_detail_id: data.session_detail_id,
    sets: data.sets,
    message: data.message ?? 'Exercises updated successfully.',
  };
}
export const updateExercisesTool = new FunctionTool({
  name: 'updateExercises',
  description:
    'Updates exercises for an existing workout session (POST /workout-sessions with session_id + exercises).',
  parameters: updateExercisesLogParamsSchema,
  execute: updateExercises,
});

