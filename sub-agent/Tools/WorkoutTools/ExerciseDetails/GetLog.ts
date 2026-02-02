import { z } from 'zod';
import {FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken} from '../../auth';
import { API_BASE } from '../../config';

const getLogParamsSchema = withAuthToken(z.object({
  session_detail_id: z.array(z.number().int()).describe('The IDs of the session details to retrieve logs for.'),
}));

async function getLog(params: z.infer<typeof getLogParamsSchema>,): Promise<{sets?: any[]; message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  console.log('getLog params:', rest);
  const res = await fetch(`${API_BASE}/ai/workout-sessions/logs/${rest.session_detail_id}`, {
    method: 'GET',   
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('getLog response status:', res.status);
  const data = await res.json();
  console.log('getLog response data:', data);
  if (!res.ok) {
    return {
      error: (data.data && data.data.error) || data.error || 'Failed to get log.',
      message: 'Failed to get log.',
    };
  }

return {
  // Map every object in the data array to return all available fields
    sets: (data.data || []).map((item: any) => ({
      set_id: item.set_id,
      session_detail_id: item.session_detail_id,
      reps: item.reps,
      weight_kg: item.weight_kg,
      duration: item.duration,
      notes: item.notes,
      status: item.status
  })),
  // Access message from the root object (data.message)
  message: data.message ?? 'Log retrieved successfully.',
  };
}

export const getLogTool = new FunctionTool({
  name: 'getLog',
  description:
    'Retrieves workout logs for a user (GET /ai/workout-sessions/logs/{session_detail_id}).',
  parameters: getLogParamsSchema,
  execute: getLog,
});

