import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const deleteMealParamsSchema = withAuthToken(z.object({
  meal_id: z.string().describe('ID of the meal to delete.'),
}));

async function deleteMeal(params: z.infer<typeof deleteMealParamsSchema>,): Promise<{ message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('deleteMeal params:', rest);
  const res = await fetch(`${API_BASE}/api/ai/meals`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rest),
  });

  console.log('deleteMeal response status:', res.status);
  const data = await res.json();
  console.log('deleteMeal response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to delete meal.',
      message: data.message || 'Failed to delete meal.',
    };
  }

  return {
    message: data.data.message ?? 'Meal deleted successfully.',
  };
}

export const deleteMealTool = new FunctionTool({
  name: 'deleteMeal',
  description:
    'Deletes a meal for a user (DELETE /api/ai/meals).',
  parameters: deleteMealParamsSchema,
  execute: deleteMeal,
});

