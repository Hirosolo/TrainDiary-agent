import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../auth';
import { API_BASE } from '../config';

const searchFoodParamsSchema = withAuthToken(z.object({
  name: z.string().describe('Partial or full name of the food to search for.'),
}));

async function searchFoods(params: z.infer<typeof searchFoodParamsSchema>): Promise<{ food_id?: number; calories_per_serving?: number; protein_per_serving?: number;carbs_per_serving?: number; fat_per_serving?: number;serving_type?: string; foods?: Array<{ food_id?: number; calories_per_serving?: number; protein_per_serving?: number;carbs_per_serving?: number; fat_per_serving?: number;serving_type?: string}>; message: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/api/foods?name=${rest.name}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.data)) {
    return { message: 'Failed to search for foods.' };
  }
  if (data.data.length === 1) {
    return {
      food_id: data.data[0].food_id,
      calories_per_serving: data.data[0].calories_per_serving,
      protein_per_serving: data.data[0].protein_per_serving,
      carbs_per_serving: data.data[0].carbs_per_serving,
      fat_per_serving: data.data[0].fat_per_serving,
      message: `Found one food: ${data.data[0].name}. Adding to meal.`
    };
  } else if (data.data.length > 1) {
    return {
      foods: data.data.map((ex: any) => ({ food_id: ex.food_id, calories_per_serving: ex.calories_per_serving, protein_per_serving: ex.protein_per_serving, carbs_per_serving: ex.carbs_per_serving, fat_per_serving: ex.fat_per_serving, serving_type: ex.serving_type })),
      message: `Multiple foods found. Please specify the full name: ${data.data.map((ex: any) => ex.name).join(', ')}`
    };
  } else {
    return { message: 'No foods found matching that name.' };
  }
}

export const searchFoodTool = new FunctionTool({
  name: 'searchFood',
  description: 'Searches for foods by name. If one match, adds directly; if multiple, asks user to clarify.',
  parameters: searchFoodParamsSchema,
  execute: searchFoods,
});
