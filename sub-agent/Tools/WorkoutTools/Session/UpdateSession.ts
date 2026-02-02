import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken } from '../../auth';
import { getWorkoutExercisesofSessionTool } from '../SessionDetails/GetExercisesofSession';
import { API_BASE } from '../../config'; 

const updateSessionStatusParamsSchema = withAuthToken(z.object({
  session_ids: z.array(z.number().int()).describe('An array of session IDs to update.'),
}));

async function updateSessionStatus(params: z.infer<typeof updateSessionStatusParamsSchema>): Promise<{ error?: string; message: string; details?: any[] }> {
    const { authToken, rest } = extractAuthToken(params);   
    const token = getAuthToken(authToken);
    const ids = rest.session_ids;

    // Use Promise.all to handle multiple requests in parallel
    const results = await Promise.all(ids.map(async (id) => {
        try {
            const res = await fetch(`${API_BASE}/ai/workout-sessions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                // If the API logic handles everything, we send an empty body or minimal payload
                body: JSON.stringify({ trigger_update: true }) 
            });

            const data = await res.json();
            
            return {
                id,
                status: res.ok ? 'success' : 'failed',
                message: data.message || (res.ok ? 'Updated' : 'Failed')
            };
        } catch (err) {
            return { id, status: 'error', message: 'Network error' };
        }
    }));

    const failure = results.find(r => r.status !== 'success');
    
    return {
        message: `Processed ${ids.length} sessions.`,
        details: results,
        error: failure ? "One or more updates failed." : undefined
    };
}

export const updateWorkoutSessionStatusTool = new FunctionTool({
  name: 'updateWorkoutSessionStatus',  
  description:
    'Updates the status and optional note of an existing workout session (PUT /ai/workout-sessions).',
  parameters: updateSessionStatusParamsSchema,
  execute: updateSessionStatus,
});