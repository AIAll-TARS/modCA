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

### 5.1 Production VPS Structure
```
/home/modca/modca_7web/
├── backend/
│   ├── app/               # Core application code
│   │   ├── constants.py
│   │   ├── grid.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── simulation.py
│   │   └── __init__.py
│   ├── data/             # Data storage
│   ├── recordings/       # Simulation recordings
│   │   ├── sim_20250404230746_1_frames.json
│   │   └── sim_20250404230746_1_metadata.json
│   ├── sqlite_data/      # SQLite database files
│   │   └── settings.db
│   ├── venv/             # Python virtual environment
│   ├── Dockerfile        # Container definition
│   ├── Procfile         # Process management
│   ├── requirements.txt  # Dependencies
│   ├── runtime.txt      # Runtime configuration
│   └── settings.db      # Database file
├── certbot/             # SSL certificates
│   ├── conf/           # Certbot configuration
│   └── www/            # Web root for verification
├── config/             # Service configurations
│   └── nginx/          # Nginx configuration
│       └── modca.conf  # Nginx site config
└── docker-compose.yml  # Container orchestration
```

### 5.2 Key Differences Between Development and Production

1. **Containerization**
   - Development: Direct Python execution
   - Production: Docker containers with Nginx reverse proxy

2. **Data Storage**
   - Development: Local SQLite database
   - Production: Persistent volume-mounted SQLite database

3. **SSL/TLS**
   - Development: None (local development)
   - Production: Let's Encrypt certificates via Certbot

4. **Web Server**
   - Development: Uvicorn directly
   - Production: Nginx as reverse proxy

5. **Environment**
   - Development: Local virtual environment
   - Production: Containerized environment

6. **User Management**
   - Development: Local user
   - Production: Dedicated `modca` user (UID: 1000) with:
     - Home directory: `/home/modca`
     - Project directory: `/home/modca/modca_7web`
     - SSH key: `githubVPSkey` for GitHub access
     - Git repository: Connected to GitHub
     - Branch: `vps-deploy` (based on `prod`)

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
components/
├── Grid/
│   ├── Cell.tsx
│   ├── Grid.tsx
│   └── types.ts
├── Controls/
│   ├── SimulationControls.tsx
│   ├── ParameterControls.tsx
│   └── types.ts
└── Statistics/
    ├── PopulationGraph.tsx
    ├── StatisticsSummary.tsx
    └── types.ts
```

### 7.2 State Management

The application uses React's Context API for global state management:

```typescript
interface SimulationState {
  settings: SimulationSettings;
  statistics: SimulationStatistics;
  status: SimulationStatus;
  grid: Grid;
}

const SimulationContext = React.createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
}>(initialContext);
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