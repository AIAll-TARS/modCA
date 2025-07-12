import { SimulationConstants } from './api/constants';

// These will be updated when constants are fetched from backend
export let GRID_SIZE = 75;
export let STEPS = 9999;
export let NEIGHBORHOOD_TYPE = "moore";
export let GRID_TYPE = "finite";
export let PREDATOR_DEATH_PROBABILITY = 0.1;
export let PREDATOR_BIRTH_PROBABILITY = 0.43;
export let INITIAL_PREDATORS = 20;
export let PREDATOR_STARVATION_STEPS = 66;
export let PREY_HUNTED_PROBABILITY = 0.3;
export let PREY_RANDOM_DEATH = 0.1;
export let INITIAL_PREY = 1000;
export let PREY_BIRTH_PROBABILITY = 0.64;
export let PREY_STARVATION_STEPS = 3;
export let PREY_THREAT_RESPONSE = 0.5;
export let INITIAL_SUBSTRATE_PROBABILITY = 0.3;
export let SUBSTRATE_RANDOM_DEATH = 0.1;
export let SUBSTRATE_CONSUMPTION_PROB = 0.3;

// Function to update constants from backend
export function updateConstants(constants: SimulationConstants) {
    GRID_SIZE = constants.GRID_SIZE;
    STEPS = constants.STEPS;
    NEIGHBORHOOD_TYPE = constants.NEIGHBORHOOD_TYPE;
    GRID_TYPE = constants.GRID_TYPE;
    PREDATOR_DEATH_PROBABILITY = constants.PREDATOR_DEATH_PROBABILITY;
    PREDATOR_BIRTH_PROBABILITY = constants.PREDATOR_BIRTH_PROBABILITY;
    INITIAL_PREDATORS = constants.INITIAL_PREDATORS;
    PREDATOR_STARVATION_STEPS = constants.PREDATOR_STARVATION_STEPS;
    PREY_HUNTED_PROBABILITY = constants.PREY_HUNTED_PROBABILITY;
    PREY_RANDOM_DEATH = constants.PREY_RANDOM_DEATH;
    INITIAL_PREY = constants.INITIAL_PREY;
    PREY_BIRTH_PROBABILITY = constants.PREY_BIRTH_PROBABILITY;
    PREY_STARVATION_STEPS = constants.PREY_STARVATION_STEPS;
    PREY_THREAT_RESPONSE = constants.PREY_THREAT_RESPONSE;
    INITIAL_SUBSTRATE_PROBABILITY = constants.INITIAL_SUBSTRATE_PROBABILITY;
    SUBSTRATE_RANDOM_DEATH = constants.SUBSTRATE_RANDOM_DEATH;
    SUBSTRATE_CONSUMPTION_PROB = constants.SUBSTRATE_CONSUMPTION_PROB;
}

// Steps configuration
export const MIN_STEPS = 10;  // 10^1
export const MAX_STEPS = 1000000;  // 10^6
export const DEFAULT_STEPS = STEPS;

// Helper functions for logarithmic steps scaling
export const stepsToSliderValue = (steps: number): number => {
    return Math.log10(steps);
};

export const sliderValueToSteps = (value: number): number => {
    return Math.floor(Math.pow(10, value));
};

// Population scaling functions
export const calculateScaledPopulation = (defaultPopulation: number, currentGridSize: number): number => {
    const scaleFactor = (currentGridSize * currentGridSize) / (GRID_SIZE * GRID_SIZE);
    return Math.max(1, Math.floor(defaultPopulation * scaleFactor));
};

export const calculateMaxPopulation = (gridSize: number): number => {
    return gridSize * gridSize;
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

// Form validation limits
export const VALIDATION_LIMITS = {
    GRID_SIZE: { min: 10, max: 100 },
    STEPS: { min: MIN_STEPS, max: MAX_STEPS },
    INITIAL_PREDATORS: { min: 0, max: 10000 },
    INITIAL_PREY: { min: 0, max: 10000 },
    PREDATOR_DEATH_PROBABILITY: { min: 0, max: 1 },
    PREDATOR_BIRTH_PROBABILITY: { min: 0, max: 1 },
    PREDATOR_STARVATION_STEPS: { min: 1, max: 100 },
    PREY_HUNTED_PROBABILITY: { min: 0, max: 1 },
    PREY_RANDOM_DEATH: { min: 0, max: 1 },
    PREY_BIRTH_PROBABILITY: { min: 0, max: 1 },
    PREY_STARVATION_STEPS: { min: 1, max: 100 },
    PREY_THREAT_RESPONSE: { min: 0, max: 1 },
    INITIAL_SUBSTRATE_PROBABILITY: { min: 0, max: 1 },
    SUBSTRATE_RANDOM_DEATH: { min: 0, max: 1 },
    SUBSTRATE_CONSUMPTION_PROB: { min: 0, max: 1 }
};

// Default simulation settings with dynamic population scaling
export const getDefaultSettings = (gridSize: number = GRID_SIZE) => {
    const maxPop = calculateMaxPopulation(gridSize);
    return {
        grid_size: gridSize,
        steps: STEPS,
        initial_prey: Math.min(calculateScaledPopulation(INITIAL_PREY, gridSize), maxPop * 0.5),
        initial_predators: Math.min(calculateScaledPopulation(INITIAL_PREDATORS, gridSize), maxPop * 0.1),
        predator_death_probability: PREDATOR_DEATH_PROBABILITY,
        predator_birth_probability: PREDATOR_BIRTH_PROBABILITY,
        predator_starvation_steps: PREDATOR_STARVATION_STEPS,
        prey_hunted_probability: PREY_HUNTED_PROBABILITY,
        prey_random_death: PREY_RANDOM_DEATH,
        prey_birth_probability: PREY_BIRTH_PROBABILITY,
        prey_starvation_steps: PREY_STARVATION_STEPS,
        prey_threat_response: PREY_THREAT_RESPONSE,
        initial_substrate_probability: INITIAL_SUBSTRATE_PROBABILITY,
        substrate_random_death: SUBSTRATE_RANDOM_DEATH,
        substrate_consumption_prob: SUBSTRATE_CONSUMPTION_PROB,
        neighborhood_type: NEIGHBORHOOD_TYPE,
        grid_type: GRID_TYPE,
        record_simulation: false
    };
};

// Replace static DEFAULT_SIMULATION_SETTINGS with dynamic version
export const DEFAULT_SIMULATION_SETTINGS = getDefaultSettings(); 