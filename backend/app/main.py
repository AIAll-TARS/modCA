"""
Main module for the modca_o7 web application backend.
Provides FastAPI server for simulation execution and API endpoints.
"""

from .constants import EMPTY, PREY, PREDATOR, SUBSTRATE
from .models import SimulationSettings, SimulationResponse, UserSettings
from .db_handler import DatabaseHandler
from .grid import initialize_grid
from .simulation import Simulation
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import numpy as np
import uvicorn
from datetime import datetime
from typing import List, Dict, Any, Optional
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import simulation components (these will be moved to the backend)
# We'll create copies of these files in the backend directory

# Create FastAPI application
app = FastAPI(
    title="modCA_7 Web API",
    description="Web API for the modCA_7 cellular automata simulation",
    version="1.0.0",
)

# Add CORS middleware to allow cross-origin requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Helper functions for async operations


async def initialize_grid_with_timeout(size, initial_prey, initial_predators, initial_substrate_prob):
    """
    Async wrapper for initialize_grid to allow timeout handling.

    Returns:
        tuple: (numpy.ndarray, dict) - Initialized grid and adjustment information
    """
    # Run the CPU-intensive grid initialization in a thread pool
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,  # Use default executor
        initialize_grid,
        size, initial_prey, initial_predators, initial_substrate_prob
    )

# Store active simulations
active_simulations = {}
# Store active WebSocket connections
active_connections: List[WebSocket] = []


@app.get("/")
async def root():
    """Root endpoint to check if API is running."""
    return {"message": "modCA_7 Web API is running"}


