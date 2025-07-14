"""
Constants module for the modca_o7 web application.
Contains default configuration parameters for the simulation.
"""

# Grid configuration
GRID_SIZE = 100  # Size of the square grid (NxN), max 100
STEPS = 9999  # Number of simulation iterations
NEIGHBORHOOD_TYPE = "moore"  # Can be "von_neumann" or "moore"
GRID_TYPE = "finite"  # Grid type, can be "finite" or "torus"

# Predator parameters
PREDATOR_DEATH_PROBABILITY = 0.1  # Probability of predator dying
PREDATOR_BIRTH_PROBABILITY = 0.43  # Chance of predator reproduction
INITIAL_PREDATORS = 20  # Starting number of predators
PREDATOR_STARVATION_STEPS = 66  # Steps until predator dies from starvation

# Prey parameters
PREY_HUNTED_PROBABILITY = 0.3  # Probability that a prey is hunted
PREY_RANDOM_DEATH = 0.1  # Probability of prey dying randomly
INITIAL_PREY = 1000  # Starting number of prey
PREY_BIRTH_PROBABILITY = 0.64  # Probability of prey reproduction
PREY_STARVATION_STEPS = 3  # Steps until prey dies from starvation
PREY_THREAT_RESPONSE = 0.5  # Probability of prey staying still when threatened

# Substrate parameters
INITIAL_SUBSTRATE_PROBABILITY = 0.3  # Probability of substrate formation
SUBSTRATE_RANDOM_DEATH = 0.1  # Probability of substrate disappearing
SUBSTRATE_CONSUMPTION_PROB = 0.3  # Probability of substrate being consumed by prey

# Entity representation in grid
EMPTY = 0
PREY = 1
PREDATOR = 2
SUBSTRATE = 3

# Visualization colors (for frontend reference)
COLORS = {
    EMPTY: "black",
    PREY: "#f7dc6f",  # Yellow
    PREDATOR: "#e74c3c",  # Red
    SUBSTRATE: "#27ae60"  # Green
}

# Simulation UI configuration
LARGE_GRID_THRESHOLD = 200  # Grids larger than this will use viewport rendering

# Database configuration
DB_PATH = "settings.db"  # SQLite database path

# API rate limiting
MAX_REQUESTS_PER_MINUTE = 100
