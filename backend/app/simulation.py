"""
Simulation module for the modca_o7 web application.
Manages the simulation logic and updates grid states.
"""

import numpy as np
import random
import copy
import logging
from .constants import EMPTY, PREY, PREDATOR, SUBSTRATE
from .grid import (
    get_neighbors_coords,
    count_neighbors,
    find_empty_neighbor
)
from datetime import datetime
import os
import json
import time
import math
from typing import Dict, List, Tuple, Any, Optional

# Set up logging
logger = logging.getLogger(__name__)


class Simulation:
    def __init__(self, grid, params, recording_enabled=False, adjustment_info=None):
        """
        Initialize simulation with grid and parameters.

        Args:
            grid (numpy.ndarray): Initial grid state
            params (dict): Simulation parameters
            recording_enabled (bool): Whether to record simulation states for playback
            adjustment_info (dict): Information about adjustments made during grid initialization
        """
        self.grid = grid
        self.params = params

        # Store adjustment information
        self.adjustment_info = adjustment_info or {"values_adjusted": False}

        # Recording functionality
        self.recording_enabled = recording_enabled
        self.recorded_frames = []
        if recording_enabled:
            logger.info("Recording enabled for this simulation")
            # Save initial state
            self.recorded_frames.append({
                'grid': copy.deepcopy(self.grid).tolist(),
                'step': 0,
                'statistics': {
                    'predator_count': np.count_nonzero(self.grid == PREDATOR),
                    'prey_count': np.count_nonzero(self.grid == PREY),
                    'substrate_count': np.count_nonzero(self.grid == SUBSTRATE),
                    'empty_count': np.count_nonzero(self.grid == EMPTY)
                },
                'timestamp': datetime.now().isoformat()
            })

        # Initialize statistics tracking
        self.stats = {
            'predator_count': [np.count_nonzero(self.grid == PREDATOR)],
            'prey_count': [np.count_nonzero(self.grid == PREY)],
            'substrate_count': [np.count_nonzero(self.grid == SUBSTRATE)]
        }

        # Add event tracking statistics
        self.statistics = {
            "predator_deaths": 0,
            "predator_births": 0,
            "predator_starved": 0,
            "prey_deaths": 0,
            "prey_births": 0,
            "prey_hunted": 0,
            "prey_starved": 0,
            "substrate_created": 0,
            "substrate_consumed": 0
        }

        # Initialize starvation tracking arrays
        # -1 means not hungry (not a predator/prey), 0 means just ate, higher values mean steps since eating
        grid_shape = self.grid.shape
        self.predator_hunger = np.ones(
            grid_shape, dtype=int) * -1  # -1 for non-predator cells
        # -1 for non-prey cells
        self.prey_hunger = np.ones(grid_shape, dtype=int) * -1

        # Set initial hunger counters to 0 for all predators and prey
        self.predator_hunger[self.grid == PREDATOR] = 0
        self.prey_hunger[self.grid == PREY] = 0

        logger.info(
            f"Simulation initialized with grid shape {grid.shape} and parameters: {params}")
        logger.info(
            f"Initial counts - Predators: {self.stats['predator_count'][0]}, Prey: {self.stats['prey_count'][0]}, Substrate: {self.stats['substrate_count'][0]}")
        logger.info("Starvation tracking initialized for predators and prey")

    def step(self):
        """
        Execute one step of the simulation.

        Returns:
            numpy.ndarray: Updated grid
        """
        try:
            logger.info("Starting simulation step...")
            start_time = datetime.now()

            # Memory optimization: Make a deep copy of only the necessary data
            try:
                new_grid = np.copy(self.grid)
                # Create new hunger arrays for the updated grid
                new_predator_hunger = np.ones(self.grid.shape, dtype=int) * -1
                new_prey_hunger = np.ones(self.grid.shape, dtype=int) * -1
            except Exception as mem_error:
                logger.error(f"Memory allocation error: {str(mem_error)}")
                raise MemoryError(
                    f"Failed to allocate memory for grid: {str(mem_error)}")

            grid_size = self.grid.shape[0]

            # Diagnostic information about hunger states
            if np.count_nonzero(self.grid == PREDATOR) > 0:
                try:
                    avg_predator_hunger = np.mean(
                        self.predator_hunger[self.grid == PREDATOR])
                    max_predator_hunger = np.max(
                        self.predator_hunger[self.grid == PREDATOR])
                    logger.info(
                        f"Predator hunger stats: Avg={avg_predator_hunger:.2f}, Max={max_predator_hunger}")
                except Exception as e:
                    logger.warning(
                        f"Could not calculate predator hunger stats: {str(e)}")

            if np.count_nonzero(self.grid == PREY) > 0:
                try:
                    avg_prey_hunger = np.mean(
                        self.prey_hunger[self.grid == PREY])
                    max_prey_hunger = np.max(
                        self.prey_hunger[self.grid == PREY])
                    logger.info(
                        f"Prey hunger stats: Avg={avg_prey_hunger:.2f}, Max={max_prey_hunger}")
                except Exception as e:
                    logger.warning(
                        f"Could not calculate prey hunger stats: {str(e)}")

            # Process cells in random order to avoid bias
            # Memory optimization: Generate coordinates without storing the full list
            coords = []
            for x in range(grid_size):
                for y in range(grid_size):
                    coords.append((x, y))

            # Shuffle the coordinates for fair processing
            random.shuffle(coords)

            # Initialize counters for detailed logging
            processed_cells = 0
            predator_count = 0
            prey_count = 0
            substrate_count = 0
            empty_count = 0
            changes_made = 0

            # Memory optimization: Process cells in batches for large grids
            batch_size = 10000
            total_cells = len(coords)

            for batch_start in range(0, total_cells, batch_size):
                batch_end = min(batch_start + batch_size, total_cells)
                batch_coords = coords[batch_start:batch_end]

                # Process each cell in the batch
                for x, y in batch_coords:
                    processed_cells += 1
                    if processed_cells % 10000 == 0:
                        logger.info(
                            f"Processed {processed_cells}/{total_cells} cells...")

                    try:
                        # Skip already updated cells (prevents double updates in a single step)
                        if new_grid[x, y] != self.grid[x, y]:
                            continue

                        # Save current state to track changes
                        cell_before = self.grid[x, y]

                        if self.grid[x, y] == PREDATOR:
                            # Pass hunger tracking for starvation logic
                            self._update_predator(
                                new_grid, new_predator_hunger, x, y)
                            predator_count += 1
                        elif self.grid[x, y] == PREY:
                            # Pass hunger tracking for starvation logic
                            self._update_prey(new_grid, new_prey_hunger, x, y)
                            prey_count += 1
                        elif self.grid[x, y] == SUBSTRATE:
                            self._update_substrate(new_grid, x, y)
                            substrate_count += 1
                        elif self.grid[x, y] == EMPTY:
                            self._update_empty(
                                new_grid, new_predator_hunger, x, y)
                            empty_count += 1

                        # Check if cell changed
                        if new_grid[x, y] != cell_before:
                            changes_made += 1
                    except Exception as cell_error:
                        # Log error but continue processing other cells
                        logger.error(
                            f"Error processing cell at ({x}, {y}): {str(cell_error)}")
                        # To prevent cascading failures, leave this cell as is
                        new_grid[x, y] = self.grid[x, y]

                # Memory optimization: Free memory after each batch
                if batch_end < total_cells:
                    # Force garbage collection between batches for large grids
                    try:
                        import gc
                        gc.collect()
                    except:
                        pass

            # Count starvation deaths for logging (safely)
            try:
                predator_starvation_threshold = self.params.get(
                    'predator_starvation_steps', 10)
                prey_starvation_threshold = self.params.get(
                    'prey_starvation_steps', 3)

                starved_predators = np.sum(
                    (self.predator_hunger >= predator_starvation_threshold) & (self.grid == PREDATOR))
                starved_prey = np.sum(
                    (self.prey_hunger >= prey_starvation_threshold) & (self.grid == PREY))

                logger.info(
                    f"Starvation deaths - Predators: {starved_predators}, Prey: {starved_prey}")
            except Exception as stat_error:
                logger.warning(
                    f"Could not calculate starvation statistics: {str(stat_error)}")

            logger.info(
                f"Cells processed - Total: {processed_cells}, Changes made: {changes_made}")
            logger.info(
                f"Entity counts - Predators: {predator_count}, Prey: {prey_count}, Substrate: {substrate_count}, Empty: {empty_count}")

            # Check if any changes were made
            if changes_made == 0:
                logger.warning(
                    "Warning: No cell changes were made during this step!")

            # Update main grid and tracking arrays
            self.grid = new_grid
            self.predator_hunger = new_predator_hunger
            self.prey_hunger = new_prey_hunger

            # Memory optimization: Update statistics with error handling
            try:
                # Update statistics safely
                new_predator_count = int(
                    np.count_nonzero(self.grid == PREDATOR))
                new_prey_count = int(np.count_nonzero(self.grid == PREY))
                new_substrate_count = int(
                    np.count_nonzero(self.grid == SUBSTRATE))

                self.stats['predator_count'].append(new_predator_count)
                self.stats['prey_count'].append(new_prey_count)
                self.stats['substrate_count'].append(new_substrate_count)
            except Exception as stats_error:
                logger.error(f"Error updating statistics: {str(stats_error)}")

            # Record frame if recording is enabled (with error handling)
            if self.recording_enabled:
                try:
                    current_step_num = len(self.recorded_frames)
                    # Memory optimization: Don't record every cell for very large grids
                    grid_size = self.grid.shape[0]
                    if grid_size > 500:
                        # For large grids, store summary statistics only
                        self.recorded_frames.append({
                            'grid': None,  # Don't store the full grid
                            'grid_size': grid_size,
                            'step': current_step_num,
                            'statistics': {
                                'predator_count': new_predator_count,
                                'prey_count': new_prey_count,
                                'substrate_count': new_substrate_count,
                                'empty_count': grid_size * grid_size - (new_predator_count + new_prey_count + new_substrate_count)
                            },
                            'timestamp': datetime.now().isoformat()
                        })
                    else:
                        # For small grids, store the complete grid
                        self.recorded_frames.append({
                            'grid': copy.deepcopy(self.grid).tolist(),
                            'step': current_step_num,
                            'statistics': {
                                'predator_count': new_predator_count,
                                'prey_count': new_prey_count,
                                'substrate_count': new_substrate_count,
                                'empty_count': grid_size * grid_size - (new_predator_count + new_prey_count + new_substrate_count)
                            },
                            'timestamp': datetime.now().isoformat()
                        })
                    logger.info(f"Recorded frame {current_step_num}")
                except Exception as recording_error:
                    logger.error(
                        f"Error recording frame: {str(recording_error)}")

            # Memory optimization: Force garbage collection
            try:
                import gc
                gc.collect()
            except:
                pass

            # Process time and return grid
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            logger.info(f"Step completed in {duration:.2f} seconds")
            return self.grid

        except Exception as e:
            logger.exception(
                f"Critical error during simulation step: {str(e)}")
            # Try to return the current grid state if possible
            if hasattr(self, 'grid'):
                return self.grid
            raise

    def _update_predator(self, new_grid, new_predator_hunger, x, y):
        """Update predator cell for current simulation step."""
        grid_size = self.grid.shape[0]

        # Random death chance
        if random.random() < self.params.get('predator_death_chance', 0.005):
            logger.debug(f"Predator at ({x},{y}) died randomly")
            new_grid[x, y] = EMPTY
            return

        # Check hunger level for starvation
        current_hunger = self.predator_hunger[x, y]
        hunger_threshold = self.params.get('predator_starvation_steps', 10)

        # If predator is hungry enough to starve, it dies
        if current_hunger >= hunger_threshold:
            logger.debug(
                f"Predator at ({x},{y}) died from starvation, hunger level: {current_hunger}")
            new_grid[x, y] = EMPTY
            return  # Return early to avoid processing further

        # Get nearby cells to check for prey
        neighbors = self._get_nearby_cells(x, y, distance=2)

        # Calculate hunting risk based on hunger level
        # More hungry predators take more risks
        hunger_risk = current_hunger / hunger_threshold
        hunting_threshold = self.params.get('hunting_threshold', 0.6)
        hunt_success_prob = self.params.get('hunt_success_prob', 0.7)

        # Adjust hunting probability based on hunger
        hunt_probability = hunt_success_prob * (1 + hunger_risk)

        # Find prey in the vicinity
        prey_neighbors = [(nx, ny)
                          for nx, ny in neighbors if self.grid[nx, ny] == PREY]

        if prey_neighbors and random.random() < hunt_probability:
            # Choose a random prey to hunt
            prey_x, prey_y = random.choice(prey_neighbors)

            # Hunt is successful
            # Predator moves to prey location
            new_grid[prey_x, prey_y] = PREDATOR
            new_grid[x, y] = EMPTY  # Old position becomes empty

            # Reset hunger after successful hunt
            new_predator_hunger[prey_x, prey_y] = 0
            # Reset old position's hunger tracking
            new_predator_hunger[x, y] = -1

            # Chance to reproduce after eating
            if random.random() < self.params.get('predator_reproduction_chance', 0.2):
                # Find empty cell for the offspring
                empty_neighbors = self._get_nearby_cells(x, y, distance=1)
                empty_neighbors = [
                    (nx, ny) for nx, ny in empty_neighbors if self.grid[nx, ny] == EMPTY]

                if empty_neighbors:
                    # Reproduce into a random empty neighbor cell
                    nx, ny = random.choice(empty_neighbors)
                    new_grid[nx, ny] = PREDATOR
                    # New predator starts with 0 hunger
                    new_predator_hunger[nx, ny] = 0
                    logger.debug(
                        f"Predator at ({x},{y}) reproduced to ({nx},{ny}) after hunting")

            logger.debug(
                f"Predator moved from ({x},{y}) to ({prey_x},{prey_y}) to hunt prey")
            return

        # If no hunt or hunt failed, increase hunger
        new_hunger = current_hunger + 1
        new_predator_hunger[x, y] = new_hunger

        # If no prey found or hunt failed, try to move to an empty cell
        empty_neighbors = self._get_nearby_cells(x, y, distance=1)
        empty_neighbors = [
            (nx, ny) for nx, ny in empty_neighbors if self.grid[nx, ny] == EMPTY]

        if empty_neighbors and random.random() < self.params.get('predator_movement_prob', 0.5):
            # Move to a random empty neighbor cell
            nx, ny = random.choice(empty_neighbors)
            new_grid[nx, ny] = PREDATOR
            new_grid[x, y] = EMPTY
            # Transfer hunger state to new location
            new_predator_hunger[nx, ny] = new_hunger
            # Reset the old location's hunger tracking
            new_predator_hunger[x, y] = -1
            logger.debug(f"Predator moved from ({x},{y}) to ({nx},{ny})")
            return

    def _update_prey(self, new_grid, new_prey_hunger, x, y):
        """Update prey cell for current simulation step."""
        grid_size = self.grid.shape[0]

        # Random death chance
        if random.random() < self.params.get('prey_death_chance', 0.01):
            logger.debug(f"Prey at ({x},{y}) died from random death")
            new_grid[x, y] = EMPTY
            return

        # Check hunger level for starvation
        current_hunger = self.prey_hunger[x, y]
        hunger_threshold = self.params.get('prey_starvation_steps', 15)

        # If prey is hungry enough to starve, it dies
        if current_hunger >= hunger_threshold:
            logger.debug(
                f"Prey at ({x},{y}) died from starvation, hunger level: {current_hunger}")
            new_grid[x, y] = EMPTY
            return  # Return early to avoid processing further

        # Get nearby cells to check for predators and food
        neighbors = self._get_nearby_cells(x, y, distance=1)

        # Check if any predators are nearby - prey under threat
        predator_nearby = any(
            self.grid[nx, ny] == PREDATOR for nx, ny in neighbors)

        # If predator is nearby, prey's hunger increases (stress effect)
        if predator_nearby:
            new_hunger = current_hunger + 1
            new_prey_hunger[x, y] = new_hunger
            if random.random() < 0.7:  # 70% chance to stay put when threatened
                return
        else:
            # Normal hunger increase
            new_hunger = current_hunger + 1
            new_prey_hunger[x, y] = new_hunger

        # Try to eat substrate if available nearby
        substrate_neighbors = [
            (nx, ny) for nx, ny in neighbors if self.grid[nx, ny] == SUBSTRATE]
        if substrate_neighbors:
            # Found substrate - consume it
            sx, sy = random.choice(substrate_neighbors)
            new_grid[sx, sy] = EMPTY  # Consume the substrate

            # Reset hunger after eating
            new_prey_hunger[x, y] = 0

            # Chance to reproduce after eating
            if random.random() < self.params.get('prey_reproduction_chance', 0.3):
                # Find empty cell for the offspring
                empty_neighbors = [
                    (nx, ny) for nx, ny in neighbors if self.grid[nx, ny] == EMPTY]
                if empty_neighbors:
                    # Reproduce into a random empty neighbor cell
                    nx, ny = random.choice(empty_neighbors)
                    new_grid[nx, ny] = PREY
                    # New prey starts with 0 hunger
                    new_prey_hunger[nx, ny] = 0
                    logger.debug(
                        f"Prey at ({x},{y}) reproduced to ({nx},{ny})")
            return

        # If no substrate found and no predator nearby or got lucky, try to move
        empty_neighbors = [(nx, ny)
                           for nx, ny in neighbors if self.grid[nx, ny] == EMPTY]
        if empty_neighbors:
            # Move to a random empty neighbor cell
            nx, ny = random.choice(empty_neighbors)
            new_grid[nx, ny] = PREY
            new_grid[x, y] = EMPTY
            # Transfer hunger state to new location
            new_prey_hunger[nx, ny] = new_hunger
            # Reset the old location's hunger tracking
            new_prey_hunger[x, y] = -1
            logger.debug(f"Prey moved from ({x},{y}) to ({nx},{ny})")
            return

    def _update_substrate(self, new_grid, x, y):
        """Update a substrate cell in the simulation."""
        # Check for random death
        if random.random() < self.params['substrate_random_death']:
            new_grid[x, y] = EMPTY

    def _update_empty(self, new_grid, new_predator_hunger, x, y):
        """Update an empty cell in the simulation.

        Predator reproduction rule:
        - Requires 2 or more adjacent predator neighbors
        - Requires at least 1 prey in the neighborhood
        - Subject to predator_birth_probability parameter
        """
        # First check for predator reproduction: if 2+ predator neighbors exist
        predator_neighbors = count_neighbors(
            self.grid, x, y, PREDATOR, self.params['neighborhood_type'], self.params['grid_type']
        )

        # NEW RULE: Also check for prey in the neighborhood
        prey_neighbors = count_neighbors(
            self.grid, x, y, PREY, self.params['neighborhood_type'], self.params['grid_type']
        )

        if (predator_neighbors >= 2 and prey_neighbors >= 1 and
                random.random() < self.params['predator_birth_probability']):
            # Two or more predators are neighbors AND at least one prey in neighborhood
            # so this empty cell can become a new predator
            new_grid[x, y] = PREDATOR
            # Initialize hunger counter for the new predator
            new_predator_hunger[x, y] = 0
            # Track the birth event
            self.statistics["predator_births"] += 1
            logger.info(
                f"New predator born at ({x},{y}) with {predator_neighbors} predator neighbors and {prey_neighbors} prey neighbors")
            return

        # If no predator reproduction occurred, check for substrate formation
        # Lower chance during simulation
        if random.random() < self.params['initial_substrate_probability'] / 10:
            new_grid[x, y] = SUBSTRATE
            # Track the substrate creation
            self.statistics["substrate_created"] += 1

    def get_statistics(self):
        """
        Get the current statistics of the simulation.

        Returns:
            dict: Current simulation statistics
        """
        try:
            logger.info("Getting simulation statistics")

            # Count cells safely
            try:
                predator_count = int(np.count_nonzero(self.grid == PREDATOR))
                prey_count = int(np.count_nonzero(self.grid == PREY))
                substrate_count = int(np.count_nonzero(self.grid == SUBSTRATE))
                empty_count = int(np.count_nonzero(self.grid == EMPTY))
                total_cells = self.grid.size

                # Get starvation thresholds
                predator_starvation_threshold = self.params.get(
                    'predator_starvation_steps', 10)
                prey_starvation_threshold = self.params.get(
                    'prey_starvation_steps', 3)

                # Count entities at risk of starvation (those at 80% or more of their starvation threshold)
                predator_risk_threshold = int(
                    predator_starvation_threshold * 0.8)
                prey_risk_threshold = int(prey_starvation_threshold * 0.8)

                starving_predators = int(
                    np.sum((self.predator_hunger >= predator_risk_threshold) & (self.grid == PREDATOR)))
                starving_prey = int(
                    np.sum((self.prey_hunger >= prey_risk_threshold) & (self.grid == PREY)))

                logger.info(
                    f"Cell counts: Predators={predator_count}, Prey={prey_count}, Substrate={substrate_count}, Empty={empty_count}, Total={total_cells}")
                logger.info(
                    f"Starvation risk: Predators={starving_predators}/{predator_count} (threshold: {predator_risk_threshold}), Prey={starving_prey}/{prey_count} (threshold: {prey_risk_threshold})")
            except Exception as e:
                logger.error(f"Error counting cells: {str(e)}")
                # Return safe defaults if counting fails
                predator_count = 0
                prey_count = 0
                substrate_count = 0
                empty_count = 0
                total_cells = 1  # Avoid division by zero
                starving_predators = 0
                starving_prey = 0

            # Calculate percentages safely
            predator_percentage = (predator_count / total_cells) * 100
            prey_percentage = (prey_count / total_cells) * 100
            substrate_percentage = (substrate_count / total_cells) * 100
            empty_percentage = (empty_count / total_cells) * 100

            # Get historical trend data safely
            if len(self.stats['predator_count']) > 0:
                latest_predator = self.stats['predator_count'][-1]
                latest_prey = self.stats['prey_count'][-1]
                latest_substrate = self.stats['substrate_count'][-1]
            else:
                latest_predator = predator_count
                latest_prey = prey_count
                latest_substrate = substrate_count

            stats = {
                'predator_count': latest_predator,
                'prey_count': latest_prey,
                'substrate_count': latest_substrate,
                'empty_count': empty_count,
                'predator_percentage': round(predator_percentage, 2),
                'prey_percentage': round(prey_percentage, 2),
                'substrate_percentage': round(substrate_percentage, 2),
                'empty_percentage': round(empty_percentage, 2),
                'starving_predators': starving_predators,
                'starving_prey': starving_prey,
            }

            # Add adjustment information if available
            if hasattr(self, 'adjustment_info') and self.adjustment_info.get("values_adjusted", False):
                stats["values_adjusted"] = True
                stats["original_values"] = self.adjustment_info.get(
                    "original_values", {})
                stats["adjusted_values"] = self.adjustment_info.get(
                    "adjusted_values", {})
                stats["adjustment_reason"] = self.adjustment_info.get(
                    "reason", "")

            logger.info(f"Statistics calculated successfully: {stats}")
            return stats

        except Exception as e:
            logger.exception(f"Error in get_statistics: {str(e)}")
            # Return safe default statistics to prevent crashes
            return {
                'predator_count': 0,
                'prey_count': 0,
                'substrate_count': 0,
                'empty_count': 0,
                'predator_percentage': 0,
                'prey_percentage': 0,
                'substrate_percentage': 0,
                'empty_percentage': 0,
                'starving_predators': 0,
                'starving_prey': 0,
            }

    def get_historical_stats(self):
        """
        Get historical statistics for the entire simulation.

        Returns:
            dict: Dictionary containing lists of counts for each entity type
        """
        return self.stats

    def save_recording(self, simulation_id=None, recording_dir='recordings'):
        """
        Save the recorded frames to disk.

        Args:
            simulation_id (str): Unique identifier for the simulation
            recording_dir (str): Directory to save recordings in

        Returns:
            dict: Information about the saved recording
        """
        if not self.recording_enabled or not self.recorded_frames:
            logger.warning("No recording to save")
            return {"status": "error", "message": "No recording available"}

        try:
            # Ensure the recording directory exists
            os.makedirs(os.path.join(os.path.dirname(__file__),
                        '..', recording_dir), exist_ok=True)

            # Generate a filename based on timestamp if no simulation_id provided
            if not simulation_id:
                simulation_id = f"sim_{int(time.time())}"

            # Create metadata for the recording
            metadata = {
                "simulation_id": simulation_id,
                "created_at": datetime.now().isoformat(),
                "grid_size": self.grid.shape[0],
                "frame_count": len(self.recorded_frames),
                "parameters": self.params,
                "final_statistics": self.get_statistics()
            }

            # Save metadata
            metadata_filename = os.path.join(os.path.dirname(
                __file__), '..', recording_dir, f"{simulation_id}_metadata.json")
            with open(metadata_filename, 'w') as f:
                json.dump(metadata, f, indent=2)

            # Save frames (potentially saving in chunks for very large recordings)
            frames_filename = os.path.join(os.path.dirname(
                __file__), '..', recording_dir, f"{simulation_id}_frames.json")
            with open(frames_filename, 'w') as f:
                json.dump(self.recorded_frames, f)

            logger.info(
                f"Recording saved: {simulation_id} with {len(self.recorded_frames)} frames")
            return {
                "status": "success",
                "recording_id": simulation_id,
                "frame_count": len(self.recorded_frames),
                "metadata_file": metadata_filename,
                "frames_file": frames_filename
            }

        except Exception as e:
            logger.exception(f"Error saving recording: {str(e)}")
            return {"status": "error", "message": f"Failed to save recording: {str(e)}"}

    @staticmethod
    def get_available_recordings(recording_dir='recordings'):
        """
        Get a list of available recordings.

        Args:
            recording_dir (str): Directory to search for recordings

        Returns:
            list: Information about available recordings
        """
        try:
            # Ensure the recording directory exists
            path = os.path.join(os.path.dirname(__file__), '..', recording_dir)
            os.makedirs(path, exist_ok=True)

            recordings = []

            # Look for metadata files
            for filename in os.listdir(path):
                if filename.endswith('_metadata.json'):
                    try:
                        with open(os.path.join(path, filename), 'r') as f:
                            metadata = json.load(f)

                        # Check if the frames file exists
                        simulation_id = metadata.get('simulation_id')
                        frames_file = os.path.join(
                            path, f"{simulation_id}_frames.json")

                        if os.path.exists(frames_file):
                            recordings.append({
                                'simulation_id': simulation_id,
                                'created_at': metadata.get('created_at'),
                                'grid_size': metadata.get('grid_size'),
                                'frame_count': metadata.get('frame_count'),
                                'parameters': metadata.get('parameters'),
                                'final_statistics': metadata.get('final_statistics')
                            })
                    except Exception as e:
                        logger.error(
                            f"Error reading recording metadata {filename}: {str(e)}")

            return sorted(recordings, key=lambda x: x.get('created_at', ''), reverse=True)

        except Exception as e:
            logger.exception(f"Error listing recordings: {str(e)}")
            return []

    @staticmethod
    def load_recording(simulation_id, recording_dir='recordings'):
        """
        Load a recording from disk.

        Args:
            simulation_id (str): Unique identifier for the simulation
            recording_dir (str): Directory where recordings are stored

        Returns:
            dict: The recording data including metadata and frames
        """
        try:
            path = os.path.join(os.path.dirname(__file__), '..', recording_dir)

            # Load metadata
            metadata_file = os.path.join(
                path, f"{simulation_id}_metadata.json")
            if not os.path.exists(metadata_file):
                return {"status": "error", "message": f"Recording {simulation_id} not found"}

            with open(metadata_file, 'r') as f:
                metadata = json.load(f)

            # Load frames
            frames_file = os.path.join(path, f"{simulation_id}_frames.json")
            if not os.path.exists(frames_file):
                return {"status": "error", "message": f"Frames for recording {simulation_id} not found"}

            with open(frames_file, 'r') as f:
                frames = json.load(f)

            return {
                "status": "success",
                "metadata": metadata,
                "frames": frames
            }

        except Exception as e:
            logger.exception(
                f"Error loading recording {simulation_id}: {str(e)}")
            return {"status": "error", "message": f"Failed to load recording: {str(e)}"}

    def _get_nearby_cells(self, x: int, y: int, distance: int = 1) -> List[Tuple[int, int]]:
        """
        Get coordinates of cells within a certain distance.

        Args:
            x: X coordinate of the center cell
            y: Y coordinate of the center cell
            distance: Distance (in cells) to look around

        Returns:
            List of (x,y) tuples representing nearby cell coordinates
        """
        grid_size = self.grid.shape[0]
        nearby_cells = []

        # Get the grid type and neighborhood type from params
        grid_type = self.params.get('grid_type', 'bounded')
        neighborhood_type = self.params.get('neighborhood_type', 'moore')

        # Define the range based on distance and grid type
        for dx in range(-distance, distance + 1):
            for dy in range(-distance, distance + 1):
                # Skip the center cell
                if dx == 0 and dy == 0:
                    continue

                # Skip corners for von Neumann neighborhood
                if neighborhood_type == 'von_neumann' and abs(dx) + abs(dy) > distance:
                    continue

                # Calculate new coordinates based on grid type
                nx, ny = x + dx, y + dy

                if grid_type == 'bounded':
                    # Bounded grid: skip cells outside grid boundaries
                    if 0 <= nx < grid_size and 0 <= ny < grid_size:
                        nearby_cells.append((nx, ny))
                else:  # 'toroidal'
                    # Toroidal grid: wrap around edges
                    nx = (nx + grid_size) % grid_size
                    ny = (ny + grid_size) % grid_size
                    nearby_cells.append((nx, ny))

        return nearby_cells
