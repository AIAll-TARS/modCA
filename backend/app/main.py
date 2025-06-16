"""
Main FastAPI application module for the modca_o7 web application.
Handles API endpoints and WebSocket connections.
"""

import asyncio
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from .models import SimulationSettings, SimulationResponse
from .grid import initialize_grid
from .simulation import Simulation
from .constants import GRID_SIZE, STEPS, INITIAL_PREY, INITIAL_PREDATORS
from .db_handler import DatabaseHandler
from typing import Optional, Dict, Any

# Set up logging
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="modCA_7 Web API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active simulations
active_simulations: Dict[str, Dict[str, Any]] = {}

# Initialize DatabaseHandler
db_handler = DatabaseHandler()

# Helper functions for async operations
async def initialize_grid_with_timeout(size: int, initial_prey: int, initial_predators: int, initial_substrate_prob: float):
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

# Dependency for database operations
async def get_db():
    try:
        return db_handler
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=503, detail="Database service unavailable")

@app.get("/")
async def root():
    """Root endpoint to check if API is running."""
    return {"message": "modCA_7 Web API is running"}

@app.post("/api/simulate", response_model=SimulationResponse)
async def start_simulation(settings: SimulationSettings, db: DatabaseHandler = Depends(get_db)):
    """Start a new simulation with the provided settings."""
    try:
        logger.info(f"Starting new simulation with settings: {settings}")

        # Apply fallbacks for any missing or invalid values
        if settings.grid_size <= 0 or settings.grid_size > 100:
            logger.warning(
                f"Invalid grid_size: {settings.grid_size}, using default {GRID_SIZE}")
            settings.grid_size = GRID_SIZE
        if settings.steps <= 0:
            logger.warning(
                f"Invalid steps: {settings.steps}, using default {STEPS}")
            settings.steps = STEPS
        if settings.initial_prey < 0:
            logger.warning(
                f"Invalid initial_prey: {settings.initial_prey}, using default {INITIAL_PREY}")
            settings.initial_prey = INITIAL_PREY
        if settings.initial_predators < 0:
            logger.warning(
                f"Invalid initial_predators: {settings.initial_predators}, using default {INITIAL_PREDATORS}")
            settings.initial_predators = INITIAL_PREDATORS

        # Generate a unique simulation ID
        simulation_id = f"sim_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(active_simulations)}"
        logger.info(f"Generated simulation ID: {simulation_id}")

        # Initialize grid with more robust error handling
        try:
            logger.info(
                f"Initializing grid with size={settings.grid_size}, prey={settings.initial_prey}, predators={settings.initial_predators}, substrate_prob={settings.initial_substrate_probability}")

            # Set a timeout for grid initialization
            grid_initialization_timeout = 30  # 30 seconds timeout

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
        param_dict = {
            'grid_size': settings.grid_size,
            'steps': settings.steps,
            'neighborhood_type': settings.neighborhood_type,
            'grid_type': settings.grid_type,
            'predator_death_probability': settings.predator_death_probability,
            'predator_birth_probability': settings.predator_birth_probability,
            'initial_predators': settings.initial_predators,
            'predator_starvation_steps': settings.predator_starvation_steps,
            'prey_hunted_probability': settings.prey_hunted_probability,
            'prey_random_death': settings.prey_random_death,
            'initial_prey': settings.initial_prey,
            'prey_birth_probability': settings.prey_birth_probability,
            'prey_starvation_steps': settings.prey_starvation_steps,
            'prey_threat_response': settings.prey_threat_response,
            'initial_substrate_probability': settings.initial_substrate_probability,
            'substrate_random_death': settings.substrate_random_death,
            'substrate_consumption_prob': settings.substrate_consumption_prob
        }
        logger.info("Parameters dictionary created successfully")

        # Create the initial simulation object
        record_simulation = settings.record_simulation
        if record_simulation:
            logger.info("Recording enabled for this simulation")
            try:
                # Save initial settings to database
                db.save_simulation_settings(simulation_id, settings.dict())
            except Exception as e:
                logger.error(f"Failed to save initial settings to database: {str(e)}")
                # Continue with simulation even if database save fails

        # Create simulation object
        simulation = Simulation(grid, param_dict, record_simulation=record_simulation)
        logger.info("Simulation object created successfully")

        # Store simulation in active simulations
        active_simulations[simulation_id] = {
            "simulation": simulation,
            "current_step": 0,
            "total_steps": settings.steps,
            "status": "running"
        }
        logger.info(f"Simulation {simulation_id} stored in active simulations")

        # Return the initial state
        return SimulationResponse(
            simulation_id=simulation_id,
            status="running",
            current_step=0,
            total_steps=settings.steps,
            grid=grid.tolist(),
            statistics=simulation.get_statistics(),
            message="Simulation started successfully",
            steps_run=0,
            db_save_success=True,
            adjustment_info=adjustment_info
        )

    except Exception as e:
        logger.exception(f"Error in start_simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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

    # Run the specified number of steps
    steps_actually_run = 0
    try:
        for i in range(steps):
            if sim_data["current_step"] < sim_data["total_steps"]:
                logger.info(
                    f"Running step {sim_data['current_step'] + 1} of {sim_data['total_steps']}")

                # Run the step
                simulation.step()
                steps_actually_run += 1
                sim_data["current_step"] += 1

                # Check if we've reached the total steps
                if sim_data["current_step"] >= sim_data["total_steps"]:
                    sim_data["status"] = "completed"
                    logger.info("Simulation completed")
                    break

        # Return the updated state
        return SimulationResponse(
            simulation_id=simulation_id,
            status=sim_data["status"],
            current_step=sim_data["current_step"],
            total_steps=sim_data["total_steps"],
            grid=simulation.grid.tolist(),
            statistics=simulation.get_statistics(),
            message=f"Ran {steps_actually_run} steps successfully",
            steps_run=steps_actually_run,
            db_save_success=True
        )

    except Exception as e:
        logger.exception(f"Error in step_simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/simulate/{simulation_id}")
async def get_simulation(simulation_id: str):
    """Get the current state of a simulation."""
    if simulation_id not in active_simulations:
        raise HTTPException(status_code=404, detail="Simulation not found")

    sim_data = active_simulations[simulation_id]
    simulation = sim_data["simulation"]

    return SimulationResponse(
        simulation_id=simulation_id,
        status=sim_data["status"],
        current_step=sim_data["current_step"],
        total_steps=sim_data["total_steps"],
        grid=simulation.grid.tolist(),
        statistics=simulation.get_statistics(),
        message="Current simulation state",
        steps_run=0,
        db_save_success=True
    )

@app.delete("/api/simulate/{simulation_id}")
async def stop_simulation(simulation_id: str):
    """Stop and remove a simulation."""
    if simulation_id not in active_simulations:
        raise HTTPException(status_code=404, detail="Simulation not found")

    del active_simulations[simulation_id]
    return {"message": "Simulation stopped"}

@app.websocket("/ws/simulate/{simulation_id}")
async def websocket_endpoint(websocket: WebSocket, simulation_id: str):
    """WebSocket endpoint for real-time simulation updates."""
    try:
        await websocket.accept()
        logger.info(f"WebSocket connection accepted for simulation {simulation_id}")

        # Send initial connection success message
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "simulation_id": simulation_id
        })

        while True:
            try:
                # Wait for a message from the client
                data = await websocket.receive_text()
                logger.info(f"Received WebSocket message: {data}")

                # Check if simulation exists
                if simulation_id not in active_simulations:
                    await websocket.send_json({
                        "type": "error",
                        "error": "Simulation not found",
                        "status": "error"
                    })
                    break

                sim_data = active_simulations[simulation_id]
                simulation = sim_data["simulation"]

                # Handle different commands
                if data == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "status": "ok"
                    })
                elif data == "step":
                    try:
                        # Run one step
                        simulation.step()
                        sim_data["current_step"] += 1

                        # Check if simulation is complete
                        if sim_data["current_step"] >= sim_data["total_steps"]:
                            sim_data["status"] = "completed"

                        # Send updated state
                        await websocket.send_json({
                            "type": "update",
                            "status": sim_data["status"],
                            "current_step": sim_data["current_step"],
                            "total_steps": sim_data["total_steps"],
                            "grid": simulation.grid.tolist(),
                            "statistics": simulation.get_statistics()
                        })
                    except Exception as e:
                        logger.error(f"Error during simulation step: {str(e)}")
                        await websocket.send_json({
                            "type": "error",
                            "error": f"Step execution failed: {str(e)}",
                            "status": "error"
                        })
                elif data == "reset":
                    try:
                        # Reset simulation to initial state
                        simulation.reset()
                        sim_data["current_step"] = 0
                        sim_data["status"] = "running"

                        # Send reset confirmation
                        await websocket.send_json({
                            "type": "reset",
                            "status": "ok",
                            "current_step": 0,
                            "total_steps": sim_data["total_steps"],
                            "grid": simulation.grid.tolist(),
                            "statistics": simulation.get_statistics()
                        })
                    except Exception as e:
                        logger.error(f"Error during simulation reset: {str(e)}")
                        await websocket.send_json({
                            "type": "error",
                            "error": f"Reset failed: {str(e)}",
                            "status": "error"
                        })
                else:
                    await websocket.send_json({
                        "type": "error",
                        "error": "Unknown command",
                        "status": "error"
                    })

            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for simulation {simulation_id}")
                break
            except Exception as e:
                logger.exception(f"Error in WebSocket message handling: {str(e)}")
                try:
                    await websocket.send_json({
                        "type": "error",
                        "error": str(e),
                        "status": "error"
                    })
                except:
                    break

    except Exception as e:
        logger.exception(f"Error in WebSocket endpoint: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "error": str(e),
                "status": "error"
            })
        except:
            pass
    finally:
        # Clean up if needed
        logger.info(f"WebSocket connection closed for simulation {simulation_id}")

@app.get("/api/settings")
async def get_latest_settings(user_id: Optional[str] = None, db: DatabaseHandler = Depends(get_db)):
    """Get the latest simulation settings for a user."""
    try:
        settings = db.get_latest_settings(user_id)
        return {"settings": settings}
    except Exception as e:
        logger.error(f"Error fetching latest settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch settings")

@app.get("/api/health")
async def health_check():
    """Health check endpoint for container monitoring."""
    return {"status": "ok"}
