import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';


// Add authToken to schemas as an optional string
const createSessionParamsSchema = withAuthToken(z.object({
  scheduled_date: z.string().default(new Date().toISOString().split('T')[0]).describe('ISO date string YYYY-MM-DD for the workout session.'),
  type: z.string().optional().describe('Optional type of workout session, e.g., "strength", "cardio".'),
  notes: z.string().optional().describe('Optional notes for the workout session.'),
}));

async function createWorkoutSession(params: z.infer<typeof createSessionParamsSchema>,): Promise<{ session_id?: string; message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('createWorkoutSession params:', rest);
  const res = await fetch(`${API_BASE}/api/ai/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rest),
  });

  console.log('createWorkoutSession response status:', res.status);
  const data = await res.json();
  console.log('createWorkoutSession response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to create session.',
      message: data.message || 'Failed to create session.',
      session_id : data.data?.session_id,
    };
  }

  return {
    session_id: data.data.session_id,
    message: data.data.message ?? 'Session created successfully.',
  };
}

export const createWorkoutSessionTool = new FunctionTool({
  name: 'createWorkoutSession',
  description:
    'Creates a new workout session for a user (POST /api/ai/sessions).',
  parameters: createSessionParamsSchema,
  execute: createWorkoutSession,
});

