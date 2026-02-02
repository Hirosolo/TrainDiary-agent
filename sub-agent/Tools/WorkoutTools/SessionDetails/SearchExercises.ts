import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const searchExerciseParamsSchema = withAuthToken(z.object({
  name: z.string().describe('Partial or full name of the exercise to search for.'),
}));

async function searchExercises(params: z.infer<typeof searchExerciseParamsSchema>): Promise<{ exercise_id?: number; exercises?: Array<{ id: number; name: string }>; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/api/exercises?name=${rest.name}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.data)) {
    return { message: 'Failed to search for exercises.' };
  }
  if (data.data.length === 1) {
    return {
      exercise_id: data.data[0].exercise_id,
      message: `Found one exercise: ${data.data[0].name}. Adding to session.`
    };
  } else if (data.data.length > 1) {
    return {
      exercises: data.data.map((ex: any) => ({ id: ex.exercise_id, name: ex.name })),
      message: `Multiple exercises found. Please specify the full name: ${data.data.map((ex: any) => ex.name).join(', ')}`
    };
  } else {
    return { message: 'No exercises found matching that name.' };
  }
}

export const searchExerciseTool = new FunctionTool({
  name: 'searchExercise',
  description: 'Searches for exercises by name. If one match, adds directly; if multiple, asks user to clarify.',
  parameters: searchExerciseParamsSchema,
  execute: searchExercises,
});
