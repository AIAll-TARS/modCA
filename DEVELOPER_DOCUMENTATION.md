# Developer Documentation

## Overview

This document provides technical details for developers working on the modCA_7 web application. The application is a web-based implementation of a modified Cellular Automata simulation featuring predator-prey dynamics and substrate interactions.

## ✅ Current Deployment Status

### Production Environment
- **Frontend**: https://www.janis7ewski.org (Vercel) ✅ Operational
- **Backend API**: https://ws.janis7ewski.org/api (Hetzner VPS) ✅ Operational  
- **WebSocket**: wss://ws.janis7ewski.org/ws (Hetzner VPS) ✅ Operational
- **Database**: SQLite on VPS ✅ Connected
- **SSL/HTTPS**: Cloudflare + Let's Encrypt ✅ Working

### Development Environment
- **Backend**: `http://localhost:8000` (local development)
- **Frontend**: `http://localhost:3000` (local development)
- **API Docs**: `http://localhost:8000/docs` (FastAPI auto-generated)

## Architecture

### Backend (FastAPI)

The backend is built with FastAPI and provides:
- RESTful API endpoints for simulation control
- WebSocket support for real-time updates
- Grid initialization and management
- Simulation state tracking
- Parameter validation

**Key Components:**
- **FastAPI Application**: Main API server (`backend/app/main.py`)
- **Docker Container**: Containerized for production deployment
- **SQLite Database**: Persistent storage for settings and recordings
- **WebSocket Handler**: Real-time simulation updates

### Frontend (Next.js)

The frontend is built with Next.js and provides:
- Interactive grid visualization
- Real-time statistics display
- Parameter configuration interface
- WebSocket-based live updates

**Key Components:**
- **Next.js 14**: React framework with SSR/SSG capabilities
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **WebSocket Client**: Real-time backend communication

### Production Infrastructure

```
Client → Cloudflare (DNS + SSL) → Vercel (Frontend)
                               → Hetzner VPS (Backend)
                                 → Nginx (443)
                                   → FastAPI Backend (8000)
                                     → SQLite DB
```

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

5. **Health Check**:
   ```http
   GET /api/health
   ```

### WebSocket Endpoints

1. **Connect**:
   ```javascript
   // Production
   const ws = new WebSocket(`wss://ws.janis7ewski.org/ws/simulate/${simulationId}`);
   
   // Development
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
    record_simulation: bool = False
    # ... additional parameters
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
    adjustment_info: Optional[Dict] = None
```

## Development Setup

### Prerequisites
- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **Docker & Docker Compose** (for production-like environment)
- **Git** (version control)

### Local Development

1. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
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
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 2 (Frontend)
   cd frontend
   npm run dev
   ```

4. **Access Points**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Docker Development

For a production-like environment:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
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

### API Testing

```bash
# Health check
curl http://localhost:8000/api/health

# Create simulation
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"grid_size": 10, "steps": 100, "initial_prey": 5, "initial_predators": 2}'
```

## Production Deployment

### VPS Access & Management

#### SSH Access
- **User**: `modca` (not root)
- **Command**: `ssh -i ~/.ssh/modca_vps modca@135.181.111.66`
- **Project Directory**: `/home/modca/modca_7web`

#### Container Management
```bash
# Check container status
docker-compose ps

# Start services
docker-compose up -d

# View logs
docker-compose logs backend
docker-compose logs nginx

# Restart services
docker-compose restart
```

#### Deployment Process
1. **SSH to VPS**:
   ```bash
   ssh -i ~/.ssh/modca_vps modca@135.181.111.66
   cd /home/modca/modca_7web
   ```

2. **Update Code**:
   ```bash
   git fetch origin
   git pull origin prod
   ```

3. **Restart Services**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. **Verify Deployment**:
   ```bash
   docker-compose ps
   curl https://ws.janis7ewski.org/api/health
   ```

### Frontend Deployment (Vercel)
- **Auto-deployment**: Enabled on `prod` branch
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL=https://ws.janis7ewski.org/api`
  - `NEXT_PUBLIC_WS_URL=wss://ws.janis7ewski.org/ws`

### Environment Configuration

#### Production Environment Variables
```bash
# Backend (.env)
PYTHONUNBUFFERED=1
DATABASE_URL=sqlite:///./sqlite_data/settings.db

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://ws.janis7ewski.org/api
NEXT_PUBLIC_WS_URL=wss://ws.janis7ewski.org/ws
```