@app.post("/api/simulate", response_model=SimulationResponse)
async def start_simulation(settings: SimulationSettings):
    """Start a new simulation with the provided settings."""
    try:
        logger.info(f"Starting new simulation with settings: {settings}")

        # Check if grid size is extremely large and might cause memory issues
        if settings.grid_size > 800:
            logger.warning(
                f"Very large grid size requested: {settings.grid_size}×{settings.grid_size}. Using memory-efficient mode.")

            # For extremely large grids, automatically adjust entity counts to avoid memory issues
            total_cells = settings.grid_size * settings.grid_size

            # For very large grids, enforce a lower density to avoid memory issues
            max_density = 0.4  # Lower max density for huge grids
            total_entities = settings.initial_prey + settings.initial_predators

            if total_entities > total_cells * max_density:
                ratio = settings.initial_prey / \
                    (total_entities) if total_entities > 0 else 0.8

                # Calculate adjusted counts
                max_entities = int(total_cells * max_density)
                adjusted_prey = int(max_entities * ratio)
                adjusted_predators = max_entities - adjusted_prey

                logger.warning(
                    f"Reducing entity count for large grid: prey {settings.initial_prey} → {adjusted_prey}, predators {settings.initial_predators} → {adjusted_predators}")

                # Update settings with adjusted values
                settings.initial_prey = adjusted_prey
                settings.initial_predators = adjusted_predators

        # Generate a unique simulation ID
        simulation_id = f"sim_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(active_simulations)}"
        logger.info(f"Generated simulation ID: {simulation_id}")

        # Initialize grid with more robust error handling
        try:
            logger.info(
                f"Initializing grid with size={settings.grid_size}, prey={settings.initial_prey}, predators={settings.initial_predators}, substrate_prob={settings.initial_substrate_probability}")

            # Set a longer timeout for large grids
            grid_initialization_timeout = 300  # 5 minutes for very large grids

            # Use a task with timeout for grid initialization
            grid_task = asyncio.create_task(initialize_grid_with_timeout(
                settings.grid_size,
                settings.initial_prey,
                settings.initial_predators,
                settings.initial_substrate_probability
            ))

            try:
                result = await asyncio.wait_for(grid_task, timeout=grid_initialization_timeout)
                # Now we receive both the grid and adjustment info
                if isinstance(result, tuple) and len(result) == 2:
                    grid, adjustment_info = result
                else:
                    # Handle backward compatibility
                    grid = result
                    adjustment_info = {"values_adjusted": False}

                logger.info(
                    f"Grid successfully initialized with shape {grid.shape}")
                if adjustment_info.get("values_adjusted", False):
                    logger.info(
                        f"Values were adjusted during initialization: {adjustment_info}")
            except asyncio.TimeoutError:
                logger.error(
                    f"Grid initialization timed out after {grid_initialization_timeout} seconds")
                raise HTTPException(
                    status_code=504,
                    detail=f"Grid initialization timed out. The grid size {settings.grid_size}×{settings.grid_size} is too large to process within the time limit."
                )

        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.exception(f"Error during grid initialization: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Grid initialization failed: {str(e)}")

        # Create simulation parameters dictionary
        params = settings.dict()
        logger.info("Parameters dictionary created successfully")

        # Pass the recording flag to the simulation
        record_simulation = settings.record_simulation
        if record_simulation:
            logger.info(f"Recording enabled for simulation {simulation_id}")

        # Create a new simulation with error handling
        try:
            logger.info("Creating new simulation instance")
            simulation = Simulation(
                grid,
                params,
                recording_enabled=record_simulation,
                adjustment_info=adjustment_info if adjustment_info.get(
                    "values_adjusted", False) else None
            )
            logger.info("Simulation instance created successfully")

            # Test getting statistics to ensure simulation is correctly initialized
            test_stats = simulation.get_statistics()
            logger.info(
                f"Initial statistics retrieved successfully: {test_stats}")
        except Exception as e:
            logger.exception(f"Error creating simulation: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Simulation initialization failed: {str(e)}")

        # Store the simulation
        active_simulations[simulation_id] = {
            "simulation": simulation,
            "settings": settings,
            "current_step": 0,
            "total_steps": settings.steps,
            "status": "running",
            "created_at": datetime.now().isoformat(),
        }
        logger.info(f"Simulation {simulation_id} stored in active_simulations")

        # Save settings to database - but make this non-critical
        db_save_success = False
        try:
            db = DatabaseHandler()
            settings_id = db.save_settings(params)
            logger.info(f"Settings saved to database with ID: {settings_id}")
            db_save_success = (settings_id > 0)
        except Exception as e:
            logger.error(f"Error saving settings to database: {str(e)}")
            # Continue even if database save fails - this is non-critical functionality
            logger.info("Continuing without saving settings to database")

        # Get initial statistics
        statistics = simulation.get_statistics()
        logger.info(f"Initial statistics: {statistics}")

        # Return initial state and simulation ID
        response = {
            "simulation_id": simulation_id,
            "status": "running",  # Changed from "started" to "running" for consistency
            "current_step": 0,
            "total_steps": settings.steps,
            "grid": grid.tolist(),
            "statistics": statistics,
            # Optional field to indicate if DB save was successful
            "db_save_success": db_save_success
        }

        # Add adjustment information if values were adjusted during grid initialization
        if adjustment_info and adjustment_info.get("values_adjusted", False):
            response["adjustments"] = adjustment_info

        logger.info(f"Returning initial simulation state for {simulation_id}")
        return response

    except HTTPException:
        # Re-raise HTTP exceptions as they already have appropriate status codes
        raise
    except ValueError as e:
        # Handle validation errors
        error_msg = f"Invalid parameter: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    except Exception as e:
        # Handle all other unexpected errors
        error_msg = f"Error starting simulation: {str(e)}"
        logger.exception(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/api/simulate/{simulation_id}/status", response_model=SimulationResponse)
async def get_simulation_status(simulation_id: str):
    """Get the current status of a running simulation."""
    if simulation_id not in active_simulations:
        raise HTTPException(status_code=404, detail="Simulation not found")

    sim_data = active_simulations[simulation_id]
    simulation = sim_data["simulation"]

    return {
        "simulation_id": simulation_id,
        "status": sim_data["status"],
        "current_step": sim_data["current_step"],
        "total_steps": sim_data["total_steps"],
        "grid": simulation.grid.tolist(),
        "statistics": simulation.get_statistics()
    }


@app.post("/api/simulate/{simulation_id}/step")
async def step_simulation(simulation_id: str, steps: int = 1):
    """Run a specified number of steps for a simulation."""
    logger.info(
        f"Step simulation request received for simulation {simulation_id}, steps={steps}")

    # Get steps from both query param and request body to ensure flexibility
    logger.info(f"Received steps parameter: {steps}")

    # Validate input
    try:
        steps = int(steps)
        if steps <= 0:
            logger.warning(f"Invalid steps value: {steps}, defaulting to 1")
            steps = 1
    except (ValueError, TypeError):
        logger.warning(f"Invalid steps value: {steps}, defaulting to 1")
        steps = 1

    logger.info(f"Using steps value: {steps}")

    if simulation_id not in active_simulations:
        logger.error(f"Simulation {simulation_id} not found")
        raise HTTPException(status_code=404, detail="Simulation not found")

    sim_data = active_simulations[simulation_id]
    simulation = sim_data["simulation"]

    logger.info(
        f"Current state before stepping: step={sim_data['current_step']}, total={sim_data['total_steps']}, status={sim_data['status']}")

    # Prevent processing if simulation is already complete
    if sim_data["status"] == "completed":
        logger.info("Simulation already completed, no steps will be run")
        return {
            "simulation_id": simulation_id,
            "status": sim_data["status"],
            "current_step": sim_data["current_step"],
            "total_steps": sim_data["total_steps"],
            "grid": simulation.grid.tolist(),
            "statistics": simulation.get_statistics(),
            "message": "Simulation already completed",
            "steps_run": 0
        }

    # Check grid size for large simulations
    grid_size = simulation.grid.shape[0]
    is_large_grid = grid_size >= 500
    is_very_large_grid = grid_size >= 800

    # Adjust steps and timeout based on grid size
    if is_very_large_grid and steps > 1:
        logger.info(
            f"Reducing steps from {steps} to 1 for very large grid ({grid_size}×{grid_size})")
        steps = 1  # Force one step at a time for very large grids
    elif is_large_grid and steps > 3:
        logger.info(
            f"Reducing steps from {steps} to 3 for large grid ({grid_size}×{grid_size})")
        steps = min(steps, 3)

    # Calculate appropriate timeout based on grid size
    step_timeout = 30  # Default 30 seconds
    if is_very_large_grid:
        step_timeout = 180  # 3 minutes for very large grids
    elif is_large_grid:
        step_timeout = 120  # 2 minutes for large grids

    logger.info(
        f"Using timeout of {step_timeout} seconds for grid size {grid_size}")

    # Run the specified number of steps
    steps_actually_run = 0
    try:
        for i in range(steps):
            if sim_data["current_step"] < sim_data["total_steps"]:
                logger.info(
                    f"Running step {sim_data['current_step'] + 1} of {sim_data['total_steps']}")

                # For large grids, run the step in a separate thread with a timeout
                if is_large_grid:
                    try:
                        # Run the CPU-intensive step in a thread pool with adjustable timeout
                        loop = asyncio.get_event_loop()

                        # Create a task for the step execution
                        step_task = asyncio.create_task(
                            loop.run_in_executor(None, simulation.step)
                        )

                        # Wait for step to complete with timeout
                        await asyncio.wait_for(step_task, timeout=step_timeout)
                        logger.info(f"Large grid step completed successfully")
                    except asyncio.TimeoutError:
                        logger.error(
                            f"Step timed out after {step_timeout} seconds")
                        raise HTTPException(
                            status_code=504,
                            detail=f"Step timed out. The grid size {grid_size}×{grid_size} is too large to process within the time limit."
                        )
                else:
                    # For smaller grids, run normally
                    simulation.step()

                # Continue with the rest of the step logic...
                steps_actually_run += 1
                sim_data["current_step"] += 1

                # Check if we've reached the total steps
                if sim_data["current_step"] >= sim_data["total_steps"]:
                    sim_data["status"] = "completed"
                    logger.info("Simulation completed")
                    break
    except HTTPException:
        # Re-raise HTTP exceptions with proper status codes
        raise
    except Exception as e:
        logger.exception(f"Error during simulation step: {str(e)}")
        sim_data["status"] = "error"
        raise HTTPException(
            status_code=500,
            detail=f"Error executing simulation step: {str(e)}"
        )

    # Check if simulation is complete
    if sim_data["current_step"] >= sim_data["total_steps"]:
        sim_data["status"] = "completed"
        logger.info("Simulation marked as completed")

    # Get final statistics
    try:
        statistics = simulation.get_statistics()
        logger.info(f"Final statistics after steps: {statistics}")
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        statistics = {
            'predator_count': 0,
            'prey_count': 0,
            'substrate_count': 0,
            'empty_count': 0
        }

    # Create response
    response = {
        "simulation_id": simulation_id,
        "status": sim_data["status"],
        "current_step": sim_data["current_step"],
        "total_steps": sim_data["total_steps"],
        "grid": simulation.grid.tolist(),
        "statistics": statistics,
        "steps_run": steps_actually_run
    }
    logger.info(
        f"Returning response with current_step={response['current_step']}, status={response['status']}, steps_run={steps_actually_run}")
    return response


@app.websocket("/ws/simulate/{simulation_id}")
async def websocket_endpoint(websocket: WebSocket, simulation_id: str):
    """WebSocket endpoint for real-time simulation updates."""
    await websocket.accept()
    active_connections.append(websocket)
    logger.info(
        f"WebSocket connection established for simulation {simulation_id}")

    try:
        if simulation_id not in active_simulations:
            logger.error(f"WebSocket: Simulation {simulation_id} not found")
            await websocket.send_json({"error": "Simulation not found"})
            await websocket.close()
            return

        sim_data = active_simulations[simulation_id]
        simulation = sim_data["simulation"]

        # Send initial state
        logger.info(
            f"WebSocket: Sending initial state for simulation {simulation_id}")
        await websocket.send_json({
            "simulation_id": simulation_id,
            "status": sim_data["status"],
            "current_step": sim_data["current_step"],
            "total_steps": sim_data["total_steps"],
            "grid": simulation.grid.tolist(),
            "statistics": simulation.get_statistics()
        })

        # Listen for commands from the client
        while True:
            data = await websocket.receive_text()
            logger.info(f"WebSocket: Received command: {data}")

            try:
                command = json.loads(data)
                action = command.get("action", "")

                if action == "ping":
                    # Simple ping response to check connection
                    logger.info("WebSocket: Received ping, sending pong")
                    await websocket.send_json({
                        "pong": True,
                        "timestamp": datetime.now().isoformat()
                    })

                elif action == "step":
                    steps = command.get("steps", 1)
                    logger.info(
                        f"WebSocket: Running {steps} steps for simulation {simulation_id}")

                    for i in range(steps):
                        if sim_data["current_step"] < sim_data["total_steps"]:
                            logger.info(
                                f"WebSocket: Running step {sim_data['current_step'] + 1}")
                            simulation.step()
                            sim_data["current_step"] += 1
                            logger.info(
                                f"WebSocket: Step completed, new step count: {sim_data['current_step']}")
                        else:
                            sim_data["status"] = "completed"
                            logger.info(
                                "WebSocket: Simulation already completed, no more steps to run")
                            break

                    # Check if simulation is complete
                    if sim_data["current_step"] >= sim_data["total_steps"]:
                        sim_data["status"] = "completed"
                        logger.info(
                            "WebSocket: Simulation marked as completed")

                    response = {
                        "simulation_id": simulation_id,
                        "status": sim_data["status"],
                        "current_step": sim_data["current_step"],
                        "total_steps": sim_data["total_steps"],
                        "grid": simulation.grid.tolist(),
                        "statistics": simulation.get_statistics()
                    }
                    logger.info(
                        f"WebSocket: Sending step response with current_step={response['current_step']}")
                    await websocket.send_json(response)

                elif action == "stop":
                    logger.info(
                        f"WebSocket: Stopping simulation {simulation_id}")
                    sim_data["status"] = "stopped"
                    await websocket.send_json({
                        "simulation_id": simulation_id,
                        "status": sim_data["status"],
                        "message": "Simulation stopped"
                    })

                elif action == "reset":
                    logger.info(
                        f"WebSocket: Resetting simulation {simulation_id}")
                    # Reset the simulation
                    grid = initialize_grid(
                        sim_data["settings"].grid_size,
                        sim_data["settings"].initial_prey,
                        sim_data["settings"].initial_predators,
                        sim_data["settings"].initial_substrate_probability
                    )
                    simulation = Simulation(grid, sim_data["settings"].dict())

                    sim_data["simulation"] = simulation
                    sim_data["current_step"] = 0
                    sim_data["status"] = "running"

                    await websocket.send_json({
                        "simulation_id": simulation_id,
                        "status": sim_data["status"],
                        "current_step": sim_data["current_step"],
                        "total_steps": sim_data["total_steps"],
                        "grid": simulation.grid.tolist(),
                        "statistics": simulation.get_statistics()
                    })
                    logger.info(
                        f"WebSocket: Simulation {simulation_id} reset complete")

                else:
                    logger.warning(
                        f"WebSocket: Unknown action received: {action}")
                    await websocket.send_json({
                        "error": f"Unknown action: {action}"
                    })

            except json.JSONDecodeError:
                logger.error(f"WebSocket: Invalid JSON received: {data}")
                await websocket.send_json({
                    "error": "Invalid command format"
                })
            except Exception as e:
                logger.exception(
                    f"WebSocket: Error processing command: {str(e)}")
                await websocket.send_json({
                    "error": f"Error processing command: {str(e)}"
                })

    except WebSocketDisconnect:
        logger.info(
            f"WebSocket: Client disconnected from simulation {simulation_id}")
        active_connections.remove(websocket)
    except Exception as e:
        logger.exception(f"WebSocket: Unexpected error: {str(e)}")
        if websocket in active_connections:
            active_connections.remove(websocket)


@app.get("/api/settings")
async def get_settings():
    """Get all saved simulation settings."""
    db = DatabaseHandler()
    settings = db.get_all_settings()
    return {"settings": settings}


@app.post("/api/settings")
async def save_settings(settings: UserSettings):
    """Save user settings to the database."""
    db = DatabaseHandler()
    settings_id = db.save_settings(settings.dict())
    return {"settings_id": settings_id, "message": "Settings saved successfully"}


@app.get("/api/settings/{settings_id}")
async def get_settings_by_id(settings_id: int):
    """Get specific settings by ID."""
    db = DatabaseHandler()
    settings = db.get_settings_by_id(settings_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return {"settings": settings}


@app.post("/api/simulate/{simulation_id}/save-recording")
async def save_simulation_recording(simulation_id: str):
    """Save the recording for a completed simulation to disk."""
    if simulation_id not in active_simulations:
        logger.error(f"Simulation {simulation_id} not found")
        raise HTTPException(status_code=404, detail="Simulation not found")

    sim_data = active_simulations[simulation_id]
    simulation = sim_data["simulation"]

    # Check if recording is enabled for this simulation
    if not hasattr(simulation, 'recording_enabled') or not simulation.recording_enabled:
        logger.warning(f"Recording not enabled for simulation {simulation_id}")
        return {"status": "error", "message": "Recording not enabled for this simulation"}

    # Save the recording
    result = simulation.save_recording(simulation_id)
    logger.info(f"Recording save result: {result}")

    return result


@app.get("/api/recordings")
async def list_recordings():
    """List all available recordings."""
    recordings = Simulation.get_available_recordings()
    return {"recordings": recordings, "count": len(recordings)}


@app.get("/api/recordings/{recording_id}")
async def get_recording(recording_id: str):
    """Get a specific recording by ID."""
    recording = Simulation.load_recording(recording_id)
    if recording["status"] == "error":
        raise HTTPException(status_code=404, detail=recording["message"])
    return recording


@app.delete("/api/recordings/{recording_id}")
async def delete_recording(recording_id: str):
    """Delete a recording."""
    try:
        path = os.path.join(os.path.dirname(__file__), '..', 'recordings')

        # Check if files exist
        metadata_file = os.path.join(path, f"{recording_id}_metadata.json")
        frames_file = os.path.join(path, f"{recording_id}_frames.json")

        files_deleted = 0

        if os.path.exists(metadata_file):
            os.remove(metadata_file)
            files_deleted += 1

        if os.path.exists(frames_file):
            os.remove(frames_file)
            files_deleted += 1

        if files_deleted > 0:
            return {"status": "success", "message": f"Recording {recording_id} deleted", "files_deleted": files_deleted}
        else:
            return {"status": "error", "message": f"Recording {recording_id} not found"}

    except Exception as e:
        logger.exception(f"Error deleting recording {recording_id}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error deleting recording: {str(e)}")

# Run the application with Uvicorn if executed directly
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
