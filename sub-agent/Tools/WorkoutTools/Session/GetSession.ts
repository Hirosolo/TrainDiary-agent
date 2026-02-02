import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { API_BASE } from '../../config';

const user_id = 5;

// Add authToken to schemas as an optional string
const getSessionParamsSchema = withAuthToken(z.object({
  userId: z.number().int().default(user_id).describe('The ID of the user creating the workout session.'),
  month: z.string().optional().describe('The month (YYYY-MM) to retrieve workout sessions for.'),
  date: z.string().optional().describe('Optional specific date (YYYY-MM-DD) to filter workout sessions.'),
}));

async function getSession(params: z.infer<typeof getSessionParamsSchema>,): Promise<{ sessions?: any[]; message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('getSession params:', rest);
  const res = await fetch(`${API_BASE}/api/workouts?${new URLSearchParams(rest as any)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('getSession response status:', res.status);
  const data = await res.json();
  console.log('getSession response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to get session.',
      message: 'Failed to get session.',
    };
  }
  return {
    message: data.message ?? 'Sessions retrieved successfully.',
    sessions: data.data.map((session: any) => ({
        session_id: session.session_id,
        user_id: session.user_id,
        scheduled_date: session.scheduled_date,
        status: session.status,
        notes: session.notes,
        exercises: session.exercises ?? []
  }))
}};

export const getSessionTool = new FunctionTool({
  name: 'getSession',
  description:
    'Retrieves workout sessions for a user (GET /workout-sessions).',
  parameters: getSessionParamsSchema,
  execute: getSession,
});

