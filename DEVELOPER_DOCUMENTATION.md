# modca_7web Developer Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Backend Documentation](#5-backend-documentation)
   - [Setup and Installation](#51-setup-and-installation)
   - [API Endpoints](#52-api-endpoints)
   - [Data Models](#53-data-models)
   - [Database Structure](#54-database-structure)
   - [Simulation Engine](#55-simulation-engine)
6. [Frontend Documentation](#6-frontend-documentation)
   - [Setup and Installation](#61-setup-and-installation)
   - [Pages and Components](#62-pages-and-components)
   - [State Management](#63-state-management)
   - [API Integration](#64-api-integration)
7. [Development Workflow](#7-development-workflow)
8. [Testing](#8-testing)
9. [Deployment](#9-deployment)
10. [Troubleshooting](#10-troubleshooting)

## 1. Project Overview

modca_7web is a web-based cellular automata simulation platform that models predator-prey-substrate ecosystem dynamics. The application uses a grid-based approach where predators, prey, and substrate interact according to probabilistic rules. This simulation allows users to explore how different parameters affect population dynamics over time.

Key features:
- Interactive web-based simulation with real-time visualization
- Customizable simulation parameters (grid size, entity counts, behavior probabilities)
- Live statistics and population trend tracking
- WebSocket-based real-time updates
- Ability to save and load simulations
- API-driven architecture with clear separation of frontend and backend

## 2. System Architecture

modca_7web follows a modern client-server architecture with the following components:

```
┌───────────────────┐       ┌───────────────────┐
│                   │       │                   │
│  Next.js Frontend │◄─────►│  FastAPI Backend  │
│  (Web Browser)    │       │  (Python Server)  │
│                   │       │                   │
└───────────────────┘       └───────────┬───────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │               │
                                │  SQLite DB    │
                                │               │
                                └───────────────┘
```

- **Client**: React-based Next.js application that handles UI rendering, user interactions, and visualization
- **Server**: Python FastAPI application that manages simulation logic, data processing, and persistence
- **Communication**: 
  - RESTful API calls for initial simulation setup and management
  - WebSocket connections for real-time updates during simulation execution
- **Data Storage**: SQLite database for persisting simulation configurations and results

## 3. Technology Stack

### Backend
- **Python 3.8+**: Core programming language
- **FastAPI**: High-performance web framework
- **Uvicorn**: ASGI server for serving the FastAPI application
- **NumPy**: Efficient numerical operations for simulation calculations
- **SQLite**: Local database for storage
- **WebSockets**: For real-time bidirectional communication

### Frontend
- **Next.js**: React framework for server-rendered React applications
- **TypeScript**: Typed JavaScript for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Chart.js**: Data visualization for population trends
- **Axios**: HTTP client for API requests
- **Formik + Yup**: Form handling and validation
- **WebSocket API**: For real-time communication with backend

## 4. Directory Structure

```
modca_7web/
│
├── backend/                    # Backend server
│   ├── app/                    # Application code
│   │   ├── __init__.py         # Package initializer
│   │   ├── constants.py        # Constants definitions
│   │   ├── db_handler.py       # Database handler
│   │   ├── grid.py             # Grid implementation
│   │   ├── main.py             # Main FastAPI application
│   │   ├── models.py           # Data models
│   │   └── simulation.py       # Simulation logic
│   │
│   ├── venv/                   # Backend virtual environment
│   ├── requirements.txt        # Python dependencies
│   └── settings.db             # Database file
│
├── frontend/                   # Frontend application
│   ├── node_modules/           # Node.js dependencies
│   ├── src/                    # Source code
│   │   └── pages/              # Next.js pages
│   │       ├── index.tsx       # Home page
│   │       └── simulate.tsx    # Simulation page
│   │
│   ├── next-env.d.ts           # Next.js type declarations
│   ├── next.config.js          # Next.js configuration
│   ├── package-lock.json       # Locked dependencies
│   ├── package.json            # Node.js dependencies
│   └── tsconfig.json           # TypeScript configuration
│
├── .gitignore                  # Git ignore file
├── cleanup.bat                 # Cleanup script
├── create_desktop_shortcut.bat # Shortcut creator
├── DEVELOPER_DOCUMENTATION.md  # This documentation file
├── QUICK_START.md              # Quick start guide
└── start_app.bat               # Application starter
```

## 5. Backend Documentation

### 5.1 Setup and Installation

**Prerequisites:**
- Python 3.8 or higher
- pip (Python package manager)

**Installation Steps:**
1. Navigate to the backend directory: `cd modca_7web/backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### 5.2 API Endpoints

#### RESTful Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/` | GET | Root endpoint to check if API is running | - | `{"message": "modCA_7 Web API is running"}` |
| `/api/simulate` | POST | Start a new simulation | `SimulationSettings` | `SimulationResponse` |
| `/api/simulate/{simulation_id}/step` | POST | Run a specified number of simulation steps | Query: `steps` (optional) | `SimulationResponse` |
| `/api/simulate/{simulation_id}` | GET | Get current state of a simulation | - | `SimulationResponse` |
| `/api/simulate/{simulation_id}` | DELETE | Stop and remove a simulation | - | `{"message": "Simulation stopped"}` |
| `/api/settings` | GET | Get list of saved settings | - | List of `UserSettings` |
| `/api/settings/{settings_id}` | GET | Get specific saved settings | - | `UserSettings` |

#### WebSocket Endpoint

| Endpoint | Description |
|----------|-------------|
| `/ws/simulate/{simulation_id}` | WebSocket endpoint for real-time simulation updates |

WebSocket Commands:
- `ping`: Check connection
- `step`: Run a specified number of steps
- `reset`: Reset the simulation to initial state

### 5.3 Data Models

#### SimulationSettings
Core configuration model for simulation parameters:

```python
class SimulationSettings(BaseModel):
    # Grid configuration
    grid_size: int                   # Size of the square grid (NxN)
    steps: int                       # Number of simulation iterations
    neighborhood_type: str           # 'von_neumann' or 'moore'
    
    # Predator parameters
    predator_death_probability: float # Probability of predator dying
    predator_birth_probability: float # Chance of predator reproduction
    initial_predators: int           # Starting number of predators
    
    # Prey parameters
    prey_hunted_probability: float   # Probability that a prey is hunted
    prey_random_death: float         # Probability of prey dying randomly
    initial_prey: int                # Starting number of prey
    prey_birth_probability: float    # Probability of prey reproduction
    
    # Substrate parameters
    initial_substrate_probability: float # Probability of substrate formation
    substrate_random_death: float    # Probability of substrate disappearing
    substrate_consumption_prob: float # Probability of substrate being consumed
```

#### SimulationResponse
Response model for simulation operations:

```python
class SimulationResponse(BaseModel):
    simulation_id: str               # Unique ID for the simulation
    status: str                      # Current status (running, completed, etc.)
    current_step: int                # Current simulation step
    total_steps: int                 # Total steps to run
    grid: List[List[int]]            # Current grid state
    statistics: SimulationStatistics # Current statistics
    message: Optional[str]           # Optional message
    steps_run: Optional[int]         # Steps run in last operation
    db_save_success: Optional[bool]  # Database save success status
```

#### SimulationStatistics
Statistics for a simulation:

```python
class SimulationStatistics(BaseModel):
    predator_count: int
    prey_count: int
    substrate_count: int
    empty_count: Optional[int]
    predator_percentage: Optional[float]
    prey_percentage: Optional[float]
    substrate_percentage: Optional[float]
    empty_percentage: Optional[float]
```

### 5.4 Database Structure

The application uses SQLite with the following tables:

#### simulation_settings
Stores simulation configurations:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | TEXT | User identifier (optional) |
| name | TEXT | Name of the settings |
| description | TEXT | Description of the settings |
| created_at | TEXT | Creation timestamp |
| params | TEXT | JSON string of all simulation parameters |

#### simulation_results
Stores results of completed simulations:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| settings_id | INTEGER | Foreign key to simulation_settings |
| completed_at | TEXT | Completion timestamp |
| total_steps | INTEGER | Total steps executed |
| final_statistics | TEXT | JSON string of final statistics |
| history | TEXT | JSON string of step-by-step history |

### 5.5 Simulation Engine

The cellular automata simulation engine is centered around the following components:

#### Grid Initialization

```python
def initialize_grid(size, prey_count, predator_count, substrate_probability):
    """
    Initialize a grid with specified entities.
    
    Args:
        size (int): Size of the square grid
        prey_count (int): Number of prey to place
        predator_count (int): Number of predators to place
        substrate_probability (float): Probability of substrate at each cell
        
    Returns:
        numpy.ndarray: 2D grid with entities placed
    """
```

#### Simulation Class

The `Simulation` class manages the state and evolution of the cellular automata:

```python
class Simulation:
    """
    Manages the simulation of cellular automata.
    
    Attributes:
        grid (numpy.ndarray): Current state of the grid
        params (dict): Simulation parameters
        step_count (int): Current step number
        statistics_history (list): History of statistics
    
    Methods:
        step(): Perform one simulation step
        run_steps(n): Run n simulation steps
        get_statistics(): Get current statistics
        reset(): Reset simulation to initial state
    """
```

## 6. Frontend Documentation

### 6.1 Setup and Installation

**Prerequisites:**
- Node.js 16.x or higher
- npm (Node.js package manager)

**Installation Steps:**
1. Navigate to the frontend directory: `cd modca_7web/frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the application at http://localhost:3000

### 6.2 Pages and Components

#### Home Page (index.tsx)
The landing page with options to:
- Start a new simulation
- Load a saved simulation
- View documentation and information

#### Simulation Page (simulate.tsx)
The main interface for running and visualizing simulations:

**Components:**
- **SimulationForm**: Form for configuring simulation parameters
- **SimulationGrid**: Canvas-based visualization of the cellular automata grid
- **StatisticsPanel**: Display of current population statistics
- **PopulationChart**: Line chart showing population trends over time
- **ControlPanel**: Buttons for controlling simulation (step, run, pause, reset)

### 6.3 State Management

The frontend uses React's useState and useEffect hooks for local state management:

```typescript
// Main simulation states
const [simulationId, setSimulationId] = useState<string | null>(null);
const [simulationStatus, setSimulationStatus] = useState<string>('idle');
const [grid, setGrid] = useState<number[][]>([]);
const [statistics, setStatistics] = useState<any>({});
const [step, setStep] = useState<number>(0);
const [totalSteps, setTotalSteps] = useState<number>(0);
const [historicalData, setHistoricalData] = useState<any[]>([]);
const [isRunning, setIsRunning] = useState<boolean>(false);
const [socket, setSocket] = useState<WebSocket | null>(null);
```

### 6.4 API Integration

The frontend communicates with the backend using:

1. **Axios for RESTful API Calls**:

```typescript
const startSimulation = async (values: any) => {
    try {
        const response = await axios.post('http://localhost:8000/api/simulate', values);
        // Process response...
    } catch (error) {
        handleAxiosError(error, 'Failed to start simulation');
    }
};
```

2. **WebSocket for Real-time Updates**:

```typescript
const connectWebSocket = (simId: string) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/simulate/${simId}`);
    
    ws.onopen = () => {
        console.log('WebSocket connection established');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Update state with new data...
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };
    
    setSocket(ws);
};
```

## 7. Development Workflow

### Setting Up the Development Environment

1. Clone the repository
2. Install backend dependencies:
   ```
   cd modca_7web/backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```
   cd modca_7web/frontend
   npm install
   ```

4. Start both servers in development mode:
   - Backend: `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
   - Frontend: `cd frontend && npm run dev`

Alternatively, use the provided `start_app.bat` for an automated setup.

### Development Guidelines

1. **Backend Development**:
   - Follow PEP 8 style guide for Python code
   - Use type hints for improved code readability
   - Add docstrings to functions and classes
   - Include proper error handling
   - Log important events and errors

2. **Frontend Development**:
   - Use TypeScript for type safety
   - Follow component-based architecture
   - Use Tailwind CSS for styling
   - Implement responsive design
   - Handle loading states and errors gracefully

3. **API Integration**:
   - Update API documentation when endpoints change
   - Test API endpoints with Postman or similar tools
   - Handle errors and edge cases appropriately

## 8. Testing

### Backend Testing

1. **Unit Tests**: Test individual functions and classes
   ```
   cd backend
   pytest app/tests/test_simulation.py
   ```

2. **API Tests**: Test API endpoints
   ```
   cd backend
   pytest app/tests/test_api.py
   ```

### Frontend Testing

1. **Component Tests**: Test React components
   ```
   cd frontend
   npm test
   ```

2. **End-to-End Tests**: Test complete user flows
   ```
   cd frontend
   npm run test:e2e
   ```

## 9. Deployment

### Backend Deployment

1. **Production Setup**:
   - Set up a production server (e.g., Ubuntu 20.04 LTS)
   - Install Python 3.8+ and required dependencies
   - Clone the repository

2. **Server Configuration**:
   - Set up Gunicorn as the WSGI server
   - Configure Nginx as a reverse proxy
   - Set up SSL certificates for HTTPS

3. **Environment Configuration**:
   - Set environment variables for production
   - Configure database connection
   - Set up proper logging

### Frontend Deployment

1. **Build for Production**:
   ```
   cd frontend
   npm run build
   ```

2. **Deployment Options**:
   - Deploy to Vercel (recommended for Next.js)
   - Deploy to Netlify
   - Deploy to a static hosting service

## 10. Troubleshooting

### Common Backend Issues

1. **Database Connection Errors**:
   - Check if the database file exists and has proper permissions
   - Verify that the database schema is properly set up

2. **API Endpoint Failures**:
   - Check server logs for errors
   - Verify that the request body matches the expected schema
   - Ensure all required dependencies are installed

3. **Simulation Performance Issues**:
   - Reduce grid size for better performance
   - Optimize simulation algorithms
   - Consider using a worker thread for long-running simulations

### Common Frontend Issues

1. **API Connection Errors**:
   - Verify that the backend server is running
   - Check CORS configuration
   - Ensure API endpoint URLs are correct

2. **WebSocket Connection Issues**:
   - Check if the backend server supports WebSockets
   - Verify that the WebSocket URL is correct
   - Implement proper reconnection logic

3. **Rendering Performance**:
   - Optimize grid rendering with canvas
   - Implement virtualization for large grids
   - Use React.memo or shouldComponentUpdate for expensive components 