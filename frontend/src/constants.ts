import { SimulationConstants } from './api/constants';

// Form validation limits
export const VALIDATION_LIMITS = {
    GRID_SIZE: { min: 10, max: 100 },
    STEPS: { min: 1000, max: 99999 },
    INITIAL_PREDATORS: { min: 0, max: 10000 },
    INITIAL_PREY: { min: 0, max: 10000 },
    PREDATOR_DEATH_PROBABILITY: { min: 0, max: 1 },
    PREDATOR_BIRTH_PROBABILITY: { min: 0, max: 1 },
    PREDATOR_STARVATION_STEPS: { min: 1, max: 100 },
    PREY_HUNTED_PROBABILITY: { min: 0, max: 1 },
    PREY_RANDOM_DEATH: { min: 0, max: 1 },
    PREY_STARVATION_STEPS: { min: 1, max: 100 },
    PREY_THREAT_RESPONSE: { min: 0, max: 1 },
    INITIAL_SUBSTRATE_PROBABILITY: { min: 0, max: 1 },
    SUBSTRATE_RANDOM_DEATH: { min: 0, max: 1 },
    SUBSTRATE_CONSUMPTION_PROB: { min: 0, max: 1 }
};

// Steps slider configuration
export const MIN_STEPS = VALIDATION_LIMITS.STEPS.min;
export const MAX_STEPS = VALIDATION_LIMITS.STEPS.max;

// Convert between slider value (0-100) and actual steps
export const stepsToSliderValue = (steps: number): number => {
    const minLog = Math.log(MIN_STEPS);
    const maxLog = Math.log(MAX_STEPS);
    const scale = (maxLog - minLog) / 100;
    return Math.round((Math.log(steps) - minLog) / scale);
};

export const sliderValueToSteps = (value: number): number => {
    const minLog = Math.log(MIN_STEPS);
    const maxLog = Math.log(MAX_STEPS);
    const scale = (maxLog - minLog) / 100;
    return Math.round(Math.exp(minLog + scale * value));
};

// Population scaling functions
export const calculateMaxPopulation = (gridSize: number): number => {
    return gridSize * gridSize;
};

export const calculateScaledPopulation = (basePopulation: number, gridSize: number): number => {
    const scaleFactor = (gridSize * gridSize) / (75 * 75); // 75 is the default grid size
    return Math.round(basePopulation * scaleFactor);
};

// Default settings generator
export const getDefaultSettings = (constants: SimulationConstants) => {
    const maxPop = calculateMaxPopulation(constants.GRID_SIZE);
    return {
        grid_size: constants.GRID_SIZE,
        steps: constants.STEPS,
        initial_prey: Math.min(calculateScaledPopulation(constants.INITIAL_PREY, constants.GRID_SIZE), maxPop * 0.5),
        initial_predators: Math.min(calculateScaledPopulation(constants.INITIAL_PREDATORS, constants.GRID_SIZE), maxPop * 0.1),
        predator_death_probability: constants.PREDATOR_DEATH_PROBABILITY,
        predator_birth_probability: constants.PREDATOR_BIRTH_PROBABILITY,
        predator_starvation_steps: constants.PREDATOR_STARVATION_STEPS,
        prey_hunted_probability: constants.PREY_HUNTED_PROBABILITY,
        prey_random_death: constants.PREY_RANDOM_DEATH,
        prey_birth_probability: constants.PREY_BIRTH_PROBABILITY,
        prey_starvation_steps: constants.PREY_STARVATION_STEPS,
        prey_threat_response: constants.PREY_THREAT_RESPONSE,
        initial_substrate_probability: constants.INITIAL_SUBSTRATE_PROBABILITY,
        substrate_random_death: constants.SUBSTRATE_RANDOM_DEATH,
        substrate_consumption_prob: constants.SUBSTRATE_CONSUMPTION_PROB,
        neighborhood_type: constants.NEIGHBORHOOD_TYPE,
        grid_type: constants.GRID_TYPE,
        record_simulation: false
    };
};

// Entity representation in grid
export const EMPTY = 0;
export const PREY = 1;
export const PREDATOR = 2;
export const SUBSTRATE = 3;

// Visualization colors
export const COLORS = {
    [EMPTY]: 'black',
    [PREY]: '#f7dc6f',
    [PREDATOR]: '#e74c3c',
    [SUBSTRATE]: '#27ae60'
};

// Chart colors with transparency
export const CHART_COLORS = {
    [PREDATOR]: {
        border: 'rgba(239, 68, 68, 1)',
        background: 'rgba(239, 68, 68, 0.2)'
    },
    [PREY]: {
        border: 'rgba(234, 179, 8, 1)',
        background: 'rgba(234, 179, 8, 0.2)'
    },
    [SUBSTRATE]: {
        border: 'rgba(34, 197, 94, 1)',
        background: 'rgba(34, 197, 94, 0.2)'
    }
};

// Simulation UI configuration
export const LARGE_GRID_THRESHOLD = 200;  // Grids larger than this will use viewport rendering

// Replace static DEFAULT_SIMULATION_SETTINGS with dynamic version
export const DEFAULT_SIMULATION_SETTINGS = getDefaultSettings({
    GRID_SIZE: 75,
    STEPS: 9999,
    NEIGHBORHOOD_TYPE: "moore",
    GRID_TYPE: "finite",
    PREDATOR_DEATH_PROBABILITY: 0.1,
    PREDATOR_BIRTH_PROBABILITY: 0.43,
    INITIAL_PREDATORS: 20,
    PREDATOR_STARVATION_STEPS: 66,
    PREY_HUNTED_PROBABILITY: 0.3,
    PREY_RANDOM_DEATH: 0.1,
    INITIAL_PREY: 1000,
    PREY_BIRTH_PROBABILITY: 0.64,
    PREY_STARVATION_STEPS: 3,
    PREY_THREAT_RESPONSE: 0.5,
    INITIAL_SUBSTRATE_PROBABILITY: 0.3,
    SUBSTRATE_RANDOM_DEATH: 0.1,
    SUBSTRATE_CONSUMPTION_PROB: 0.3
}); 