"""
Grid module for the modca_o7 web application.
Handles the grid structure and initialization of entities.
"""

import numpy as np
import random
import logging
from .constants import EMPTY, PREY, PREDATOR, SUBSTRATE

# Set up logging
logger = logging.getLogger(__name__)


def create_empty_grid(size):
    """
    Create an empty grid of the specified size.

    Args:
        size (int): Size of the square grid (NxN)

    Returns:
        numpy.ndarray: Empty grid with all cells set to EMPTY
    """
    if not isinstance(size, int) or size <= 0:
        logger.error(f"Invalid grid size: {size}")
        raise ValueError(f"Grid size must be a positive integer, got {size}")

    logger.info(f"Creating empty grid of size {size}x{size}")
    return np.zeros((size, size), dtype=int)


def initialize_grid(size, initial_prey, initial_predators, initial_substrate_prob):
    """
    Initialize grid with predators, prey, and substrate.

    Args:
        size (int): Size of the square grid (NxN)
        initial_prey (int): Number of prey to place initially
        initial_predators (int): Number of predators to place initially
        initial_substrate_prob (float): Probability for each empty cell to become substrate

    Returns:
        tuple: (numpy.ndarray, dict) - Initialized grid with entities and a dict with adjustment information
    """
    # Track input validation and adjustments
    try:
        # Validate parameters
        if not isinstance(size, int) or size <= 0:
            raise ValueError(
                f"Grid size must be a positive integer, got {size}")
        if not isinstance(initial_prey, int) or initial_prey < 0:
            raise ValueError(
                f"Initial prey must be a non-negative integer, got {initial_prey}")
        if not isinstance(initial_predators, int) or initial_predators < 0:
            raise ValueError(
                f"Initial predators must be a non-negative integer, got {initial_predators}")
        if not isinstance(initial_substrate_prob, float) or not 0 <= initial_substrate_prob <= 1:
            raise ValueError(
                f"Initial substrate probability must be between 0 and 1, got {initial_substrate_prob}")

        # Store original values to track adjustments
        original_values = {
            "initial_prey": initial_prey,
            "initial_predators": initial_predators,
            "initial_substrate_prob": initial_substrate_prob
        }

        # Initialize adjustment tracking
        adjustment_info = {
            "values_adjusted": False,
            "original_values": original_values,
            "adjusted_values": {},
            "reason": ""
        }

        # Check if we need to adjust entity counts
        total_cells = size * size
        total_entities = initial_prey + initial_predators
        adjustments_made = False

        # Adjust for very large grids
        if size >= 800:
            logger.info(
                f"Very large grid: {size}x{size}, applying optimizations")

            # Limit entity density for very large grids
            max_density = 0.3 if size >= 1000 else 0.4
            if total_entities > total_cells * max_density:
                ratio = initial_prey / total_entities if total_entities > 0 else 0.5
                max_entities = int(total_cells * max_density)

                adjusted_prey = int(max_entities * ratio)
                adjusted_predators = max_entities - adjusted_prey

                logger.warning(
                    f"Reduced prey: {initial_prey} → {adjusted_prey}")
                logger.warning(
                    f"Reduced predators: {initial_predators} → {adjusted_predators}")

                adjustments_made = True
                adjustment_info["values_adjusted"] = True
                adjustment_info["adjusted_values"]["initial_prey"] = adjusted_prey
                adjustment_info["adjusted_values"]["initial_predators"] = adjusted_predators
                adjustment_info["reason"] = f"Grid too large ({size}×{size}). Entity counts reduced to prevent memory issues."

                initial_prey = adjusted_prey
                initial_predators = adjusted_predators

            # Limit substrate probability for very large grids
            if initial_substrate_prob > 0.2:
                old_prob = initial_substrate_prob
                initial_substrate_prob = min(initial_substrate_prob, 0.2)
                logger.warning(
                    f"Reduced substrate probability: {old_prob} → {initial_substrate_prob}")

                adjustments_made = True
                adjustment_info["values_adjusted"] = True
                adjustment_info["adjusted_values"]["initial_substrate_prob"] = initial_substrate_prob
                adjustment_info["reason"] += " Substrate probability reduced to avoid memory issues."

        # Adjust for regular grids when entities > 80% of cells
        elif total_entities > total_cells * 0.8:
            ratio = initial_prey / total_entities if total_entities > 0 else 0.5
            max_entities = int(total_cells * 0.8)

            adjusted_prey = int(max_entities * ratio)
            adjusted_predators = max_entities - adjusted_prey

            logger.warning(
                f"Too many entities ({total_entities}) for grid size ({total_cells})")
            logger.warning(f"Adjusted prey: {initial_prey} → {adjusted_prey}")
            logger.warning(
                f"Adjusted predators: {initial_predators} → {adjusted_predators}")

            adjustments_made = True
            adjustment_info["values_adjusted"] = True
            adjustment_info["adjusted_values"]["initial_prey"] = adjusted_prey
            adjustment_info["adjusted_values"]["initial_predators"] = adjusted_predators
            adjustment_info["reason"] = f"Too many entities for grid size. Reduced to 80% of total cells."

            initial_prey = adjusted_prey
            initial_predators = adjusted_predators

        # Create an empty grid
        grid = create_empty_grid(size)
        logger.info(f"Created empty grid of size {size}×{size}")

        # SIMPLIFIED APPROACH: Always use vectorized placement
        # Create a flattened index of all cells
        all_indices = np.arange(total_cells)
        np.random.shuffle(all_indices)
        current_index = 0

        # 1. Place predators
        if initial_predators > 0:
            predator_count = min(
                initial_predators, total_cells - current_index)
            predator_indices = all_indices[current_index:current_index+predator_count]
            current_index += predator_count

            # Convert to 2D coordinates and place
            predator_coords = np.unravel_index(predator_indices, (size, size))
            grid[predator_coords] = PREDATOR
            logger.info(f"Placed {predator_count} predators")

            # Record adjustment if needed
            if predator_count < initial_predators:
                adjustments_made = True
                adjustment_info["values_adjusted"] = True
                adjustment_info["adjusted_values"]["actual_predator_count"] = predator_count
                adjustment_info["reason"] += f" Only placed {predator_count}/{initial_predators} predators due to space constraints."

        # 2. Place prey
        if initial_prey > 0:
            prey_count = min(initial_prey, total_cells - current_index)
            prey_indices = all_indices[current_index:current_index+prey_count]
            current_index += prey_count

            # Convert to 2D coordinates and place
            prey_coords = np.unravel_index(prey_indices, (size, size))
            grid[prey_coords] = PREY
            logger.info(f"Placed {prey_count} prey")

            # Record adjustment if needed
            if prey_count < initial_prey:
                adjustments_made = True
                adjustment_info["values_adjusted"] = True
                adjustment_info["adjusted_values"]["actual_prey_count"] = prey_count
                adjustment_info["reason"] += f" Only placed {prey_count}/{initial_prey} prey due to space constraints."

        # 3. Place substrate
        if initial_substrate_prob > 0:
            # Calculate expected substrate cells
            remaining_cells = total_cells - current_index
            substrate_count = int(remaining_cells * initial_substrate_prob)

            if substrate_count > 0:
                substrate_indices = all_indices[current_index:current_index+substrate_count]
                substrate_coords = np.unravel_index(
                    substrate_indices, (size, size))
                grid[substrate_coords] = SUBSTRATE
                logger.info(f"Placed {substrate_count} substrate cells")

                # Record substrate count in adjustments
                adjustment_info["adjusted_values"]["actual_substrate_count"] = substrate_count

        # Get final counts
        actual_predator_count = int(np.count_nonzero(grid == PREDATOR))
        actual_prey_count = int(np.count_nonzero(grid == PREY))
        actual_substrate_count = int(np.count_nonzero(grid == SUBSTRATE))
        empty_count = int(np.count_nonzero(grid == EMPTY))

        logger.info(f"Final grid stats: predators={actual_predator_count}, prey={actual_prey_count}, "
                    f"substrate={actual_substrate_count}, empty={empty_count}")

        # Ensure adjustment info is accurate
        if actual_predator_count != initial_predators or actual_prey_count != initial_prey:
            adjustments_made = True
            adjustment_info["values_adjusted"] = True
            adjustment_info["adjusted_values"]["actual_predator_count"] = actual_predator_count
            adjustment_info["adjusted_values"]["actual_prey_count"] = actual_prey_count

        if adjustments_made:
            logger.info(f"Adjustments were made: {adjustment_info}")

        # Always return both the grid and adjustment info
        return grid, adjustment_info

    except Exception as e:
        logger.exception(f"Error in initialize_grid: {str(e)}")
        # Re-raise so the caller knows something went wrong
        raise


