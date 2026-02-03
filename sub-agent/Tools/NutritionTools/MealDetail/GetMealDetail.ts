import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';


const getMealDetailsParamsSchema = withAuthToken(z.object({
  meal_id: z.number().int().describe('The ID of the meal to retrieve details for.'),
}));

async function getMealDetails(params: z.infer<typeof getMealDetailsParamsSchema>): Promise<{ meal_details?: any[]; message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);

  const res = await fetch(`${API_BASE}/api/ai/meal-foods/${rest.meal_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.error || 'Failed to get meal details.',
      message: 'Failed to get meal details.',
    };
  }

  return {
    message: data.message ?? 'Meal details retrieved successfully.',
    meal_details: (data.data || []).map((item: any) => ({
      meal_id: item.meal_id,
      // Combining detail_id and exercise info into one flat object
      meal_detail: {
        meal_detail_id: item.meal_detail_id, 
        food_id: item.food_id,
        number_of_servings: item.number_of_servings,
      }
    }))
  };
}



export const getMealDetailsTool = new FunctionTool({
  name: 'getMealDetails',
  description:
    'Retrieves details for a specific meal (GET /api/ai/meal-foods/{meal_id}).',
  parameters: getMealDetailsParamsSchema,
  execute: getMealDetails,
});

