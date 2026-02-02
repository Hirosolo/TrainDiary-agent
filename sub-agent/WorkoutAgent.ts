import { z } from 'zod';
import { LlmAgent, FunctionTool } from '@google/adk';
import { withAuthToken, getAuthToken, extractAuthToken, DEFAULT_TOKEN } from './Tools/auth';
import { createWorkoutSessionTool } from './Tools/WorkoutTools/CreateSession';
import { addExercisesToSessionTool } from './Tools/WorkoutTools/AddExercisesToSession';
import { logExercisesTool } from './Tools/WorkoutTools/ExerciseDetails/LogExercises';
import { API_BASE } from './Tools/config';





const completeSetParamsSchema = withAuthToken(z.object({
  session_detail_id: z.string().describe('session_detail_id to which this log belongs.'),
  log: z.object({
    actual_sets: z.number().int().describe('Actual number of sets performed.'),
    actual_reps: z.number().int().describe('Actual number of reps per set performed.'),
    weight_kg: z.number().optional().describe('Optional weight in kg used for the exercise.'),
    duration_seconds: z.number().int().optional().describe('Optional duration in seconds (for time-based exercises).'),
    notes: z.string().optional().describe('Optional notes about performance, RPE, etc.'),
  }),
}));

const completeSessionParamsSchema = withAuthToken(z.object({
  session_id: z.string().describe('The workout session_id to mark as completed.'),
}));

const deleteParamsSchema = withAuthToken(z.object({
  session_id: z.string().optional().describe('If provided, delete the entire session and related data.'),
  session_detail_id: z.string().optional().describe('If provided, delete a specific exercise from a session.'),
  log_id: z.string().optional().describe('If provided, delete a specific exercise log.'),
}));

const searchExerciseParamsSchema = withAuthToken(z.object({
  name: z.string().describe('Partial or full name of the exercise to search for.'),
}));



async function completeSet(
  params: z.infer<typeof completeSetParamsSchema>,
): Promise<{ message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/workouts`, {
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
      error: data.error ?? 'Failed to log workout.',
      message: 'Failed to log workout.',
    };
  }

  return {
    message: data.message ?? 'Workout logged successfully.',
  };
}

async function completeSession(
  params: z.infer<typeof completeSessionParamsSchema>,
): Promise<{ message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/workouts/${rest.session_id}`, {
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
        error: data.error,
        message: 'Failed to complete session.',
      };
    }
    return {
      message: data.message,
    };
  }


async function deleteWorkoutData(
  params: z.infer<typeof deleteParamsSchema>,
): Promise<{ message: string; error?: string }> {
  const { authToken, rest } = extractAuthToken(params);
  const token = getAuthToken(authToken);
  const res = await fetch(`${API_BASE}/workout-sessions`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rest),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.error ?? 'Failed to delete workout data.',
      message: 'Failed to delete workout data.',
    };
  }

  return {
    message:
      data.message ??
      'Workout data deleted successfully (session / detail / log).',
  };
}

/* =========================
 * FunctionTool instances
 * ========================= */





export const completeWorkoutTool = new FunctionTool({
  name: 'completeWorkout',
  description:
    'Logs actual workout performance for a specific session_detail (POST /workout-sessions with session_detail_id + log).',
  parameters: completeSetParamsSchema,
  execute: completeSet,
});



export const deleteWorkoutDataTool = new FunctionTool({
  name: 'deleteWorkoutData',
  description:
    'Deletes a workout session, session_detail, or log (DELETE /workout-sessions). Only one of session_id, session_detail_id, or log_id should be provided.',
  parameters: deleteParamsSchema,
  execute: deleteWorkoutData,
});


/* =========================
 * WorkoutAgent definition
 * ========================= */

export const WorkoutAgent = new LlmAgent({
  model: process.env.MODEL_NAME || 'gemini-2.0-flash',
  name: 'WorkoutAgent',
  description: 'Manages workout logging. Optimized for quick-start logging with default user and date settings.',
  instruction: `
You are the Workout Specialist. Your goal is to manage the user's daily workout session following strict business rules.

### 1. SESSION MANAGEMENT LOGIC (The "Check-First" Rule)
Before adding any exercises or logs, you MUST check for an existing session for the target date (Default: Today).
- **One Session Per Day:** Call 'createWorkoutSession'. 
- **Handling the Response:** - If the tool indicates a session already exists, use that 'session_id'. 
  - If not, create a new one. 
  - Inform the user: "I've pulled up your session for today" or "I've started a new session for you."

### 2. EXERCISE SEARCH & FUZZY MATCHING
When a user mentions an exercise name:
- **Call 'searchExerciseTool':**
  - **Exact Match Priority:** If the search returns an exact match (e.g., User says "Barbell Bench Press" and both "Barbell Bench Press" and "Incline Barbell Bench Press" exist), choose the exact match "Barbell Bench Press" immediately. Do NOT ask for clarification if one result matches the user's string perfectly.
  - **Clarification:** Only if there is no exact match and multiple partial matches exist, ask the user to clarify.

### 3. LOGGING DONE EXERCISES (The "Execution" Flow)
If the user reports an exercise they HAVE COMPLETED:
- **Type Differentiation:**
  - **Cardio:** Duration is REQUIRED. If missing, ask for it. Set reps/sets to 0.
  - **Strength:** Reps and Sets are REQUIRED. If missing, ask for them. Set duration to 0.
- **Workflow:** 1. Search for 'exercise_id'.
  2. Call 'addExercisesToSession' using the 'session_id'.
  3. Call 'completeWorkout' (setComplete) immediately for all sets/reps mentioned.
- **Completion Check:** After logging, ask: "Is that everything for this session?" If they say yes, call 'completeWorkoutSession'. Otherwise, tell them: "You can add more exercises or logs whenever you're ready."

### 4. PLANNING EXERCISES (The "Plan" Flow)
If the user wants to PLAN a workout for later:
- Follow the **Session Check** and **Search** logic above.
- Add the exercises to the session but **DO NOT** call the completion/log tools yet.
- These stay as "Planned" until the user reports completion later.
- If the user needs advice on what to train, say: "I'll ask our Advisor to help with a plan," and trigger a hand-off to the AdvisorAgent.

### 5. CRITICAL CONSTRAINTS
- **Auto-Fix:** Correct any minor spelling or grammar errors in user input to match database naming conventions (e.g., "benchpres" -> "Bench Press").
- **Language:** Maintain a professional, supportive personal trainer persona.
`,
  tools: [
    createWorkoutSessionTool,
    addExercisesToSessionTool,
    completeWorkoutTool,
    completeSessionTool,
    deleteWorkoutDataTool,
    searchExerciseTool,
  ],
});