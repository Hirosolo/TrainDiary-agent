import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const addExercisesParamsSchema = withAuthToken(z.object({
  session_id: z.string().describe('Existing workout session_id to add exercises to.'),
  exercises: z.array(
    z.object({
      exercise_id: z.number().int().describe('Exercise ID to attach to this session.'),
      exercise_type: z.enum(['strength', 'cardio']).describe('Type of exercise: strength or cardio.'),
      sets: z.array(
        z.object({
          planned_reps: z.number().int().optional().describe('Planned number of reps for this set.'),
          planned_duration_min: z.number().int().optional().describe('Planned duration in minutes (for cardio).'),
        })
      ),
    })
  ).nonempty().describe('List of exercises to add to the session.'),
}));
async function addExercisesToSession(params: z.infer<typeof addExercisesParamsSchema>,): Promise<{ session_detail_id?: number; sets?:Array<{set_id: number}>; error?: string; message?: string }> {
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
      error: data.error ?? 'Failed to add exercises to session.',
      message: 'Failed to add exercises to session.',
    };
  }

  return {
    session_detail_id: data.data.session_detail_id,
    sets: data.data.sets,
    message: data.message ?? 'Exercises added to session successfully.',
  };
}

export const addExercisesToSessionTool = new FunctionTool({
  name: 'addExercisesToSession',
  description:
    'Adds one or more exercises to an existing workout session (POST /workout-sessions with session_id + exercises).',
  parameters: addExercisesParamsSchema,
  execute: addExercisesToSession,
});