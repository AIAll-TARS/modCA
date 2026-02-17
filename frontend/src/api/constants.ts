import { getApiUrl } from '../utils/env';

export interface SimulationConstants {
    GRID_SIZE: number;
    STEPS: number;
    NEIGHBORHOOD_TYPE: string;
    GRID_TYPE: string;
    PREDATOR_DEATH_PROBABILITY: number;
    PREDATOR_BIRTH_PROBABILITY: number;
    INITIAL_PREDATORS: number;
    PREDATOR_STARVATION_STEPS: number;
    PREY_HUNTED_PROBABILITY: number;
    PREY_RANDOM_DEATH: number;
    INITIAL_PREY: number;
    PREY_BIRTH_PROBABILITY: number;
    PREY_STARVATION_STEPS: number;
    PREY_THREAT_RESPONSE: number;
    INITIAL_SUBSTRATE_PROBABILITY: number;
    SUBSTRATE_RANDOM_DEATH: number;
    SUBSTRATE_CONSUMPTION_PROB: number;
}

export async function fetchConstants(): Promise<SimulationConstants> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
        const response = await fetch(`${getApiUrl()}/constants`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch simulation constants: ${response.status} ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout: Failed to fetch constants within 10 seconds');
        }
        throw error;
    }
} 