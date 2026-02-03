import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const addFoodParamsSchema = withAuthToken(z.object({
  meal_id: z.string().describe('Existing meal_id to add foods to.'),
  food_ids: z.array(
    z.object({
        food_id: z.number().int().describe('Food ID to attach to this meal.'),
        number_of_serving: z.number().describe('Number of servings for this food.'),
    })
  ).nonempty().describe('List of foods to add to the meal.'),
}));
async function addFoodsToMeal(params: z.infer<typeof addFoodParamsSchema>): Promise<{ meal_detail_ids?: number[]; error?: string; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);

  const res = await fetch(`${API_BASE}/api/ai/meal-foods`, {
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
      error: data.error ?? 'Failed to add foods to meal.',
      message: 'Failed to add foods to meal.',
    };
  }

  return {
    meal_detail_ids: data.data?.meal_detail_ids ?? [],
    message: data.message ?? 'Foods added to meal successfully.',
  };
}
export const addFoodsToMealTool = new FunctionTool({
  name: 'addFoodsToMeal',
  description:
    'Adds one or more foods to an existing meal (POST /api/ai/meal-foods).',
  parameters: addFoodParamsSchema,
  execute: addFoodsToMeal,
});