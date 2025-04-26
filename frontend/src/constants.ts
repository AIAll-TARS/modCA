/**
 * Frontend constants for the modca_o7 web application.
 * This file should maintain consistency with backend/app/constants.py
 */

// Grid configuration
export const GRID_SIZE = 50;  // Size of the square grid (NxN)
export const STEPS = 100;  // Number of simulation iterations
export const NEIGHBORHOOD_TYPE = "moore";  // Can be "von_neumann" or "moore"
export const GRID_TYPE = "torus";  // Grid type, typically "torus"

// Predator parameters
export const PREDATOR_DEATH_PROBABILITY = 0.1;  // Probability of predator dying
export const PREDATOR_BIRTH_PROBABILITY = 0.3;  // Chance of predator reproduction
export const INITIAL_PREDATORS = 20;  // Starting number of predators
export const PREDATOR_STARVATION_STEPS = 5;  // Steps until predator dies from starvation

// Prey parameters
export const PREY_HUNTED_PROBABILITY = 0.3;  // Probability that a prey is hunted
export const PREY_RANDOM_DEATH = 0.1;  // Probability of prey dying randomly
export const INITIAL_PREY = 100;  // Starting number of prey
export const PREY_BIRTH_PROBABILITY = 0.3;  // Probability of prey reproduction
export const PREY_STARVATION_STEPS = 3;  // Steps until prey dies from starvation
export const PREY_THREAT_RESPONSE = 0.5;  // Probability of prey staying still when threatened

// Substrate parameters
export const INITIAL_SUBSTRATE_PROBABILITY = 0.3;  // Probability of substrate formation
export const SUBSTRATE_RANDOM_DEATH = 0.1;  // Probability of substrate disappearing
export const SUBSTRATE_CONSUMPTION_PROB = 0.3;  // Probability of substrate being consumed by prey

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
    GRID_SIZE: { min: 10, max: 1000 },
    STEPS: { min: 1, max: 10000 },
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

// Default simulation settings
export const DEFAULT_SIMULATION_SETTINGS = {
    grid_size: GRID_SIZE,
    steps: STEPS,
    initial_prey: INITIAL_PREY,
    initial_predators: INITIAL_PREDATORS,
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