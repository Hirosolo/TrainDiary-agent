import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const deleteFoodsParamsSchema = withAuthToken(z.object({
  meal_detail_id: z.array(z.number().int()).describe('Existing meal_detail_id of foods to delete.'),
}));
async function deleteFoodsFromMeal(params: z.infer<typeof deleteFoodsParamsSchema>): Promise<{ error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);

  const res = await fetch(`${API_BASE}/api/ai/meal-foods`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rest),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.error ?? 'Failed to delete foods from meal.',
      message: 'Failed to delete foods from meal.',
    };
  }

  return {
    message: data.message ?? 'Foods deleted from meal successfully.',
  };
}
export const deleteFoodsFromMealTool = new FunctionTool({
  name: 'deleteFoodsFromMeal',
  description:
    'Deletes one or more foods from an existing meal (DELETE /meal-foods).',
  parameters: deleteFoodsParamsSchema,
  execute: deleteFoodsFromMeal,
});