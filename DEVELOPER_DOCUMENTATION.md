# modca_7web Developer Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Theoretical Background](#2-theoretical-background)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Directory Structure](#5-directory-structure)
6. [Backend Documentation](#6-backend-documentation)
7. [Frontend Documentation](#7-frontend-documentation)
8. [Development Workflow](#8-development-workflow)
9. [Testing](#9-testing)
10. [Deployment](#10-deployment)
11. [Troubleshooting](#11-troubleshooting)
12. [Current Status](#12-current-status)

## Current Status - OPERATIONAL

### Last Updated: June 18, 2025
- **Frontend**: ✅ Operational (https://www.janis7ewski.org)
- **Backend API**: ✅ Operational (https://ws.janis7ewski.org/api)
- **WebSocket**: ✅ Operational (wss://ws.janis7ewski.org/ws)
- **Database**: ✅ Connected and operational
- **SSL/HTTPS**: ✅ Working via Cloudflare + Let's Encrypt
- **Container Health**: ✅ All containers running and healthy

## 0. Development and Deployment Workflow

### 0.1 Quick Reference Guide

1. **Local Development**
   ```bash
   # Make changes locally
   # Test frontend-only changes
   git checkout dev
   git add .
   git commit -m "your message"
   git push origin dev
   ```

2. **VPS Backend Testing**
   ```bash
   # SSH into VPS
   ssh -i ~/.ssh/modca_7web_vps modca@135.181.111.66
   
   # Update and restart
   cd ~/modca_7web
   git checkout dev
   git pull origin dev
   docker-compose down
   docker-compose up -d --build
   
   # Test endpoints
   curl https://ws.janis7ewski.org/api/your-endpoint
   ```

3. **Frontend Testing Against VPS**
   ```bash
   cd frontend
   NEXT_PUBLIC_API_URL=https://ws.janis7ewski.org/api NEXT_PUBLIC_WS_URL=wss://ws.janis7ewski.org/ws npm run dev
   ```

4. **Production Deployment**
   ```bash
   git checkout prod
   git merge dev
   git push origin prod  # This triggers Vercel frontend deployment
   ```

### 0.2 Key Architecture Points

- **Backend**: 
  - Runs on VPS (135.181.111.66)
  - Docker containers managed via docker-compose
  - All configuration and constants should be defined here
  - Serves both API and WebSocket endpoints

- **Frontend**:
  - Deployed via Vercel from prod branch
  - Can be tested locally against VPS backend
  - Gets configuration from backend constants endpoint

### 0.3 Best Practices

1. **Branch Usage**:
   - `dev`: Development and testing
   - `prod`: Production deployment
   - Always test on dev before merging to prod

2. **Configuration Management**:
   - Keep all constants in backend
   - Frontend should fetch constants from backend
   - Use environment variables for deployment-specific settings

3. **Testing Process**:
   - Test frontend changes locally first
   - Test backend changes on VPS using dev branch
   - Verify all endpoints and WebSocket connections
   - Only merge to prod after successful testing

4. **Deployment Safety**:
   - Always backup VPS data before major changes
   - Keep track of working configurations
   - Monitor logs after deployment
   - Have rollback plan ready

## 0. Git Repository Structure and Workflow

## 0.1 Branching Model

- **prod** — Main production branch, used for both Vercel frontend and VPS backend deployment.
- **dev** — Main integration branch for ongoing development and testing.
- **vps-deploy** — VPS-specific branch for backend deployment, contains only necessary backend code and VPS configurations.
- **master** — Stable, tagged releases or long-term reference.
- **feature/<name>** — For new features.
- **bugfix/<name>** — For bug fixes.
- **exp/<name>** — For experiments or prototypes.

## 0.2 Directory Layout

```
modca_7web/
├── backend/                # FastAPI app, Python code, requirements.txt, venv/
│   └── app/
├── frontend/               # Next.js app, package.json, src/
│   └── src/
├── deployment/             # Deployment scripts, configs, specs
├── docs/                   # Documentation, architecture, API docs
├── recordings/             # Simulation recordings (if versioned)
├── vps_config/            # VPS-specific configurations
│   ├── .env               # Environment variables
│   └── ssl/               # SSL certificates
├── .github/                # GitHub Actions, issue templates, etc.
├── .gitignore
├── README.md
├── DEVELOPER_DOCUMENTATION.md
├── QUICK_START.md
└── ... (other project files)
```

## 0.3 Commit/PR Workflow

- All work is done in feature/bugfix/exp branches.
- Merge to `dev` via Pull Request (PR), with code review and CI checks.
- When `dev` is stable, merge to `prod` for production.
- `vps-deploy` branch is updated from `prod` with VPS-specific configurations.
- Tag releases on `prod` or `master` (e.g., `v1.0.0`).

## 0.4 Environment/Config Management

- Use `.env.local`, `.env.production`, etc., and never commit secrets.
- VPS-specific configs live in `vps_config/`.
- Deployment-specific configs/scripts live in `deployment/`.

## 0.5 Branch Table

| Branch         | Purpose                        | Who/What Uses It         |
|----------------|-------------------------------|--------------------------|
| prod           | Production deployment          | CI/CD, Vercel, VPS       |
| dev            | Main development/integration   | Developers, CI           |
| vps-deploy     | VPS-specific deployment        | VPS Backend              |
| feature/*      | Isolated feature work          | Developers               |
| bugfix/*       | Bug fixes                      | Developers               |
| exp/*          | Experiments                    | Developers               |
| master         | Stable reference               | Tagging, releases        |

## 0.6 Rationale

- **Isolation:** Dev and prod are always cleanly separated.
- **Safety:** Production is never polluted by half-baked features.
- **Clarity:** Feature/bugfix/exp branches are self-explanatory.
- **Scalability:** Easy to add CI/CD, code review, and release automation.
- **VPS Management:** Dedicated branch for VPS-specific configurations and deployments.

---

## 1. Project Overview

modca_7web is a web-based cellular automata simulation platform that models predator-prey-substrate ecosystem dynamics. The application uses a grid-based approach where predators, prey, and substrate interact according to probabilistic rules. This simulation allows users to explore how different parameters affect population dynamics over time.

Key features:
- Interactive web-based simulation with real-time visualization
- Customizable simulation parameters (grid size, entity counts, behavior probabilities)
- Live statistics and population trend tracking
- WebSocket-based real-time updates
- Ability to save and load simulations
- API-driven architecture with clear separation of frontend and backend

## 2. Theoretical Background

### 2.1 Cellular Automata Foundation

This implementation draws inspiration from the research paper ["Cellular Automata as the Basis of Fast and Reliable Material Models"](http://www.ptmts.org.pl/2004-3-burzynski-in.pdf) by T. Burzyński and W. Kuś. While the original paper focuses on material science applications, we've adapted these concepts to ecological modeling.

Key concepts from the paper that we've adapted:
- Discrete state transitions
- Neighborhood-based interaction rules
- Probabilistic state changes
- Multi-state cell representation

### 2.2 Simulation Rules

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

### 2.3 Implementation Approach

Our implementation differs from traditional cellular automata platforms like Golly in several ways:
- Focus on ecological modeling rather than general CA patterns
- Probabilistic rather than deterministic rules
- Real-time parameter adjustment
- Web-based interface for accessibility

## 3. System Architecture

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

## 4. Technology Stack

### Backend
- **Python 3.8+**: Core programming language
- **FastAPI**: High-performance web framework
- **Uvicorn**: ASGI server for serving the FastAPI application
- **NumPy**: Efficient numerical operations for simulation calculations
- **SQLite**: Local database for storage
- **WebSockets**: For real-time bidirectional communication

### Frontend
- **Next.js 14.2.28**: React framework for server-rendered React applications
- **TypeScript**: Typed JavaScript for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Chart.js**: Data visualization for population trends
- **Axios**: HTTP client for API requests
- **Formik + Yup**: Form handling and validation
- **WebSocket API**: For real-time communication with backend

### Deployment & Infrastructure
- **Vercel**:
  - Frontend hosting and deployment
  - Edge Functions support
  - Automatic HTTPS
  - CI/CD pipeline integration
  - Analytics and monitoring

- **Cloudflare**:
  - DNS management
  - CDN and caching
  - DDoS protection
  - SSL/TLS encryption
  - WebSocket proxy
  - Performance optimization

### Development Tools
- **Git**: Version control
- **npm**: Package management for frontend
- **pip**: Package management for backend
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Jest**: Frontend testing
- **pytest**: Backend testing

### Monitoring & Analytics
- **Vercel Analytics**: Frontend performance monitoring
- **Cloudflare Analytics**: Traffic and security monitoring
- **Custom Metrics**:
  - WebSocket performance
  - API response times
  - User interaction tracking

## 5. Directory Structure

```
modca_7web/
├── backend/                    # Backend server
│   ├── app/                    # Application code
│   │   ├── __init__.py         # Package initializer
│   │   ├── constants.py        # Constants definitions
│   │   ├── db_handler.py       # Database handler
│   │   ├── grid.py             # Grid implementation
│   │   ├── main.py             # Main FastAPI application
│   │   ├── models.py           # Data models
│   │   └── simulation.py       # Simulation logic
│   ├── recordings/             # Simulation recordings
│   ├── sqlite_data/            # Database files
│   ├── venv/                   # Backend virtual environment
│   ├── Dockerfile              # Container definition
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # Frontend application
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   │   ├── SimulationSetup.tsx     # Initial setup form and validation
│   │   │   └── RunningSimulation.tsx   # Active simulation visualization
│   │   ├── pages/             # Next.js pages
│   │   │   ├── _app.tsx       # App wrapper
│   │   │   ├── index.tsx      # Home page
│   │   │   ├── about.tsx      # About page
│   │   │   └── simulate.tsx   # Main simulation page
│   │   ├── styles/            # CSS and styling
│   │   ├── utils/             # Utility functions
│   │   ├── constants.ts       # Constants and config
│   │   └── types.ts           # TypeScript types
│   ├── next.config.js         # Next.js configuration
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── tsconfig.json          # TypeScript configuration
│   └── vercel.json            # Vercel deployment config
│
├── deployment/                 # Deployment configuration
│   ├── config/                # Service configurations
│   │   ├── nginx/            # Nginx configuration
│   │   ├── prometheus/       # Monitoring config
│   │   └── systemd/         # Service definitions
│   ├── scripts/              # Deployment scripts
│   └── maintenance/          # Maintenance docs
│
├── docs/                      # Project documentation
├── .cursor/                   # Cursor IDE settings
├── .gitignore                # Git ignore patterns
├── start_dev.sh              # Development startup script
├── modca_7web.desktop        # Linux desktop shortcut
├── open_in_nautilus.sh       # File explorer script
└── structure.txt             # Project structure doc
```

### 5.1 Production VPS Structure

```bash
/home/modca/
├── modca_7web/           # Git repository (code only)
├── modca_config/         # VPS-specific configs (never overwritten)
│   ├── nginx/           # Nginx configuration
│   │   └── modca.conf   # Main Nginx config
│   ├── ssl/             # SSL certificates
│   ├── docker-compose.prod.yml  # Production Docker Compose
│   └── .env.prod        # Production environment variables
└── modca_data/          # Persistent data
    ├── sqlite_data/     # Database files
    │   └── simulation.db
    └── backups/         # Backup directory
        ├── db/          # Database backups
        └── config/      # Config backups
```

### 5.2 Key Differences Between Development and Production

1. **Directory Structure**
   - Development: All in one repository
   - Production: Separated into code, config, and data directories

2. **Configuration Management**
   - Development: Local `.env` files
   - Production: Centralized in `/home/modca/modca_config`

3. **Data Storage**
   - Development: Local SQLite in `backend/sqlite_data`
   - Production: Persistent volume in `/home/modca/modca_data`

4. **Deployment Configuration**
   - Development: Local Docker Compose
   - Production: Production-specific Docker Compose with volume mounts

5. **SSL/TLS**
   - Development: None (HTTP)
   - Production: Let's Encrypt certificates in `/home/modca/modca_config/ssl`

## 6. Backend Documentation

### 6.1 Setup and Installation

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

### 6.2 API Endpoints

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

### 6.3 Data Models

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
    adjustment_info: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {"values_adjusted": False},
        description="Information about any adjustments made to the simulation parameters"
    )
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

### 6.4 Database Structure

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

### 6.5 Simulation Engine

The simulation engine (`simulation.py`) implements the core cellular automata logic:

```python
class Simulation:
    def __init__(self, grid, params=None):
        """
        Initialize the simulation with a grid and parameters.
        
        Args:
            grid: Either a numpy.ndarray or a tuple (grid, adjustment_info)
            params: Optional simulation parameters
        """
        if isinstance(grid, tuple):
            self.grid = grid[0]
            self.adjustment_info = grid[1]
        else:
            self.grid = grid
            self.adjustment_info = {"values_adjusted": False}
            
        self.params = params or {}
        self.current_step = 0
        self.statistics = self._calculate_statistics()
        
    def step(self):
        """Execute one simulation step."""
        # Phase 1: Movement
        self._handle_movement()
        
        # Phase 2: Interactions
        self._handle_interactions()
        
        # Phase 3: Reproduction
        self._handle_reproduction()
        
        # Phase 4: Death
        self._handle_death()
        
        # Phase 5: Substrate
        self._handle_substrate()
        
        # Update statistics
        self._update_statistics()
        self.current_step += 1
```

Key Implementation Details:
- Phases are executed sequentially to ensure consistent behavior
- Random number generation uses fixed seeds for reproducibility
- Optimized grid operations using NumPy arrays
- Statistics calculation runs in O(n) time
- Grid initialization returns a tuple (grid, adjustment_info)
- Proper handling of grid tuples in simulation initialization
- Enhanced error handling for simulation reset
- Improved WebSocket message handling

## 7. Frontend Documentation

### 7.1 Component Structure

```
frontend/
├── src/
    ├── components/
    │   ├── SimulationSetup.tsx     # Initial setup form and validation
    │   └── RunningSimulation.tsx   # Active simulation visualization
    ├── pages/
    │   ├── _app.tsx               # App wrapper
    │   ├── index.tsx              # Home page
    │   ├── about.tsx              # About page
    │   └── simulate.tsx           # Main simulation page
    ├── styles/
    │   ├── fonts.ts              # Font configurations
    │   ├── globals.css           # Global styles
    │   └── index.ts             # Style exports
    ├── utils/
    │   ├── env.ts               # Environment utilities
    │   └── notification.ts      # Notification system
    ├── constants.ts             # Application constants
    └── types.ts                # TypeScript type definitions

Component Responsibilities:

1. Pages:
   - simulate.tsx: Main simulation page that coordinates between setup and running states
   - about.tsx: Information about the project
   - index.tsx: Landing page

2. Core Components:
   - SimulationSetup: Handles initial simulation configuration
     - Form validation using Formik + Yup
     - Parameter input and validation
   
   - RunningSimulation: Manages active simulation display
     - Grid visualization using Canvas
     - Population trends with Chart.js
     - Real-time statistics display
     - Fullscreen modes for grid and charts
     - Pan and zoom controls for large grids

3. State Management:
   - Local state for component-specific data
   - Props for component communication
   - WebSocket connection for real-time updates
```

### 7.2 Component Communication

```
simulate.tsx (Page)
├── Manages global simulation state
├── Handles WebSocket connection
├── Coordinates between components
│
├── SimulationSetup
│   ├── Receives: onStartSimulation callback
│   └── Emits: simulation parameters
│
└── RunningSimulation
    ├── Receives: simulation state, grid data, statistics
    └── Emits: control actions (step, reset, etc.)
```

### 7.3 State Management

The application uses React's built-in state management with hooks:

```typescript
// Main simulation state in simulate.tsx
interface SimulationState {
  simulationId: string | null;
  status: string;
  currentStep: number;
  totalSteps: number;
  grid: number[][];
  statistics: any;
  chartData: ChartData;
  isGridFullscreen: boolean;
  isChartFullscreen: boolean;
  wsConnected: boolean;
  valueAdjustments: any;
}

// Viewport state for large grids
interface ViewportState {
  offset: { x: number, y: number };
  zoomLevel: number;
  isDragging: boolean;
}
```

### 7.4 WebSocket Integration

WebSocket communication is managed in the main simulation page:
```typescript
// In simulate.tsx
const wsRef = useRef<WebSocket | null>(null);

const connectWebSocket = (simId: string) => {
  const wsUrl = getWsUrl() + '/simulate/' + simId;
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Update simulation state based on received data
  };
  
  // Handle connection lifecycle
  ws.onopen = () => setWsConnected(true);
  ws.onclose = () => setWsConnected(false);
  ws.onerror = (error) => handleWebSocketError(error);
};
```

### 7.5 Form Validation

Validation schema in SimulationSetup:
```typescript
const SimulationSchema = Yup.object().shape({
  grid_size: Yup.number()
    .required('Required')
    .min(VALIDATION_LIMITS.GRID_SIZE.min)
    .max(VALIDATION_LIMITS.GRID_SIZE.max),
  // ... other validations
});
```

## 8. Development Workflow

### 8.1 Setting Up Development Environment

1. Clone the repository
2. Set up backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Set up frontend:
   ```bash
   cd frontend
   npm install
   ```

### 8.2 Development Process

1. Create feature branch from main
2. Implement changes
3. Run tests:
   ```bash
   # Backend tests
   cd backend
   pytest
   
   # Frontend tests
   cd frontend
   npm test
   ```
4. Submit pull request

- For local development, always run both backend and frontend servers in parallel:
  - Backend: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` (from backend directory, with venv activated)
  - Frontend: `npm run dev -- --port 3000` (from frontend directory)
- If you get 'address already in use', kill the process using the port (e.g., `lsof -i :8000` or `lsof -i :3000` then `kill <pid>`)
- Always activate the Python venv before running backend commands
- Both backend and frontend must be running for the app to work locally

## 9. Testing

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

3. **HTTPS API Testing**: Test all API endpoints over HTTPS
   ```
   cd deployment/scripts
   ./test_api_endpoints.sh
   ```
   This script tests:
   - Basic API health check
   - Simulation creation and management
   - WebSocket connections
   - Settings management
   - All endpoints over HTTPS
   
   Requirements:
   - `jq` for JSON processing
   - `curl` for HTTP requests
   - `websocat` for WebSocket testing

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

3. **Mobile Responsiveness Testing**
   - Access the mobile test page at `/mobile-test`
   - Supports testing on various devices:
     - iPhone 12 Pro (390x844)
     - iPhone SE (375x667)
     - iPhone XR (414x896)
     - iPhone 12 Pro Max (428x926)
     - Pixel 5 (393x851)
     - Samsung Galaxy S20 (360x800)
     - Samsung Galaxy S24 (393x852)
     - iPad Pro (1024x1366)
     - iPad Air (820x1180)
     - iPad Mini (768x1024)
   
   Test Categories:
   - Touch Interactions: Verifies minimum touch target sizes (44x44px)
   - Text Readability: Checks font sizes and line heights
   - Layout Responsiveness: Tests container widths and scrolling behavior
   
   To run tests:
   1. Start the development server: `npm run dev`
   2. Navigate to `/mobile-test`
   3. Select a device from the dropdown
   4. Click "Run All Tests"
   5. Review the test results and fix any issues

   Test Results Include:
   - Pass/Fail counts for each category
   - Detailed error messages for failed tests
   - Summary of total tests and pass rate
   - Device-specific issues and recommendations

## 10. Deployment

### 10.1 Vercel Deployment

#### Prerequisites
- Node.js 18.x or higher
- Vercel CLI (`npm install -g vercel`)
- A Vercel account

#### Setup Steps
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configure Project**:
   - Ensure `vercel.json` is properly configured:
   ```json
   {
       "version": 2,
       "buildCommand": "npm run build",
       "devCommand": "npm run dev",
       "installCommand": "npm install --include=dev",
       "framework": "nextjs",
       "regions": ["fra1"],
       // ... other configurations
   }
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

4. **Environment Variables**:
   - Set up required environment variables in Vercel dashboard
   - Configure production URLs and API endpoints

### 10.2 Cloudflare Setup

#### Domain Registration and Management
1. **Domain Registration**:
   - Domain: janis7ewski.org
   - Registrar: Cloudflare, Inc.
   - Admin Contact: AIAll@janis7ewski.org
   - Management: https://dash.cloudflare.com

2. **DNS Records**:
   ```
   Type    Name     Content              Status
   A       @        76.76.21.21         Proxied
   CNAME   www      cname.vercel-dns.com Proxied
   TXT     _vercel  [verification]      DNS only
   ```

3. **Nameservers**:
   - aldo.ns.cloudflare.com
   - venus.ns.cloudflare.com

#### DNS and Security Configuration
1. **SSL/TLS Settings**:
   - Mode: Full (Strict)
   - Edge Certificates: Auto-managed by Cloudflare
   - Minimum TLS Version: 1.2
   - Always Use HTTPS: Enabled

2. **Security Settings**:
   - Security Level: Medium
   - Bot Fight Mode: ON
   - Browser Integrity Check: ON
   - JS Detection: ON

#### Performance Settings
- HTTP/3 (QUIC): ON
- HTTP/2: ON
- TCP Turbo: ON
- WebSocket Support: ON
- Brotli Compression: ON
- Auto Minify: ON (HTML, CSS, JS)

#### Page Rules
1. **WebSocket Rule**:
   ```
   Pattern: *janis7ewski.org/ws*
   Settings:
   - SSL: Full
   - Cache Level: Bypass
   ```

2. **API Rule**:
   ```
   Pattern: *janis7ewski.org/api*
   Settings:
   - Cache Level: Bypass
   - Security Level: High
   ```

### 10.3 VPS Infrastructure Management

#### VPS Access
- **User**: `modca` (non-root)
- **SSH Command**: `ssh -i ~/.ssh/modca_7web_vps modca@135.181.111.66`
- **Key Requirements**:
  - Key file: `~/.ssh/modca_7web_vps`
  - Permissions: 600 (`chmod 600 ~/.ssh/modca_7web_vps`)
  - Key type: RSA

#### Container Management
```bash
# Navigate to config directory
cd /home/modca/modca_config

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs backend --tail 50
docker-compose -f docker-compose.prod.yml logs nginx --tail 50

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

#### Automated Deployment Script
```bash
#!/bin/bash
# /home/modca/modca_config/deploy.sh

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# 1. Backup current state
echo "📦 Creating backup..."
docker-compose -f /home/modca/modca_config/docker-compose.prod.yml down
cp -r /home/modca/modca_data/sqlite_data /home/modca/modca_data/backup_$(date +%Y%m%d_%H%M%S)

# 2. Update code (safe - only code, no configs)
echo "📥 Updating code..."
cd /home/modca/modca_7web
git fetch origin
git reset --hard origin/prod  # Force clean update

# 3. Build and deploy
echo "🔨 Building and starting services..."
cd /home/modca/modca_config
docker-compose -f docker-compose.prod.yml build --no-cache backend
docker-compose -f docker-compose.prod.yml up -d

# 4. Health check
echo "🏥 Health check..."
sleep 10
if curl -f https://ws.janis7ewski.org/api/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed - rolling back..."
    # Rollback logic here
    exit 1
fi
```

#### Rollback Script
```bash
#!/bin/bash
# /home/modca/modca_config/rollback.sh

echo "🔄 Rolling back to previous version..."

# Stop current services
docker-compose -f /home/modca/modca_config/docker-compose.prod.yml down

# Restore from backup
LATEST_BACKUP=$(ls -t /home/modca/modca_data/backup_* | head -n1)
rm -rf /home/modca/modca_data/sqlite_data
cp -r $LATEST_BACKUP /home/modca/modca_data/sqlite_data

# Revert code
cd /home/modca/modca_7web
git reset --hard HEAD~1

# Restart services
cd /home/modca/modca_config
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Rollback complete!"
```

### 10.4 Backup & Recovery

#### Database Backup
```bash
# Manual backup
cd /home/modca/modca_data
cp -r sqlite_data/ backup_$(date +%Y%m%d)/
```

#### Configuration Backup
```bash
# Backup critical configs
cd /home/modca/modca_config
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
    docker-compose.prod.yml \
    nginx/ \
    ssl/
```

## 11. Troubleshooting

### 11.1 Common Backend Issues

#### 1. "521 Web server is down" Error
**Cause**: Nginx container not running
**Solution**:
```bash
cd /home/modca/modca_config
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. Frontend Cannot Connect to Backend
**Symptoms**: API calls fail, WebSocket connections fail
**Diagnosis**:
```bash
# Test API connectivity
curl -i https://ws.janis7ewski.org/api/health

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs
```

#### 3. SSL Certificate Issues
```bash
openssl s_client -connect ws.janis7ewski.org:443 -servername ws.janis7ewski.org
```

### 11.2 Common Frontend Issues

#### 1. "Failed to connect to backend" Error
**Cause**: Network issues or backend server down
**Solution**:
- Check network connectivity
- Verify backend server status

#### 2. "WebSocket connection failed" Error
**Cause**: WebSocket server down or network issues
**Solution**:
- Check WebSocket server status
- Verify network connectivity

### 11.3 Common Deployment Issues

#### 1. "502 Bad Gateway" Error
**Cause**: Nginx configuration issues or backend server down
**Solution**:
- Check Nginx configuration
- Verify backend server status

#### 2. "404 Not Found" Error
**Cause**: Resource not found
**Solution**:
- Verify resource path
- Check backend server logs for more details

### 11.4 Common Infrastructure Issues

#### 1. "521 Web server is down" Error
**Cause**: Nginx container not running
**Solution**:
```bash
cd /home/modca/modca_config
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. Frontend Cannot Connect to Backend
**Symptoms**: API calls fail, WebSocket connections fail
**Diagnosis**:
```bash
# Test API connectivity
curl -i https://ws.janis7ewski.org/api/health

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs
```

#### 3. SSL Certificate Issues
```bash
openssl s_client -connect ws.janis7ewski.org:443 -servername ws.janis7ewski.org
```

### 11.5 Performance Metrics
- **API Response Time**: < 100ms (local)
- **WebSocket Latency**: < 50ms
- **SSL Handshake**: < 200ms via Cloudflare
- **Container Resources**: 
  - Memory: < 512MB per container
  - CPU: < 10% under normal load
  - Disk I/O: Minimal (SQLite operations)

### Performance Tuning

1. **Nginx Optimization**:
   - Enable gzip compression
   - Configure caching with appropriate timeouts
   - Set appropriate worker processes based on CPU cores
   - Configure buffer sizes for WebSocket connections
   - Enable keepalive connections
   - Configure microcache for static assets

2. **Application Settings**:
   - Adjust grid size (max 100x100)
   - Configure appropriate step sizes
   - Monitor memory usage
   - Optimize WebSocket message frequency
   - Configure appropriate batch sizes for data operations

3. **Security Hardening**:
   - Configure Content Security Policy (CSP)
   - Set X-Frame-Options headers
   - Enable HTTP Strict Transport Security (HSTS)
   - Configure rate limiting per IP
   - Set secure cookie flags
   - Implement WebSocket origin validation
   - Configure proper CORS headers
   - Set up fail2ban for SSH and HTTP protection
   - Regular security audits and updates

---

*Last verified: June 18, 2025 - All systems operational*