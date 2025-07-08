/**
 * Frontend constants for the modca_o7 web application.
 * This file should maintain consistency with backend/app/constants.py
 */

// Grid configuration
export const DEFAULT_GRID_SIZE = 75;  // Reference grid size for population scaling
export const GRID_SIZE = DEFAULT_GRID_SIZE;  // Size of the square grid (NxN)
export const STEPS = 9999;  // Number of simulation iterations
export const NEIGHBORHOOD_TYPE = "moore";  // Can be "von_neumann" or "moore"
export const GRID_TYPE = "torus";  // Grid type, typically "torus"

// Steps configuration
export const MIN_STEPS = 10;  // 10^1
export const MAX_STEPS = 1000000;  // 10^6
export const DEFAULT_STEPS = 9999;

// Helper functions for logarithmic steps scaling
export const stepsToSliderValue = (steps: number): number => {
    return Math.log10(steps);
};

export const sliderValueToSteps = (value: number): number => {
    return Math.floor(Math.pow(10, value));
};

// Default populations
export const DEFAULT_INITIAL_PREDATORS = 20;  // Default starting number of predators
export const DEFAULT_INITIAL_PREY = 1000;  // Default starting number of prey
export const DEFAULT_SUBSTRATE_COVERAGE = 0.3;  // Default substrate coverage (30%)

// Predator parameters
export const PREDATOR_DEATH_PROBABILITY = 0.1;  // Probability of predator dying
export const PREDATOR_BIRTH_PROBABILITY = 0.43;  // Chance of predator reproduction
export const INITIAL_PREDATORS = DEFAULT_INITIAL_PREDATORS;  // Starting number of predators
export const PREDATOR_STARVATION_STEPS = 66;  // Steps until predator dies from starvation

// Prey parameters
export const PREY_HUNTED_PROBABILITY = 0.3;  // Probability that a prey is hunted
export const PREY_RANDOM_DEATH = 0.1;  // Probability of prey dying randomly
export const INITIAL_PREY = DEFAULT_INITIAL_PREY;  // Starting number of prey
export const PREY_BIRTH_PROBABILITY = 0.64;  // Probability of prey reproduction
export const PREY_STARVATION_STEPS = 3;  // Steps until prey dies from starvation
export const PREY_THREAT_RESPONSE = 0.5;  // Probability of prey staying still when threatened

// Substrate parameters
export const INITIAL_SUBSTRATE_PROBABILITY = DEFAULT_SUBSTRATE_COVERAGE;  // Probability of substrate formation
export const SUBSTRATE_RANDOM_DEATH = 0.1;  // Probability of substrate disappearing
export const SUBSTRATE_CONSUMPTION_PROB = 0.3;  // Probability of substrate being consumed by prey

// Population scaling functions
export const calculateScaledPopulation = (defaultPopulation: number, currentGridSize: number): number => {
    const scaleFactor = (currentGridSize * currentGridSize) / (DEFAULT_GRID_SIZE * DEFAULT_GRID_SIZE);
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
    GRID_SIZE: { min: 10, max: 100 },  // Updated to match backend limits
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
export const getDefaultSettings = (gridSize: number = DEFAULT_GRID_SIZE) => {
    const maxPop = calculateMaxPopulation(gridSize);
    return {
        grid_size: gridSize,
        steps: DEFAULT_STEPS,
        initial_prey: Math.min(calculateScaledPopulation(DEFAULT_INITIAL_PREY, gridSize), maxPop * 0.5),
        initial_predators: Math.min(calculateScaledPopulation(DEFAULT_INITIAL_PREDATORS, gridSize), maxPop * 0.1),
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