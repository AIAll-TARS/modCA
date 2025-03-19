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
export const INITIAL_PREDATORS = 50;  // Starting number of predators
export const PREDATOR_STARVATION_STEPS = 10;  // Steps until predator dies from starvation

// Prey parameters
export const PREY_HUNTED_PROBABILITY = 0.2;  // Probability that a prey is hunted
export const PREY_RANDOM_DEATH = 0.05;  // Probability of prey dying randomly
export const INITIAL_PREY = 200;  // Starting number of prey
export const PREY_BIRTH_PROBABILITY = 0.2;  // Probability of prey reproduction
export const PREY_STARVATION_STEPS = 3;  // Steps until prey dies from starvation

// Substrate parameters
export const INITIAL_SUBSTRATE_PROBABILITY = 0.3;  // Probability of substrate formation
export const SUBSTRATE_RANDOM_DEATH = 0.05;  // Probability of substrate disappearing
export const SUBSTRATE_CONSUMPTION_PROB = 0.2;  // Probability of substrate being consumed by prey

// Entity representation in grid
export const EMPTY = 0;
export const PREY = 1;
export const PREDATOR = 2;
export const SUBSTRATE = 3;

// Visualization colors
export const COLORS = {
    [EMPTY]: "black",
    [PREY]: "#f7dc6f",  // Yellow
    [PREDATOR]: "#e74c3c",  // Red
    [SUBSTRATE]: "#27ae60"  // Green
};

// Chart colors with transparency
export const CHART_COLORS = {
    [PREDATOR]: {
        border: COLORS[PREDATOR],
        background: "rgba(231, 76, 60, 0.5)"
    },
    [PREY]: {
        border: COLORS[PREY],
        background: "rgba(247, 220, 111, 0.5)"
    },
    [SUBSTRATE]: {
        border: COLORS[SUBSTRATE],
        background: "rgba(39, 174, 96, 0.5)"
    }
};

// Simulation UI configuration
export const LARGE_GRID_THRESHOLD = 200;  // Grids larger than this will use viewport rendering

// Default simulation settings
export const DEFAULT_SIMULATION_SETTINGS = {
    grid_size: GRID_SIZE,
    steps: STEPS,
    neighborhood_type: NEIGHBORHOOD_TYPE,
    grid_type: GRID_TYPE,
    predator_death_probability: PREDATOR_DEATH_PROBABILITY,
    predator_birth_probability: PREDATOR_BIRTH_PROBABILITY,
    initial_predators: INITIAL_PREDATORS,
    predator_starvation_steps: PREDATOR_STARVATION_STEPS,
    prey_hunted_probability: PREY_HUNTED_PROBABILITY,
    prey_random_death: PREY_RANDOM_DEATH,
    initial_prey: INITIAL_PREY,
    prey_birth_probability: PREY_BIRTH_PROBABILITY,
    prey_starvation_steps: PREY_STARVATION_STEPS,
    initial_substrate_probability: INITIAL_SUBSTRATE_PROBABILITY,
    substrate_random_death: SUBSTRATE_RANDOM_DEATH,
    substrate_consumption_prob: SUBSTRATE_CONSUMPTION_PROB,
    record_simulation: false
}; 