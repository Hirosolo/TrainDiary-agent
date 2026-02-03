import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const searchMealParamsSchema = withAuthToken(z.object({
  log_date: z.string().default(new Date().toISOString().split('T')[0]).describe('ISO date string YYYY-MM-DD for the meal.'),
  meal_type: z.string().optional().describe('Optional type of meal, e.g., "breakfast", "lunch", "dinner".'),
}));

async function searchMeal(params: z.infer<typeof searchMealParamsSchema>,): Promise<{ meals?: any[]; message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('searchMeal params:', rest);
  const res = await fetch(`${API_BASE}/api/ai/meals?${new URLSearchParams(rest as any)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('searchMeal response status:', res.status);
  const data = await res.json();
  console.log('searchMeal response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to search meal.',
      message: data.message || 'Failed to search meal.',
    };
  }

  return {
    meals: data.data.map((meal: any) => ({
        meal_id: meal.meal_id,
        log_date: meal.log_date,
        meal_type: meal.meal_type,
        notes: meal.notes,
    })),
    message: data.data.message ?? 'Meal searched successfully.',
  };
}

export const searchMealTool = new FunctionTool({
  name: 'searchMeal',
  description:
    'Searches for meals for a user (GET /api/ai/meals).',
  parameters: searchMealParamsSchema,
  execute: searchMeal,
});

