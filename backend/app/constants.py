"""
Constants module for the modca_o7 web application.
Contains default configuration parameters for the simulation.
"""

# Grid configuration
GRID_SIZE = 100  # Size of the square grid (NxN)
STEPS = 100  # Number of simulation iterations
NEIGHBORHOOD_TYPE = "von_neumann"  # Can be "von_neumann" or "moore"

# Predator parameters
PREDATOR_DEATH_PROBABILITY = 0.05  # Probability of predator dying
PREDATOR_BIRTH_PROBABILITY = 0.33  # Chance of predator reproduction
INITIAL_PREDATORS = 3  # Starting number of predators

# Prey parameters
PREY_HUNTED_PROBABILITY = 0.7  # Probability that a prey is hunted
PREY_RANDOM_DEATH = 0.01  # Probability of prey dying randomly
INITIAL_PREY = 2000  # Starting number of prey
PREY_BIRTH_PROBABILITY = 0.7  # Probability of prey reproduction

# Substrate parameters
INITIAL_SUBSTRATE_PROBABILITY = 0.25  # Probability of substrate formation
SUBSTRATE_RANDOM_DEATH = 0.03  # Probability of substrate disappearing
SUBSTRATE_CONSUMPTION_PROB = 0.6  # Probability of substrate being consumed by prey

# Entity representation in grid
EMPTY = 0
PREY = 1
PREDATOR = 2
SUBSTRATE = 3

# Visualization colors (for frontend reference)
COLORS = {
    EMPTY: 'black',
    PREY: 'yellow',
    PREDATOR: 'red',
    SUBSTRATE: 'green'
}

# Database configuration
DB_PATH = "settings.db"  # SQLite database path

# API rate limiting
MAX_REQUESTS_PER_MINUTE = 100
