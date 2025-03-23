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
- Advanced hunger/starvation mechanics
- Complex reproduction and death rules
- Nutrient recycling through organism-to-substrate conversion
- Support for simulations up to 1,000,000 steps
- Real-time chart visualization of population dynamics

## Simulation Model

The simulation implements a three-component ecosystem model with interconnected lifecycles:

1. **Predators**:
   - Can move to adjacent cells
   - Consume prey with probability P(hunt)
   - Die with probability P(predator_death) and become substrate
   - Reproduce with probability P(predator_birth) when energy sufficient
   - Starve if they don't eat for predator_starvation_steps

2. **Prey**:
   - Can move to adjacent cells
   - Consume substrate with probability P(substrate_consumption)
   - Die from predation, natural causes (becoming substrate), or starvation
   - Reproduce through two mechanisms:
     1. After consuming substrate
     2. Spontaneously in empty cells with sufficient prey and substrate neighbors
   - Starve if they don't eat for prey_starvation_steps

3. **Substrate**:
   - Static resource that forms the foundation of the food chain
   - Appears with probability P(substrate_formation)
   - Disappears with probability P(substrate_death)
   - Can be consumed by prey
   - Forms from the remains of dead predators and prey, creating a nutrient cycle

### Ecosystem Cycles

The simulation features a complete ecological cycle:
1. **Resource Cycle**: Substrate → Prey → Predator
2. **Reproduction Cycle**: 
   - Predators reproduce when well-fed with prey nearby
   - Prey reproduce when well-fed with substrate nearby
3. **Decomposition Cycle**: 
   - Dead organisms (random death) → Substrate
   - Substrate → Empty space (random death)
4. **Hunger Cycle**:
   - Entities track time since last meal
   - Increasing hunger affects behavior and survival

## Adjustable Parameters

The simulation provides extensive customization through the following parameters:

### Grid Configuration
- `grid_size`: Size of the square grid (NxN, max 1000)
- `steps`: Number of simulation iterations (up to 1,000,000)
- `neighborhood_type`: Cell neighborhood type ('von_neumann' or 'moore')
- `grid_type`: Grid boundary behavior ('finite' or 'torus')
- `record_simulation`: Option to record simulation for playback

### Predator Parameters
- `predator_death_probability`: Probability of predator dying (default: 0.1)
- `predator_birth_probability`: Chance of predator reproduction (default: 0.3)
- `initial_predators`: Starting number of predators (default: 50)
- `predator_starvation_steps`: Steps a predator can survive without food (default: 10)
- `predator_movement_prob`: Probability of movement to empty cells (default: 0.5)
- `hunting_threshold`: Base threshold for hunting success (default: 0.6)

### Prey Parameters
- `prey_hunted_probability`: Probability that a prey is hunted (default: 0.2)
- `prey_random_death`: Probability of prey dying randomly (default: 0.05)
- `initial_prey`: Starting number of prey (default: 200)
- `prey_birth_probability`: Probability of prey reproduction (default: 0.2)
- `prey_starvation_steps`: Steps a prey can survive without substrate (default: 3)
- `prey_threat_response`: Probability of staying still when predator nearby (default: 0.7)

### Substrate Parameters
- `initial_substrate_probability`: Probability of substrate formation (default: 0.3)
- `substrate_random_death`: Probability of substrate disappearing (default: 0.05)
- `substrate_consumption_prob`: Probability of substrate being consumed by prey (default: 0.2)

### Neighborhood Types
- **Von Neumann**: Four adjacent cells (North, South, East, West)
- **Moore**: Eight adjacent cells (including diagonals)

### Grid Types
- **Torus**: Wraps around at edges (like a donut surface)
- **Finite**: Fixed boundaries with no wraparound

## Simulation Rules

### Reproduction Rules

1. **Predator Reproduction**:
   - Occurs in two ways:
     1. **After Hunting**: Predators can reproduce into neighboring empty cells after successfully hunting prey
     2. **Spontaneous**: Empty cells can become predators if they have:
        - 2 or more predator neighbors
        - At least 1 prey neighbor
        - Random chance below predator_birth_probability

2. **Prey Reproduction**:
   - Occurs in two ways:
     1. **After Feeding**: Prey can reproduce into neighboring empty cells after consuming substrate
     2. **Spontaneous**: Empty cells can become prey if they have:
        - 2 or more prey neighbors
        - At least 1 substrate neighbor
        - Random chance below prey_birth_probability

### Starvation Mechanics

1. **Predator Starvation**:
   - Predators track hunger level (steps since last meal)
   - Hunger increases by 1 each step without eating
   - Hunger resets to 0 after eating prey
   - When hunger reaches predator_starvation_steps, predator dies
   - Hungrier predators take more risks when hunting (higher success probability)

2. **Prey Starvation**:
   - Prey track hunger level (steps since last meal)
   - Hunger increases by 1 each step without eating
   - Hunger increases faster when predators are nearby (stress effect)
   - Hunger resets to 0 after eating substrate
   - When hunger reaches prey_starvation_steps, prey dies

### Death and Decomposition Rules

1. **Random Death**:
   - Predators die with probability predator_death_probability
   - Prey die with probability prey_random_death
   - **Nutrient Cycle**: When an organism dies randomly, it becomes substrate

2. **Starvation Death**:
   - Organisms die when their hunger reaches their starvation threshold
   - Starvation deaths result in empty cells (no substrate formation)