#### Development Environment Variables
```bash
# Backend (.env.local)
PYTHONUNBUFFERED=1
DATABASE_URL=sqlite:///./settings.db

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## Performance Considerations

### Grid Size Limits
- **Maximum**: 100x100 cells
- **Recommended**: 50x50 for real-time performance
- **Memory Usage**: ~4MB per 100x100 grid

### WebSocket Performance
- **Update Frequency**: Configurable (default: on-demand)
- **Compression**: Enabled for large grids
- **Throttling**: Client-side rate limiting

### Database Performance
- **SQLite**: Suitable for current scale
- **Indexing**: Applied to frequently queried fields
- **Backup**: Automated daily backups

## Troubleshooting

### Common Development Issues

1. **Backend Won't Start**:
   ```bash
   # Check Python version
   python --version  # Should be 3.11+
   
   # Verify dependencies
   pip list
   
   # Check for port conflicts
   lsof -i :8000
   ```

2. **Frontend Build Errors**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check Node version
   node --version  # Should be 18+
   ```

3. **WebSocket Connection Issues**:
   - Verify backend is running on correct port
   - Check CORS configuration
   - Ensure WebSocket URL is correct
   - Test with browser developer tools

### Production Troubleshooting

1. **502 Bad Gateway**:
   ```bash
   # Check container status
   docker-compose ps
   
   # Restart services
   docker-compose restart
   
   # Check logs
   docker-compose logs nginx
   ```

2. **API Timeouts**:
   ```bash
   # Check backend health
   curl https://ws.janis7ewski.org/api/health
   
   # Monitor container resources
   docker stats
   ```

3. **SSL Certificate Issues**:
   ```bash
   # Verify certificate
   openssl s_client -connect ws.janis7ewski.org:443
   
   # Check certificate expiry
   echo | openssl s_client -connect ws.janis7ewski.org:443 2>/dev/null | openssl x509 -noout -dates
   ```

## Contributing

### Development Workflow
1. Create feature branch from `dev`
2. Implement changes with tests
3. Test locally with both frontend and backend
4. Submit pull request to `dev`
5. After review, merge to `dev`
6. Deploy to production via `prod` branch

### Code Standards
- **Python**: Follow PEP 8, use type hints
- **TypeScript**: Follow ESLint configuration
- **Git**: Conventional commit messages
- **Documentation**: Update relevant docs with changes

### Testing Requirements
- **Backend**: Unit tests for all API endpoints
- **Frontend**: Component tests for UI elements
- **Integration**: End-to-end tests for critical workflows
- **Performance**: Load testing for simulation endpoints

## Security Considerations

### Development Security
- **Environment Variables**: Never commit secrets
- **Dependencies**: Regular security audits
- **CORS**: Properly configured for development

### Production Security
- **HTTPS**: All traffic encrypted via Cloudflare
- **Authentication**: SSH key-based access only
- **Firewall**: Minimal port exposure (22, 80, 443)
- **Updates**: Regular security patches

## Future Improvements

### Planned Features
- **Enhanced Visualization**: 3D grid rendering
- **Advanced Analytics**: Statistical analysis tools
- **User Accounts**: Persistent simulation storage
- **Real-time Collaboration**: Multi-user simulations

### Technical Improvements
- **Performance**: GPU acceleration for large grids
- **Scalability**: Microservices architecture
- **Monitoring**: Comprehensive observability
- **Testing**: Increased coverage and automation

---

## Quick Reference

### Essential URLs
- **Production Frontend**: https://www.janis7ewski.org
- **Production API**: https://ws.janis7ewski.org/api
- **API Documentation**: https://ws.janis7ewski.org/docs
- **Health Check**: https://ws.janis7ewski.org/api/health

### Development Commands
```bash
# Start backend
cd backend && uvicorn app.main:app --reload

# Start frontend  
cd frontend && npm run dev

# Run tests
cd backend && pytest
cd frontend && npm test

# Docker development
docker-compose up -d
```

### Production Commands
```bash
# SSH to VPS
ssh -i ~/.ssh/modca_vps modca@135.181.111.66

# Check services
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

---

*Last updated: June 18, 2025 - All systems operational*