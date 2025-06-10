"""
Data models for the modca_o7 web application.
Defines the Pydantic models for API requests and responses.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from .constants import (
    GRID_SIZE, STEPS, NEIGHBORHOOD_TYPE, GRID_TYPE,
    PREDATOR_DEATH_PROBABILITY, PREDATOR_BIRTH_PROBABILITY, INITIAL_PREDATORS, PREDATOR_STARVATION_STEPS,
    PREY_HUNTED_PROBABILITY, PREY_RANDOM_DEATH, INITIAL_PREY, PREY_BIRTH_PROBABILITY, PREY_STARVATION_STEPS, PREY_THREAT_RESPONSE,
    INITIAL_SUBSTRATE_PROBABILITY, SUBSTRATE_RANDOM_DEATH, SUBSTRATE_CONSUMPTION_PROB
)


class SimulationSettings(BaseModel):
    """Settings for a simulation."""
    grid_size: int = Field(
        default=GRID_SIZE, ge=1, le=400, description="Size of the square grid (NxN), max 400")
    steps: int = Field(
        default=STEPS, description="Number of simulation iterations")
    neighborhood_type: str = Field(
        default=NEIGHBORHOOD_TYPE, description="Neighborhood type ('von_neumann' or 'moore')")
    grid_type: str = Field(
        default=GRID_TYPE, description="Grid boundary behavior ('finite' or 'torus')")

    # Add recording flag
    record_simulation: bool = Field(
        default=False, description="Whether to record the simulation for playback")

    # Predator parameters
    predator_death_probability: float = Field(
        default=PREDATOR_DEATH_PROBABILITY, description="Probability of predator dying")
    predator_birth_probability: float = Field(
        default=PREDATOR_BIRTH_PROBABILITY, description="Chance of predator reproduction")
    initial_predators: int = Field(
        default=INITIAL_PREDATORS, description="Starting number of predators")
    predator_starvation_steps: int = Field(
        default=PREDATOR_STARVATION_STEPS, description="Steps a predator can survive without food")

    # Prey parameters
    prey_hunted_probability: float = Field(
        default=PREY_HUNTED_PROBABILITY, description="Probability that a prey is hunted")
    prey_random_death: float = Field(
        default=PREY_RANDOM_DEATH, description="Probability of prey dying randomly")
    initial_prey: int = Field(
        default=INITIAL_PREY, description="Starting number of prey")
    prey_birth_probability: float = Field(
        default=PREY_BIRTH_PROBABILITY, description="Probability of prey reproduction")
    prey_starvation_steps: int = Field(
        default=PREY_STARVATION_STEPS, description="Steps a prey can survive without substrate")
    prey_threat_response: float = Field(
        default=PREY_THREAT_RESPONSE, description="Probability of prey staying still when threatened")

    # Substrate parameters
    initial_substrate_probability: float = Field(
        default=INITIAL_SUBSTRATE_PROBABILITY, description="Probability of substrate formation")
    substrate_random_death: float = Field(
        default=SUBSTRATE_RANDOM_DEATH, description="Probability of substrate disappearing")
    substrate_consumption_prob: float = Field(
        default=SUBSTRATE_CONSUMPTION_PROB, description="Probability of substrate being consumed by prey")

    @validator('neighborhood_type')
    @classmethod
    def validate_neighborhood_type(cls, v):
        if v not in ['von_neumann', 'moore']:
            raise ValueError(
                'neighborhood_type must be either "von_neumann" or "moore"')
        return v

    @validator('initial_predators', 'initial_prey')
    @classmethod
    def validate_entity_counts(cls, v: int, values: Dict[str, Any]) -> int:
        if 'grid_size' in values:
            total_cells = values['grid_size'] * values['grid_size']
            total_entities = (values.get('initial_predators', 0) if 'initial_predators' not in values else values['initial_predators']) + \
                (values.get('initial_prey', 0)
                 if 'initial_prey' not in values else values['initial_prey'])
            if total_entities > total_cells:
                raise ValueError(
                    f"Total number of predators and prey ({total_entities}) cannot exceed the total number of cells ({total_cells})")
        return v


class SimulationStatistics(BaseModel):
    """Statistics for a simulation."""
    predator_count: int
    prey_count: int
    substrate_count: int
    empty_count: Optional[int] = 0
    predator_percentage: Optional[float] = 0.0
    prey_percentage: Optional[float] = 0.0
    substrate_percentage: Optional[float] = 0.0
    empty_percentage: Optional[float] = 0.0


class SimulationResponse(BaseModel):
    """Response for simulation operations."""
    simulation_id: str
    status: str
    current_step: int
    total_steps: int
    grid: List[List[int]] = []
    statistics: Union[SimulationStatistics, Dict[str, Any]] = {}
    message: Optional[str] = None
    steps_run: Optional[int] = None
    db_save_success: Optional[bool] = None
    adjustment_info: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {"values_adjusted": False},
        description="Information about any adjustments made to the simulation parameters"
    )


class UserSettings(SimulationSettings):
    """User-specific settings that extend the base simulation settings."""
    user_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None


class WebSocketCommand(BaseModel):
    """Command sent over WebSocket."""
    action: str
    steps: Optional[int] = 1
    parameters: Optional[Dict[str, Any]] = None


# Add new models for recording functionality
class RecordingFrame(BaseModel):
    """A single frame in a recording."""
    grid: List[List[int]]
    step: int
    statistics: Dict[str, Any]
    timestamp: str


class RecordingMetadata(BaseModel):
    """Metadata about a recording."""
    simulation_id: str
    created_at: str
    grid_size: int
    frame_count: int
    parameters: Dict[str, Any]
    final_statistics: Dict[str, Any]


class RecordingListItem(BaseModel):
    """Item in the list of available recordings."""
    simulation_id: str
    created_at: str
    grid_size: int
    frame_count: int
    parameters: Dict[str, Any]
    final_statistics: Dict[str, Any]


class RecordingResponse(BaseModel):
    """Response containing recording data."""
    status: str
    metadata: Optional[RecordingMetadata] = None
    frames: Optional[List[RecordingFrame]] = None
    message: Optional[str] = None
