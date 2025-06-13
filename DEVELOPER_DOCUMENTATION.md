# Developer Documentation

## Overview

This document provides technical details for developers working on the modCA_7 web application. The application is a web-based implementation of a modified Cellular Automata simulation featuring predator-prey dynamics and substrate interactions.

## Architecture

### Backend (FastAPI)

The backend is built with FastAPI and provides:
- RESTful API endpoints for simulation control
- WebSocket support for real-time updates
- Grid initialization and management
- Simulation state tracking
- Parameter validation

### Frontend (Next.js)

The frontend is built with Next.js and provides:
- Interactive grid visualization
- Real-time statistics display
- Parameter configuration interface
- WebSocket-based live updates

## Grid Implementation

### Grid Size

- Maximum grid size: 100x100 cells
- Grid is implemented as a 2D NumPy array
- Each cell can be in one of four states:
  - EMPTY (0)
  - PREY (1)
  - PREDATOR (2)
  - SUBSTRATE (3)

### Grid Operations

1. **Initialization**:
   ```python
   def initialize_grid(size: int, initial_prey: int, initial_predators: int, initial_substrate_prob: float) -> Tuple[np.ndarray, Dict]:
       """
       Initialize a grid with the specified parameters.
       
       Args:
           size: Grid size (1-100)
           initial_prey: Number of initial prey
           initial_predators: Number of initial predators
           initial_substrate_prob: Probability of substrate in empty cells
           
       Returns:
           Tuple of (grid, adjustment_info)
       """
   ```

2. **State Updates**:
   - Synchronous updates for all cells
   - Neighborhood-based rules
   - Probabilistic state transitions

## API Endpoints

### REST Endpoints

1. **Start Simulation**:
   ```http
   POST /api/simulate
   Content-Type: application/json
   
   {
     "grid_size": 50,
     "steps": 1000,
     "initial_prey": 100,
     "initial_predators": 20,
     "initial_substrate_probability": 0.3
   }
   ```

2. **Step Simulation**:
   ```http
   POST /api/simulate/{simulation_id}/step
   ```

3. **Get Simulation State**:
   ```http
   GET /api/simulate/{simulation_id}
   ```

4. **Stop Simulation**:
   ```http
   DELETE /api/simulate/{simulation_id}
   ```

### WebSocket Endpoints

1. **Connect**:
   ```javascript
   const ws = new WebSocket(`ws://localhost:8000/ws/simulate/${simulationId}`);
   ```

2. **Commands**:
   - `"ping"`: Check connection
   - `"step"`: Run one simulation step
   - `"reset"`: Reset simulation to initial state

## Data Models

### SimulationSettings

```python
class SimulationSettings(BaseModel):
    grid_size: int = Field(ge=1, le=100)
    steps: int = Field(ge=1)
    initial_prey: int = Field(ge=0)
    initial_predators: int = Field(ge=0)
    initial_substrate_probability: float = Field(ge=0.0, le=1.0)
```

### SimulationResponse

```python
class SimulationResponse(BaseModel):
    simulation_id: str
    status: str
    current_step: int
    total_steps: int
    grid: List[List[int]]
    statistics: Dict[str, int]
    message: str
    steps_run: int
    db_save_success: bool
```

## Development Setup

1. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

3. **Running Development Servers**:
   ```bash
   # Terminal 1 (Backend)
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   
   # Terminal 2 (Frontend)
   cd frontend
   npm run dev
   ```

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Deployment

1. **Backend Deployment**:
   - Build Docker image
   - Deploy to server
   - Configure Nginx

2. **Frontend Deployment**:
   - Build Next.js application
   - Deploy to Vercel or similar platform

## VPS Access & Deployment

### SSH Access
- SSH access is configured for the `modca` user
- Connection command: `ssh -i ~/.ssh/modca_vps modca@135.181.111.66`
- SSH key requirements:
  - Key file: `~/.ssh/modca_vps`
  - Permissions: 600 (`chmod 600 ~/.ssh/modca_vps`)
  - Key type: RSA

### VPS Deployment Process
1. **Connect to VPS**:
   ```bash
   ssh -i ~/.ssh/modca_vps modca@135.181.111.66
   cd /home/modca/modca_7web
   ```

2. **Update Code**:
   ```bash
   git fetch origin
   git checkout vps-deploy
   git pull origin prod --no-ff
   ```

3. **Restart Services**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. **Verify Deployment**:
   ```bash
   docker-compose ps
   curl https://ws.janis7ewski.org/health
   ```

### Troubleshooting VPS Access
1. **SSH Issues**:
   - Verify key permissions: `chmod 600 ~/.ssh/modca_vps`
   - Check key presence: `ls -l ~/.ssh/modca_vps`
   - Test connection: `ssh -v -i ~/.ssh/modca_vps modca@135.181.111.66`

2. **Deployment Issues**:
   - Check container logs: `docker-compose logs`
   - Verify Nginx config: `nginx -t`
   - Check SSL certificates: `certbot certificates`

## Performance Considerations

1. **Grid Size**:
   - Maximum size: 100x100
   - Larger grids may impact performance

2. **Simulation Steps**:
   - Consider step size for real-time updates
   - WebSocket updates may be throttled for large grids

3. **Memory Usage**:
   - Grid data is stored in memory
   - Consider cleanup of completed simulations

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests
4. Submit pull request

## Code Style

- Python: Follow PEP 8
- JavaScript/TypeScript: Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic

## Troubleshooting

### Common Issues

1. **Grid Initialization Failures**:
   - Check grid size limits
   - Verify entity counts

2. **WebSocket Connection Issues**:
   - Check server status
   - Verify connection URL

3. **Performance Issues**:
   - Monitor grid size
   - Check step frequency

## Future Improvements

1. **Planned Features**:
   - Additional visualization options
   - Enhanced statistics
   - More configuration options

2. **Technical Improvements**:
   - Performance optimizations
   - Better error handling
   - Enhanced testing coverage