"""
Data models for the modca_o7 web application.
Defines the Pydantic models for API requests and responses.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime


class SimulationSettings(BaseModel):
    """Settings for a simulation."""
    grid_size: int = Field(
        default=100, ge=1, le=400, description="Size of the square grid (NxN), max 400")
    steps: int = Field(
        default=100, description="Number of simulation iterations")
    neighborhood_type: str = Field(
        default="von_neumann", description="Neighborhood type ('von_neumann' or 'moore')")
    grid_type: str = Field(
        default="torus", description="Grid boundary behavior ('finite' or 'torus')")

    # Add recording flag
    record_simulation: bool = Field(
        default=False, description="Whether to record the simulation for playback")

    # Predator parameters
    predator_death_probability: float = Field(
        default=0.05, description="Probability of predator dying")
    predator_birth_probability: float = Field(
        default=0.33, description="Chance of predator reproduction")
    initial_predators: int = Field(
        default=3, description="Starting number of predators")
    predator_starvation_steps: int = Field(
        default=10, description="Steps a predator can survive without food")

    # Prey parameters
    prey_hunted_probability: float = Field(
        default=0.7, description="Probability that a prey is hunted")
    prey_random_death: float = Field(
        default=0.01, description="Probability of prey dying randomly")
    initial_prey: int = Field(
        default=2000, description="Starting number of prey")
    prey_birth_probability: float = Field(
        default=0.7, description="Probability of prey reproduction")
    prey_starvation_steps: int = Field(
        default=3, description="Steps a prey can survive without substrate")

    # Substrate parameters
    initial_substrate_probability: float = Field(
        default=0.25, description="Probability of substrate formation")
    substrate_random_death: float = Field(
        default=0.03, description="Probability of substrate disappearing")
    substrate_consumption_prob: float = Field(
        default=0.6, description="Probability of substrate being consumed by prey")

    @field_validator('neighborhood_type')
    @classmethod
    def validate_neighborhood_type(cls, v):
        if v not in ['von_neumann', 'moore']:
            raise ValueError(
                'neighborhood_type must be either "von_neumann" or "moore"')
        return v

    @field_validator('initial_predators', 'initial_prey')
    @classmethod
    def validate_entity_counts(cls, v: int, values: Dict[str, Any]) -> int:
        if 'grid_size' in values.data:
            total_cells = values.data['grid_size'] * values.data['grid_size']
            total_entities = (values.data.get('initial_predators', 0) if 'initial_predators' not in values.data else values.data['initial_predators']) + \
                (values.data.get('initial_prey', 0)
                 if 'initial_prey' not in values.data else values.data['initial_prey'])
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
