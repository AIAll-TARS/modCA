# modCA_7web

A sophisticated web-based cellular automata simulation platform for modeling predator-prey-substrate ecosystem dynamics. This project implements advanced cellular automata concepts, drawing inspiration from the research paper ["Cellular Automata as the Basis of Fast and Reliable Material Models"](http://www.ptmts.org.pl/2004-3-burzynski-in.pdf) by T. Burzyński, W. Kuś.

## Overview

modCA_7web provides an interactive environment for exploring complex ecosystem dynamics through cellular automata simulations. While the frontend interface is intentionally minimalistic, the underlying simulation engine is powerful and sophisticated, similar in concept to advanced cellular automata platforms like [Golly](https://golly.sourceforge.io/), though focused specifically on predator-prey-substrate interactions.

## Key Features

- Real-time simulation of predator-prey-substrate interactions
- Interactive grid-based visualization
- Customizable simulation parameters
- Live statistics and population tracking
- Save/load simulation states
- WebSocket-based real-time updates

## Simulation Model

The simulation implements a three-component ecosystem model:

1. **Predators**:
   - Can move to adjacent cells
   - Consume prey with probability P(hunt)
   - Die with probability P(predator_death)
   - Reproduce with probability P(predator_birth) when energy sufficient

2. **Prey**:
   - Can move to adjacent cells
   - Consume substrate with probability P(substrate_consumption)
   - Die from predation or natural causes
   - Reproduce with probability P(prey_birth) when energy sufficient

3. **Substrate**:
   - Static resource
   - Appears with probability P(substrate_formation)
   - Disappears with probability P(substrate_death)
   - Can be consumed by prey

## Adjustable Parameters

The simulation provides extensive customization through the following parameters:

### Grid Configuration
- `grid_size`: Size of the square grid (NxN, max 400)
- `steps`: Number of simulation iterations
- `neighborhood_type`: Cell neighborhood type ('von_neumann' or 'moore')
- `grid_type`: Grid boundary behavior ('finite' or 'torus')
- `record_simulation`: Option to record simulation for playback

### Predator Parameters
- `predator_death_probability`: Probability of predator dying (default: 0.05)
- `predator_birth_probability`: Chance of predator reproduction (default: 0.33)
- `initial_predators`: Starting number of predators (default: 3)
- `predator_starvation_steps`: Steps a predator can survive without food (default: 10)

### Prey Parameters
- `prey_hunted_probability`: Probability that a prey is hunted (default: 0.7)
- `prey_random_death`: Probability of prey dying randomly (default: 0.01)
- `initial_prey`: Starting number of prey (default: 2000)
- `prey_birth_probability`: Probability of prey reproduction (default: 0.7)
- `prey_starvation_steps`: Steps a prey can survive without substrate (default: 3)

### Substrate Parameters
- `initial_substrate_probability`: Probability of substrate formation (default: 0.25)
- `substrate_random_death`: Probability of substrate disappearing (default: 0.03)
- `substrate_consumption_prob`: Probability of substrate being consumed by prey (default: 0.6)

### Neighborhood Types
- **Von Neumann**: Four adjacent cells (North, South, East, West)
- **Moore**: Eight adjacent cells (including diagonals)

### Grid Types
- **Torus**: Wraps around at edges (like a donut surface)
- **Finite**: Fixed boundaries with no wraparound

## Grid Implementation

The simulation uses a 2D grid where each cell can be in one of four states:
- `EMPTY`: Empty cell (0)
- `PREY`: Contains prey (1)
- `PREDATOR`: Contains predator (2)
- `SUBSTRATE`: Contains substrate (3)

### Grid Initialization

The grid is initialized with the following process:
1. Creates an empty grid of specified size
2. Places predators randomly
3. Places prey randomly in remaining empty cells
4. Distributes substrate according to probability in remaining cells

### Grid Behavior

#### Cell States
- Each cell contains exactly one state (empty, prey, predator, or substrate)
- States are updated synchronously during simulation steps
- Cell transitions follow probabilistic rules defined in parameters

#### Neighborhood Types
1. **Von Neumann Neighborhood**
   ```
      N
    W + E
      S
   ```
   - Four adjacent cells (North, South, East, West)
   - Used for basic movement and interactions

2. **Moore Neighborhood**
   ```
   NW N NE
   W  +  E
   SW S SE
   ```
   - Eight adjacent cells (including diagonals)
   - Provides more interaction possibilities

#### Grid Types
1. **Torus (Default)**
   - Grid wraps around at edges (like a donut surface)
   - Entities can move from one edge to the opposite edge
   - Example for a 5x5 grid:
     ```
     Coordinates wrap around:
     (0,4) (0,0) (0,1)    Top edge connects to bottom
     (4,0) (0,0) (1,0)    Left edge connects to right
     ```
   - Benefits:
     - No edge effects
     - Continuous movement space
     - Equal opportunities for all cells
     - Better for studying pure interaction patterns

2. **Finite**
   - Fixed boundaries with no wraparound
   - Entities cannot move beyond edges
   - Example for a 5x5 grid:
     ```
     Edge cells have fewer neighbors:
     Corner (0,0) has 2 neighbors in von Neumann
     Edge (0,1) has 3 neighbors in von Neumann
     Center has all neighbors
     ```
   - Benefits:
     - More realistic for bounded environments
     - Creates natural barriers and territories
     - Can study edge effects and boundary behaviors
     - Suitable for modeling confined spaces

### Grid Movement Rules

#### In Torus Mode
- Entity at position (x, y) can move to:
  - x = (current_x ± 1) % grid_size
  - y = (current_y ± 1) % grid_size
- No movement restrictions at edges
- Maintains constant neighborhood size for all cells

#### In Finite Mode
- Entity at position (x, y) can move to:
  - x = current_x ± 1 (if within bounds)
  - y = current_y ± 1 (if within bounds)
- Movement blocked at edges
- Edge cells have fewer neighbors:
  - Corner cells: 2 neighbors (von Neumann) or 3 neighbors (Moore)
  - Edge cells: 3 neighbors (von Neumann) or 5 neighbors (Moore)
  - Interior cells: 4 neighbors (von Neumann) or 8 neighbors (Moore)

### Memory Management
- For large grids (≥800×800), automatic optimizations are applied:
  - Entity density is limited to prevent memory issues
  - Substrate probability is capped at 0.2
  - Total entities are limited to 30-40% of grid size
- For regular grids, entities are limited to 80% of total cells

## Technology Stack

### Backend
- **Python 3.8+**: Core programming language
- **FastAPI**: High-performance web framework
- **Uvicorn**: ASGI server
- **NumPy**: Efficient numerical operations
- **SQLite**: Local database
- **WebSockets**: Real-time communication

### Frontend
- **Next.js**: React framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first styling
- **Chart.js**: Data visualization
- **WebSocket API**: Real-time updates

## Quick Start

### Prerequisites
- Windows operating system
- Python 3.8+
- Node.js 16+
- Chrome web browser

### Installation & Running

**Option 1: One-Click Start**
1. Double-click `start_app.bat`
2. Wait for servers to start and Chrome to open
3. Access at http://localhost:3000

**Option 2: Desktop Shortcut**
1. Run `create_desktop_shortcut.bat`
2. Use the created "modCA_7web" desktop shortcut

### Manual Setup
1. Set up backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Set up frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Stopping the Application
- Press any key in the console window
- Or close all command prompt windows

## Development

For detailed development information, please refer to:
- [Developer Documentation](DEVELOPER_DOCUMENTATION.md)
- [Quick Start Guide](QUICK_START.md)

## Theoretical Background

This implementation is inspired by cellular automata research in material modeling, particularly the work presented in ["Cellular Automata as the Basis of Fast and Reliable Material Models"](http://www.ptmts.org.pl/2004-3-burzynski-in.pdf). While the original paper focuses on material science applications, we've adapted these concepts to ecological modeling.

Key concepts adapted from the paper:
- Discrete state transitions
- Neighborhood-based interaction rules
- Probabilistic state changes
- Multi-state cell representation

The project shares some conceptual similarities with [Golly](https://golly.sourceforge.io/), a sophisticated cellular automata simulator. While Golly offers a broader range of cellular automata patterns and rules with an extensive feature set, modCA_7web specializes in predator-prey-substrate dynamics with a focus on ecological modeling.

## Project Structure

```
modca_7web/
├── backend/                    # Backend server
│   ├── app/                    # Application code
│   ├── venv/                   # Virtual environment
│   └── requirements.txt        # Python dependencies
├── frontend/                   # Frontend application
│   ├── src/                    # Source code
│   └── [config files]         # Configuration files
└── [utility scripts]          # Startup and maintenance scripts
```

## Cleanup

To remove temporary files and clean the project directory:
```bash
cleanup.bat
```

## Troubleshooting

If you encounter issues:

### Backend Issues
- Verify Python and Node.js installations
- Check ports 3000 (frontend) and 8000 (backend) availability
- Ensure database file exists and has proper permissions
- Check server logs for errors

### Frontend Issues
- Verify backend server is running
- Check WebSocket connection
- Clear browser cache if needed

### Manual Startup
- Backend: `cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Frontend: `cd frontend && npm run dev`

For more detailed troubleshooting, refer to the [Developer Documentation](DEVELOPER_DOCUMENTATION.md). 