def get_neighbors_coords(grid, x, y, neighborhood_type="von_neumann", grid_type="torus"):
    """
    Get coordinates of neighboring cells based on neighborhood type.

    Args:
        grid (numpy.ndarray): Current grid state
        x (int): X coordinate of the cell
        y (int): Y coordinate of the cell
        neighborhood_type (str): Type of neighborhood ("von_neumann" or "moore")
        grid_type (str): Type of grid boundary handling ("finite" or "torus")

    Returns:
        list: List of (x, y) tuples representing neighboring coordinates
    """
    size = grid.shape[0]
    neighbors = []

    if neighborhood_type == "von_neumann":
        # Von Neumann neighborhood (4 adjacent cells)
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    else:  # Moore neighborhood
        # Moore neighborhood (8 surrounding cells)
        directions = []
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue  # Skip the cell itself
                directions.append((dx, dy))

    for dx, dy in directions:
        nx, ny = x + dx, y + dy

        if grid_type == "torus":
            # Wrap around the edges (torus grid)
            nx = nx % size
            ny = ny % size
            neighbors.append((nx, ny))
        else:  # finite grid
            # Only include cells within grid boundaries
            if 0 <= nx < size and 0 <= ny < size:
                neighbors.append((nx, ny))

    return neighbors


def count_neighbors(grid, x, y, entity_type, neighborhood_type="von_neumann", grid_type="torus"):
    """
    Count neighbors of a specific entity type.

    Args:
        grid (numpy.ndarray): Current grid state
        x (int): X coordinate of the cell
        y (int): Y coordinate of the cell
        entity_type (int): Type of entity to count
        neighborhood_type (str): Type of neighborhood ("von_neumann" or "moore")
        grid_type (str): Type of grid boundary handling ("finite" or "torus")

    Returns:
        int: Count of neighbors of the specified entity type
    """
    count = 0
    for nx, ny in get_neighbors_coords(grid, x, y, neighborhood_type, grid_type):
        if grid[nx, ny] == entity_type:
            count += 1
    return count


def find_empty_neighbor(grid, x, y, neighborhood_type="von_neumann", grid_type="torus"):
    """
    Find an empty neighboring cell, if one exists.

    Args:
        grid (numpy.ndarray): Current grid state
        x (int): X coordinate of the cell
        y (int): Y coordinate of the cell
        neighborhood_type (str): Type of neighborhood ("von_neumann" or "moore")
        grid_type (str): Type of grid boundary handling ("finite" or "torus")

    Returns:
        tuple: (x, y) coordinates of an empty neighbor, or None if none exists
    """
    empty_neighbors = []
    for nx, ny in get_neighbors_coords(grid, x, y, neighborhood_type, grid_type):
        if grid[nx, ny] == EMPTY:
            empty_neighbors.append((nx, ny))

    if empty_neighbors:
        return random.choice(empty_neighbors)
    return None
