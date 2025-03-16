"""
Database handler module for the modca_o7 web application.
Manages database operations for storing and retrieving settings and simulation data.
"""

import sqlite3
import os
import json
import logging
from datetime import datetime
from .constants import (
    GRID_SIZE, STEPS, PREDATOR_DEATH_PROBABILITY, PREY_HUNTED_PROBABILITY,
    PREY_RANDOM_DEATH, SUBSTRATE_RANDOM_DEATH, INITIAL_PREY, INITIAL_PREDATORS,
    INITIAL_SUBSTRATE_PROBABILITY, SUBSTRATE_CONSUMPTION_PROB, PREDATOR_BIRTH_PROBABILITY,
    PREY_BIRTH_PROBABILITY, NEIGHBORHOOD_TYPE, DB_PATH
)

# Set up logging
logger = logging.getLogger(__name__)


class DatabaseHandler:
    def __init__(self, db_path=DB_PATH):
        """
        Initialize the database handler.

        Args:
            db_path (str): Path to the SQLite database file
        """
        self.db_path = db_path
        try:
            self.create_tables_if_not_exists()
            logger.info(f"Database initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            # If we can't initialize the database, use an in-memory fallback
            self.db_path = ":memory:"
            logger.warning(f"Using in-memory database as fallback")
            try:
                self.create_tables_if_not_exists()
            except Exception as inner_e:
                logger.error(
                    f"Error creating in-memory database: {str(inner_e)}")

    def create_tables_if_not_exists(self):
        """Create the required tables if they don't exist."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Create settings table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                grid_size INTEGER DEFAULT 100,
                steps INTEGER DEFAULT 100,
                neighborhood_type TEXT DEFAULT 'von_neumann',
                predator_death_probability REAL DEFAULT 0.05,
                predator_birth_probability REAL DEFAULT 0.33,
                initial_predators INTEGER DEFAULT 3,
                prey_hunted_probability REAL DEFAULT 0.7,
                prey_random_death REAL DEFAULT 0.01,
                initial_prey INTEGER DEFAULT 2000,
                prey_birth_probability REAL DEFAULT 0.7,
                initial_substrate_probability REAL DEFAULT 0.25,
                substrate_random_death REAL DEFAULT 0.03,
                substrate_consumption_prob REAL DEFAULT 0.6,
                user_id TEXT,
                name TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')

            # Create simulation results table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS simulation_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                settings_id INTEGER,
                statistics TEXT,
                completed BOOLEAN DEFAULT 0,
                steps_completed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (settings_id) REFERENCES settings (id)
            )
            ''')

            conn.commit()
            conn.close()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.exception(f"Error creating database tables: {str(e)}")
            raise

    def save_settings(self, settings):
        """
        Save settings to the database.

        Args:
            settings (dict): Dictionary containing simulation settings

        Returns:
            int: ID of the saved settings or -1 if an error occurred
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Validate the settings dictionary to ensure it has the required keys
            # If keys are missing, use default values
            safe_settings = {
                'grid_size': settings.get('grid_size', GRID_SIZE),
                'steps': settings.get('steps', STEPS),
                'neighborhood_type': settings.get('neighborhood_type', NEIGHBORHOOD_TYPE),
                'predator_death_probability': settings.get('predator_death_probability', PREDATOR_DEATH_PROBABILITY),
                'predator_birth_probability': settings.get('predator_birth_probability', PREDATOR_BIRTH_PROBABILITY),
                'initial_predators': settings.get('initial_predators', INITIAL_PREDATORS),
                'prey_hunted_probability': settings.get('prey_hunted_probability', PREY_HUNTED_PROBABILITY),
                'prey_random_death': settings.get('prey_random_death', PREY_RANDOM_DEATH),
                'initial_prey': settings.get('initial_prey', INITIAL_PREY),
                'prey_birth_probability': settings.get('prey_birth_probability', PREY_BIRTH_PROBABILITY),
                'initial_substrate_probability': settings.get('initial_substrate_probability', INITIAL_SUBSTRATE_PROBABILITY),
                'substrate_random_death': settings.get('substrate_random_death', SUBSTRATE_RANDOM_DEATH),
                'substrate_consumption_prob': settings.get('substrate_consumption_prob', SUBSTRATE_CONSUMPTION_PROB),
                'user_id': settings.get('user_id', None),
                'name': settings.get('name', None),
                'description': settings.get('description', None)
            }

            logger.info(f"Saving settings to database: {safe_settings}")

            cursor.execute('''
            INSERT INTO settings (
                grid_size, steps, neighborhood_type,
                predator_death_probability, predator_birth_probability, initial_predators,
                prey_hunted_probability, prey_random_death, initial_prey, prey_birth_probability,
                initial_substrate_probability, substrate_random_death, substrate_consumption_prob,
                user_id, name, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                safe_settings['grid_size'],
                safe_settings['steps'],
                safe_settings['neighborhood_type'],
                safe_settings['predator_death_probability'],
                safe_settings['predator_birth_probability'],
                safe_settings['initial_predators'],
                safe_settings['prey_hunted_probability'],
                safe_settings['prey_random_death'],
                safe_settings['initial_prey'],
                safe_settings['prey_birth_probability'],
                safe_settings['initial_substrate_probability'],
                safe_settings['substrate_random_death'],
                safe_settings['substrate_consumption_prob'],
                safe_settings['user_id'],
                safe_settings['name'],
                safe_settings['description']
            ))

            # Get the ID of the inserted row
            settings_id = cursor.lastrowid
            logger.info(f"Settings saved with ID: {settings_id}")

            conn.commit()
            conn.close()

            return settings_id
        except Exception as e:
            logger.exception(f"Error saving settings to database: {str(e)}")
            # Return a dummy ID to allow the simulation to continue even if DB save fails
            return -1

    def save_default_settings(self):
        """Save default settings to the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
        INSERT INTO settings (
            grid_size, steps, neighborhood_type, 
            predator_death_probability, predator_birth_probability, initial_predators,
            prey_hunted_probability, prey_random_death, initial_prey, prey_birth_probability,
            initial_substrate_probability, substrate_random_death, substrate_consumption_prob
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            GRID_SIZE, STEPS, NEIGHBORHOOD_TYPE,
            PREDATOR_DEATH_PROBABILITY, PREDATOR_BIRTH_PROBABILITY, INITIAL_PREDATORS,
            PREY_HUNTED_PROBABILITY, PREY_RANDOM_DEATH, INITIAL_PREY, PREY_BIRTH_PROBABILITY,
            INITIAL_SUBSTRATE_PROBABILITY, SUBSTRATE_RANDOM_DEATH, SUBSTRATE_CONSUMPTION_PROB
        ))

        conn.commit()
        conn.close()

    def get_latest_settings(self, user_id=None):
        """
        Get the latest settings from the database.

        Args:
            user_id (str, optional): User ID to filter settings by

        Returns:
            dict: Dictionary containing the latest settings
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        cursor = conn.cursor()

        if user_id:
            # Get latest settings for a specific user
            cursor.execute('''
            SELECT * FROM settings WHERE user_id = ? ORDER BY id DESC LIMIT 1
            ''', (user_id,))
        else:
            # Get latest settings globally
            cursor.execute('''
            SELECT * FROM settings ORDER BY id DESC LIMIT 1
            ''')

        row = cursor.fetchone()
        conn.close()

        if row:
            return dict(row)
        else:
            # Return default settings if no settings are found
            return {
                'grid_size': GRID_SIZE,
                'steps': STEPS,
                'neighborhood_type': NEIGHBORHOOD_TYPE,
                'predator_death_probability': PREDATOR_DEATH_PROBABILITY,
                'predator_birth_probability': PREDATOR_BIRTH_PROBABILITY,
                'initial_predators': INITIAL_PREDATORS,
                'prey_hunted_probability': PREY_HUNTED_PROBABILITY,
                'prey_random_death': PREY_RANDOM_DEATH,
                'initial_prey': INITIAL_PREY,
                'prey_birth_probability': PREY_BIRTH_PROBABILITY,
                'initial_substrate_probability': INITIAL_SUBSTRATE_PROBABILITY,
                'substrate_random_death': SUBSTRATE_RANDOM_DEATH,
                'substrate_consumption_prob': SUBSTRATE_CONSUMPTION_PROB
            }

    def get_settings_by_id(self, settings_id):
        """
        Get settings by ID.

        Args:
            settings_id (int): ID of the settings to retrieve

        Returns:
            dict: Dictionary containing the settings
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''
        SELECT * FROM settings WHERE id = ?
        ''', (settings_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return dict(row)
        else:
            return None

    def get_all_settings(self, user_id=None):
        """
        Get all settings from the database.

        Args:
            user_id (str, optional): User ID to filter settings by

        Returns:
            list: List of dictionaries containing all settings
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if user_id:
            # Get settings for a specific user
            cursor.execute('''
            SELECT * FROM settings WHERE user_id = ? ORDER BY id DESC
            ''', (user_id,))
        else:
            # Get all settings
            cursor.execute('''
            SELECT * FROM settings ORDER BY id DESC
            ''')

        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def save_simulation_results(self, settings_id, statistics, completed=False, steps_completed=0):
        """
        Save simulation results to the database.

        Args:
            settings_id (int): ID of the settings used for the simulation
            statistics (dict): Dictionary containing simulation statistics
            completed (bool): Whether the simulation has completed
            steps_completed (int): Number of steps completed

        Returns:
            int: ID of the saved simulation
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
        INSERT INTO simulations (
            settings_id, predator_count_data, prey_count_data, substrate_count_data,
            completed, steps_completed
        ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            settings_id,
            json.dumps(statistics.get('predator_count', [])),
            json.dumps(statistics.get('prey_count', [])),
            json.dumps(statistics.get('substrate_count', [])),
            completed,
            steps_completed
        ))

        simulation_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return simulation_id

    def get_simulation_by_id(self, simulation_id):
        """
        Get simulation by ID.

        Args:
            simulation_id (int): ID of the simulation to retrieve

        Returns:
            dict: Dictionary containing the simulation data
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''
        SELECT s.*, st.* FROM simulations s
        JOIN settings st ON s.settings_id = st.id
        WHERE s.id = ?
        ''', (simulation_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            # Parse JSON arrays
            simulation = dict(row)
            simulation['predator_count'] = json.loads(
                simulation['predator_count_data'])
            simulation['prey_count'] = json.loads(
                simulation['prey_count_data'])
            simulation['substrate_count'] = json.loads(
                simulation['substrate_count_data'])
            return simulation
        else:
            return None
