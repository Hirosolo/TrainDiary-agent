import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const user_id = 5;

// Add authToken to schemas as an optional string
const getExercisesofSessionParamsSchema = withAuthToken(z.object({
  session_id: z.number().int().describe('The ID of the workout session to retrieve exercises for.'),
}));

async function getExercisesofSession(params: z.infer<typeof getExercisesofSessionParamsSchema>,): Promise<{ exercises?: any[]; message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('getExercisesofSession params:', rest);
  const res = await fetch(`${API_BASE}/api/workouts/${rest.session_id}/exercises`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('getExercisesofSession response status:', res.status);
  const data = await res.json();
  console.log('getExercisesofSession response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to get exercises for session.',
      message: 'Failed to get exercises for session.',
    };
  }
  return {
    message: data.message ?? 'Exercises retrieved successfully.',
    exercises: data.data.map((session: any) => ({
        session_id: session.session_id,
        user_id: session.user_id,
        scheduled_date: session.scheduled_date,
        status: session.status,
        notes: session.notes,
        exercises: session.exercises ?? []
  }))
}};

export const getWorkoutExercisesofSessionTool = new FunctionTool({
  name: 'getWorkoutExercises',
  description:
    'Retrieves exercises for a specific workout session (GET /workouts/{session_id}/exercises).',
  parameters: getExercisesofSessionParamsSchema,
  execute: getExercisesofSession,
});

