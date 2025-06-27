export interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    borderWidth?: number;
}

export interface ChartData {
    labels: number[];
    datasets: ChartDataset[];
}

export interface Statistics {
    predator_count: number;
    prey_count: number;
    substrate_count: number;
    values_adjusted?: boolean;
}

export interface SimulationParams {
    grid_size: number;
    steps: number;
    neighborhood_type: string;
    grid_type: string;
    record_simulation?: boolean;
    predator_death_probability: number;
    predator_birth_probability: number;
    initial_predators: number;
    predator_starvation_steps: number;
    prey_hunted_probability: number;
    prey_random_death: number;
    initial_prey: number;
    prey_birth_probability: number;
    prey_starvation_steps: number;
    prey_threat_response: number;
    initial_substrate_probability: number;
    substrate_random_death: number;
    substrate_consumption_prob: number;
}

// All possible simulation states
export type SimulationStatus =
    | 'setup'      // Initial setup state
    | 'loading'    // Loading/initializing
    | 'ready'      // Ready to run
    | 'running'    // Simulation is running
    | 'completed'  // Simulation finished
    | 'error'      // Error state
    | 'saving'     // Saving state
    | 'stopped'    // Manually stopped
    | 'retrying-1' // First retry attempt
    | 'retrying-2' // Second retry attempt
    | 'retrying-3'; // Third retry attempt 