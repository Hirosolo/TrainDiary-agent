import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const updateMealFoodsParamsSchema = withAuthToken(z.object({
  food_detail: z.array(
    z.object({
        meal_detail_id: z.string().describe('Existing meal_detail_id to update foods serving.'),
        number_of_serving: z.number().describe('Number of servings to update for this food.'),
    })
  ).nonempty().describe('List of meal details to update servings for.'),
}));
async function updateMealFoods(params: z.infer<typeof updateMealFoodsParamsSchema>): Promise<{ error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);

  const res = await fetch(`${API_BASE}/api/ai/meal-foods`, {
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
      error: data.error ?? 'Failed to update meal food serving.',
      message: 'Failed to update meal food serving.',
    };
  }

  return {
    message: data.message ?? 'Meal food serving updated successfully.',
  };
}
export const updateMealFoodsTool = new FunctionTool({
  name: 'updateMealFoods',
  description:
    'Updates the number of servings for one food in an existing meal (PUT /api/ai/meal-foods).',
  parameters: updateMealFoodsParamsSchema,
  execute: updateMealFoods,
});