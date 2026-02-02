import { LlmAgent, ParallelAgent} from '@google/adk';
import { WorkoutAgent } from './sub-agent/WorkoutAgent.js';
import { NutritionAgent } from './sub-agent/NutritionAgent.js';

const CollectorAgent = new LlmAgent({
    model: 'gemini-2.5-flash',
    name: 'CollectorAgent',
    subAgents: [WorkoutAgent, NutritionAgent],
    description: 'Collects information from WorkoutAgent and NutritionAgent to provide comprehensive health advice.',
});

export const AdvisorAgent = new SequentialAgent({})