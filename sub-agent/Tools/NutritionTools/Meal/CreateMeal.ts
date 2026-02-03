import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const createMealParamsSchema = withAuthToken(z.object({
  log_date: z.string().default(new Date().toISOString().split('T')[0]).describe('ISO date string YYYY-MM-DD for the meal.'),
  meal_type: z.string().describe('Type of meal, e.g., "breakfast", "lunch", "dinner".'),
  notes: z.string().optional().describe('Optional notes for the meal.'),
}));

async function createMeal(params: z.infer<typeof createMealParamsSchema>,): Promise<{ meal_id?: number; message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('createMeal params:', rest);
  const res = await fetch(`${API_BASE}/api/ai/meals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rest),
  });

  console.log('createMeal response status:', res.status);
  const data = await res.json();
  console.log('createMeal response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to create meal.',
      message: data.message || 'Failed to create meal.',
      meal_id : data.data?.meal_id,
    };
  }

  return {
    meal_id: data.data.meal_id,
    message: data.data.message ?? 'Meal created successfully.',
  };
}

export const createMealTool = new FunctionTool({
  name: 'createMeal',
  description:
    'Creates a new meal for a user (POST /api/ai/meals).',
  parameters: createMealParamsSchema,
  execute: createMeal,
});

