import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';


const getExercisesofSessionParamsSchema = withAuthToken(z.object({
  session_id: z.number().int().describe('The IDs of the workout sessions to retrieve exercises for.'),
}));

async function getExercisesofSession(params: z.infer<typeof getExercisesofSessionParamsSchema>): Promise<{ session_details?: any[]; message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);

  const res = await fetch(`${API_BASE}/ai/workout-sessions/exercises/${rest.session_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.error || 'Failed to get exercises for session.',
      message: 'Failed to get exercises for session.',
    };
  }

  return {
    message: data.message ?? 'Exercises retrieved successfully.',
    session_details: (data.data || []).map((item: any) => ({
      session_id: item.session_id,
      // Combining detail_id and exercise info into one flat object
      session_detail: {
        session_detail_id: item.session_detail_id, 
        exercise_id: item.exercise.exercise_id,
        exercise_type: item.exercise.exercise_type,
      }
    }))
  };
}



export const getWorkoutExercisesofSessionTool = new FunctionTool({
  name: 'getWorkoutExercises',
  description:
    'Retrieves exercises for a specific workout session (GET /workouts/{session_id}/exercises).',
  parameters: getExercisesofSessionParamsSchema,
  execute: getExercisesofSession,
});