3. **Substrate Formation/Decay**:
   - Forms from dead organisms
   - Forms randomly in empty cells with low probability
   - Disappears randomly with probability substrate_random_death

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

## Visualization Features

### Grid Visualization
- Cells are colored according to their state:
  - Empty: Black
  - Prey: Yellow
  - Predator: Red
  - Substrate: Green
- Grid visualization adapts to different grid sizes:
  - Small grids (<=200): Full cell rendering
  - Large grids (>200): Optimized viewport rendering with zooming and panning
- Fullscreen mode for detailed observation

### Population Chart
- Real-time population tracking chart showing:
  - Predator population (red)
  - Prey population (yellow)
  - Substrate amount (green)
- Chart starts empty at step 0 and grows organically as simulation progresses
- Smooth line transitions provide visual continuity
- Supports visualizing long-running simulations (up to 1,000,000 steps)
- Population trends help identify stable states, cycles, or extinctions

### Statistics Panel
- Real-time statistics display:
  - Current populations counts and percentages
  - Starvation risk indicators
  - Adjustment notifications if parameters were auto-balanced
- Interactive timeline for analyzing population patterns

## Memory Management
- For large grids (≥800×800), automatic optimizations are applied:
  - Entity density is limited to prevent memory issues
  - Substrate probability is capped at 0.2
  - Total entities are limited to 30-40% of grid size
- For regular grids, entities are limited to 80% of total cells
- Batch processing for efficient memory use during simulation steps
- Adaptive recording techniques for large simulations:
  - Smaller grids: Complete grid states recorded
  - Larger grids: Only statistics recorded

## Technology Stack

### Backend
- **Python 3.8+**: Core programming language
- **FastAPI**: High-performance web framework
- **Uvicorn**: ASGI server
- **NumPy**: Efficient numerical operations for grid manipulation
- **SQLite**: Local database for saving simulation settings
- **WebSockets**: Real-time communication
- **Logging**: Comprehensive logging system for diagnostics

### Frontend
- **Next.js**: React framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first styling
- **Chart.js**: Data visualization for population trends
- **WebSocket API**: Real-time updates
- **React Hook Form**: Form handling with validation
- **Canvas API**: Efficient grid rendering

## Parameter Recommendations

### Balanced Ecosystem
- Predator death: 0.1
- Predator birth: 0.3
- Prey death: 0.05
- Prey birth: 0.2
- Initial ratio: 1:4:12 (predator:prey:substrate)
- Creates a stable ecosystem with natural population cycles

### Predator-Dominant
- Predator death: 0.05
- Predator birth: 0.4
- Prey hunted: 0.3
- Creates ecosystem dominated by predators

### Prey-Dominant
- Predator death: 0.2
- Prey birth: 0.4
- Substrate consumption: 0.3
- Creates ecosystem dominated by prey

### Substrate-Rich
- Substrate formation: 0.5
- Substrate death: 0.01
- Creates ecosystem with abundant resources

### Extreme Cycles
- High birth rates
- High death rates
- Low starvation thresholds
- Creates dramatic boom-bust population cycles

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
├── backend/                       # Backend server
│   ├── app/                       # Application code
│   │   ├── constants.py           # Simulation constants
│   │   ├── grid.py                # Grid implementation
│   │   ├── main.py                # FastAPI application
│   │   ├── simulation.py          # Simulation engine
│   │   └── routes/                # API endpoints
│   ├── venv/                      # Virtual environment
│   └── requirements.txt           # Python dependencies
├── frontend/                      # Frontend application
│   ├── src/                       # Source code
│   │   ├── components/            # React components
│   │   ├── constants.ts           # Frontend constants
│   │   ├── pages/                 # Next.js pages
│   │   └── styles/                # CSS styles
│   ├── package.json               # Node dependencies
│   └── tsconfig.json              # TypeScript configuration
├── recordings/                    # Saved simulation recordings
├── start_app.bat                  # Windows startup script
├── create_desktop_shortcut.bat    # Desktop shortcut creator
├── cleanup.bat                    # Cleanup utility
└── README.md                      # This documentation
```

## Key Files

- **backend/app/simulation.py**: Core simulation engine with entity update rules
- **backend/app/grid.py**: Grid implementation with neighborhood functionality
- **frontend/src/pages/simulate.tsx**: Main simulation UI and WebSocket handling
- **frontend/src/constants.ts**: Simulation parameters and validation limits

## Extending the Simulation

The modCA_7web platform is designed to be extensible. Here are some ways to extend it:

1. **Adding New Entity Types**:
   - Define new constants in constants.py/ts
   - Add update methods in simulation.py
   - Add visualization in the frontend

2. **Custom Rules**:
   - Modify existing update methods in simulation.py
   - Adjust transition probabilities

3. **Enhanced Analysis**:
   - Add new statistics tracking
   - Implement additional visualizations

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
- NumPy installation issues: Try `pip install numpy --upgrade`

### Frontend Issues
- Verify backend server is running
- Check WebSocket connection
- Clear browser cache if needed
- For slow rendering on large grids, reduce grid size or use viewport mode

### Performance Issues
- For slow simulations, try reducing:
  - Grid size
  - Number of initial entities
  - Complexity of neighborhood (von Neumann is faster than Moore)
- For memory issues, reduce grid size or limit entity counts

### Manual Startup
- Backend: `cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Frontend: `cd frontend && npm run dev`

For more detailed troubleshooting, refer to the [Developer Documentation](DEVELOPER_DOCUMENTATION.md). 