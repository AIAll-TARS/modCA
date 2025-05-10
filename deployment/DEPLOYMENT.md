# Deployment Documentation

## Current Deployment Status

### URLs
- Frontend: https://www.janis7ewski.org (Vercel)
- WebSocket: wss://ws.janis7ewski.org/ws (Hetzner VPS)
- API: https://ws.janis7ewski.org/api (Hetzner VPS)

### Frontend Hosting (Vercel)
- Framework: Next.js 14
- Region: fra1 (Frankfurt)
- Branch: prod
- Auto-deployment: Enabled
- Environment Variables:
  - NEXT_PUBLIC_API_URL=https://ws.janis7ewski.org/api
  - NEXT_PUBLIC_WS_URL=wss://ws.janis7ewski.org/ws

### Backend Hosting (Hetzner VPS)
- IP: 49.13.233.118
- OS: Ubuntu 24.04 LTS
- Docker & Docker Compose
- Nginx as reverse proxy
- Let's Encrypt SSL certificates
- Cloudflare CDN & Security

## Network Architecture

```
Client → Cloudflare (DNS + SSL) → Vercel (Frontend)
                               → Hetzner VPS (Backend)
                                 → Nginx (443)
                                   → FastAPI Backend (8000)
                                     → SQLite DB
```

### Routing Configuration

1. **Frontend (Vercel)**
   - Domain: www.janis7ewski.org
   - Serves static assets and React application
   - Communicates with backend via API and WebSocket

2. **Backend (Hetzner VPS)**
   - Domain: ws.janis7ewski.org
   - Docker containers:
     - Nginx (ports 80/443)
     - FastAPI backend (port 8000)
   - SSL termination at Nginx
   - Cloudflare proxy enabled

3. **API Endpoints**
   - REST API: https://ws.janis7ewski.org/api/
   - WebSocket: wss://ws.janis7ewski.org/ws
   - Health Check: https://ws.janis7ewski.org/health

## VPS Directory Structure

```
/root/modca_7web/
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
│   ├── sqlite_data/      # SQLite database files
│   │   └── settings.db
│   ├── venv/             # Python virtual environment
│   ├── Dockerfile        # Container definition
│   ├── requirements.txt  # Dependencies
│   └── settings.db      # Database file
├── certbot/            # SSL certificates
│   ├── conf/          # Certbot configuration
│   │   ├── cert.pem
│   │   ├── chain.pem
│   │   ├── fullchain.pem
│   │   └── privkey.pem
│   └── www/           # Web root for verification
├── config/            # Service configurations
│   └── nginx/         # Nginx configuration
│       └── modca.conf # Nginx site config
└── docker-compose.yml # Container orchestration
```

### Key Directories and Files

1. **Backend Application**
   - `backend/app/`: Core application code
   - `backend/data/`: Data storage directory
   - `backend/recordings/`: Simulation recordings
   - `backend/sqlite_data/`: SQLite database files
   - `backend/venv/`: Python virtual environment

2. **Configuration**
   - `config/nginx/modca.conf`: Nginx configuration
   - `docker-compose.yml`: Docker services configuration

3. **SSL Certificates**
   - `certbot/conf/`: Let's Encrypt certificates
     - `cert.pem`: Server certificate
     - `chain.pem`: Intermediate certificates
     - `fullchain.pem`: Full certificate chain
     - `privkey.pem`: Private key

4. **Backup Management**
   - `backups/daily/`: Daily database and configuration backups
   - `backups/weekly/`: Weekly full system backups
   - `backups/monthly/`: Monthly archival backups

5. **Monitoring & Maintenance**
   - `monitoring/logs/`: Application and system logs
   - `monitoring/metrics/`: Performance and health metrics
   - `monitoring/alerts/`: Alert configurations
   - `maintenance/scripts/`: Utility and maintenance scripts

### Important Notes
- The backend application is containerized using Docker
- Nginx serves as a reverse proxy
- SSL certificates are managed by Certbot
- Database files are persisted in `sqlite_data/`
- Simulation recordings are stored in `recordings/`
- Regular backups are stored in `backups/`
- System monitoring and logging in `monitoring/`
- Maintenance scripts in `maintenance/`

### Security Considerations

1. **File Permissions**
   - Database files: 600 (owner read/write only)
   - Configuration files: 644 (owner read/write, group/others read)
   - Scripts: 755 (owner read/write/execute, group/others read/execute)
   - SSL certificates: 600 (owner read/write only)

2. **User Management**
   - Consider creating a dedicated application user
   - Use sudo for administrative tasks
   - Implement proper user permissions

3. **Regular Maintenance**
   - Daily log rotation
   - Weekly backup verification
   - Monthly security updates
   - Quarterly certificate renewal checks

4. **Monitoring & Alerts**
   - System resource monitoring
   - Application health checks
   - Security event logging
   - Automated alert notifications

### Recent Changes
1. Vercel Configuration
   - Added Git deployment settings
   - Configured environment variables
   - Updated CORS and WebSocket headers
   - Fixed routing configuration

2. Nginx Configuration
   - Rate limiting implemented (10 req/s)
   - Cloudflare IP ranges configured
   - WebSocket proxy settings optimized
   - SSL configuration updated
   - Security headers enhanced
   - Fixed SSL certificate paths
   - Updated health check endpoint
   - Added proper WebSocket upgrade handling
   - Configured proper proxy headers
   - Added security headers (HSTS, CSP, etc.)
   - Added CORS headers for WebSocket connections
   - Improved WebSocket proxy configuration

3. Docker Configuration
   - Updated health check to use correct endpoint
   - Fixed container networking
   - Added proper volume mounts
   - Added SSL certificate volume mounts
   - Exposed port 443 for HTTPS
   - Fixed container health checks
   - Added proper restart policies
   - Configured proper logging
   - Updated backend container configuration

4. SSL & Security
   - Successfully obtained Let's Encrypt certificates
   - Configured auto-renewal
   - Set up proper SSL termination
   - Implemented security headers
   - Configured Cloudflare SSL/TLS settings
   - Added rate limiting
   - Implemented proper CORS policies
   - Enhanced WebSocket security

5. Backend Updates
   - Fixed grid tuple handling in Simulation class
   - Added adjustment_info to SimulationResponse model
   - Updated WebSocket endpoint to handle grid tuples
   - Improved error handling in simulation reset
   - Enhanced WebSocket message handling
   - Added proper CORS headers for WebSocket connections
   - Fixed simulation state management
   - Improved grid initialization handling

### Next Steps
1. Monitoring Setup
   - Implement Prometheus metrics
   - Set up Grafana dashboards
   - Configure alerting
   - Monitor WebSocket connections
   - Track API performance

2. Performance Optimization
   - Fine-tune Cloudflare caching rules
   - Optimize API response times
   - Implement request queuing
   - Monitor resource usage

### Troubleshooting

#### Common Issues

1. API Errors
   - Check backend logs: `docker logs modca_backend`
   - Verify Nginx configuration: `nginx -t`
   - Check Cloudflare status
   - Verify SSL certificates
   - Check container health status: `docker ps`
   - Verify environment variables
   - Check CORS configuration

2. WebSocket Connection Issues
   - Check Cloudflare WebSocket proxy status
   - Verify SSL/TLS settings
   - Check backend WebSocket logs
   - Test direct connection (bypass Cloudflare)
   - Verify Nginx WebSocket configuration
   - Check proxy headers
   - Verify CORS settings
   - Check rate limiting

3. Container Health
   - Check container status: `docker ps`
   - View container logs: `docker logs <container_id>`
   - Check resource usage: `docker stats`
   - Verify health checks: `curl https://ws.janis7ewski.org/health`
   - Check container restart policy
   - Verify volume mounts
   - Check network configuration

4. SSL Issues
   - Check certificate validity: `openssl s_client -connect ws.janis7ewski.org:443`
   - Verify Cloudflare SSL/TLS settings
   - Check Let's Encrypt certificate renewal
   - Verify SSL configuration in Nginx
   - Check certificate paths in docker-compose.yml
   - Verify certificate permissions
   - Check auto-renewal configuration

5. Nginx Issues
   - Check Nginx status: `systemctl status nginx`
   - Verify configuration: `nginx -t`
   - Check error logs: `tail -f /var/log/nginx/error.log`
   - Verify SSL configuration
   - Check proxy settings
   - Verify rate limiting
   - Check security headers

### Useful Commands

```bash
# Check container status
docker compose ps

# View container logs
docker logs modca_backend
docker logs modca_nginx

# Test API endpoints
curl https://ws.janis7ewski.org/api/settings
curl https://ws.janis7ewski.org/health

# Test WebSocket connection
websocat -H="Origin: https://janis7ewski.org" -H="User-Agent: Mozilla/5.0" wss://ws.janis7ewski.org/ws/simulate/<simulation_id>

# Check SSL certificate
openssl s_client -connect ws.janis7ewski.org:443

# View Nginx configuration
cat /etc/nginx/conf.d/modca.conf

# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# View Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Check certificate renewal
certbot certificates

# Test rate limiting
ab -n 100 -c 10 https://ws.janis7ewski.org/health
```

### Repository Structure

```
deployment/
├── config/
│   └── nginx/
│       └── modca.conf
├── scripts/
│   └── test_api_endpoints.sh
├── certbot/
├── maintenance/
├── monitoring/
├── docker-compose.yml
└── DEPLOYMENT.md
```

### Workflow

1. Development
   - Make changes in development branch
   - Test locally
   - Create pull request

2. Deployment
   - Merge changes to deployment branch
   - Push to production
   - Verify deployment
   - Monitor for issues

3. Maintenance
   - Regular security updates
   - SSL certificate renewal
   - Log rotation
   - Backup verification

### Security Considerations

1. SSL/TLS
   - Full (Strict) SSL mode enabled
   - HSTS configured
   - Modern TLS protocols only
   - Strong cipher suites

2. Cloudflare Security
   - DDoS protection enabled
   - WAF rules configured
   - Bot protection active
   - Rate limiting implemented

3. Server Security
   - Regular updates
   - Firewall configured
   - SSH key authentication
   - Limited port exposure

### Performance Monitoring

1. Metrics to Track
   - API response times
   - WebSocket connection stability
   - Resource usage
   - Error rates
   - Cache hit rates

2. Alerts
   - High error rates
   - Resource exhaustion
   - SSL certificate expiration
   - Service unavailability

### Backup Strategy

1. Data Backup
   - Daily database backups
   - Configuration backups
   - SSL certificate backups
   - Log archives

2. Recovery
   - Documented recovery procedures
   - Regular backup testing
   - Disaster recovery plan
   - Service restoration steps

## DNS & SSL Status

### Current DNS Configuration
- ws.janis7ewski.org → 49.13.233.118
- Proxy status: Currently DNS only (ready for Cloudflare proxy)

### SSL Setup Progress
- ✅ Certbot installed
- ✅ Nginx plugin installed
- ✅ Certificate obtained
- ✅ Auto-renewal configured
- ✅ HTTPS working
- ✅ HTTP to HTTPS redirect working
- ✅ Modern SSL ciphers configured

## Container Health Status

### Backend Container
- Status: Running
- Health check: Passing
- Ports: 8000 exposed
- Volumes: Properly mounted

### Nginx Container
- Status: Running
- Configuration: Valid
- Ports: 80, 443 exposed
- SSL: Configured and working
- Rate limiting: Active
- Cloudflare headers: Configured

## Recent API Tests

### Successful Endpoints
1. ✅ `/health` - Health check
2. ✅ `/api/settings` - Settings management
3. ✅ `/api/simulate` - Simulation creation
4. ✅ `/api/simulate/{id}/status` - Status check
5. ✅ `/api/simulate/{id}/step` - Step execution
6. ✅ `/api/recordings` - Recordings list
7. ✅ `/ws` - WebSocket endpoint (accessible)

### Test Results
- All API endpoints returning correct status codes
- WebSocket endpoint properly configured for upgrades
- Rate limiting working as expected
- Health checks passing
- SSL working correctly
- HTTP to HTTPS redirect working
- All endpoints tested over HTTPS
- WebSocket tested over WSS
- Cloudflare headers properly forwarded

## Next Session Tasks

1. Cloudflare Integration
   - Enable proxy
   - Configure SSL/TLS
   - Set up WebSocket proxy
   - Configure caching

2. Monitoring Setup
   - Install monitoring tools
   - Configure metrics collection
   - Set up alerts

# modCA_7web Deployment Documentation

## 1. Repository Structure & Workflow (Summary)

- **dev**: Main integration branch for development and testing.
- **deploy**: Deployment/production branch, updated from tested dev.
- **feature/*, bugfix/*, exp/**: For features, bugfixes, and experiments.
- **master**: (Optional) Stable, tagged releases.

**Directory layout:**
```
modca_7web/
├── backend/      # FastAPI backend
├── frontend/     # Next.js frontend
├── deployment/   # Deployment scripts/configs
├── docs/         # Documentation
├── recordings/   # Simulation recordings
├── .github/      # GitHub Actions, templates
├── ...
```

**Workflow:**
- Develop in feature/bugfix/exp branches, merge to dev via PR.
- Deploy from deploy branch (branched from dev).
- Tag releases on deploy or master.

See `DEVELOPER_DOCUMENTATION.md` for full details.

---

## 2. Technical Specification for Deployment

### 2.1 Architecture

```
                                  Users (Web Browsers)
                                          ↓
                                    Cloudflare CDN
                                          ↓
                                    HTTPS/SSL (443)
                                          ↓
                               janis7ewski.org domain
                                          ↓
                                ┌────────────────────┐
                                │     Vercel Edge    │
                                │   (Next.js Frontend│
                                └──────────┬─────────┘
                                           │
                              ┌────────────▼────────────┐
                              │ Hetzner VPS (Ubuntu)    │
                              │    Linux + Docker       │
                              └────────────┬────────────┘
                                           │
       ┌───────────────────────────────────┴────────────────────────────────────┐
       │                            NGINX Reverse Proxy                         │
       │                           (Listening on 443)                           │
       │                                                                       │
       │   ┌───────────────┐       ┌──────────────────┐        ┌────────────┐  │
       │   │ /api requests │──────►│  FastAPI Backend │◄──────►│  SQLite DB │  │
       │   └───────────────┘       │  Docker Container │        └────────────┘  │
       │                           │  Uvicorn (Gunicorn) │                     │
       │                           └──────────────────┘                        │
       │                                                                       │
       │   ┌───────────────┐                                                 │
       │   │ /ws requests  │──── WebSocket Upgrade ───────────────────────────┘
       │   └───────────────┘
       └───────────────────────────────────────────────────────────────────────┘
```

- **Backend Hosting**: Hetzner VPS (IP: 49.13.233.118), system updated, firewall enabled, Docker & Docker Compose installed.
- **Note:** Docker and Docker Compose are not yet installed. Proceed to the next section for installation instructions.
- **Deployment**: Use Docker Compose for backend and NGINX containers.

### Components
- **Cloudflare CDN**: Handles DNS, SSL termination, DDoS protection, and caching.
- **Vercel Edge (Next.js Frontend)**: Serves the frontend UI and static assets.
- **VPS (Linux + Docker)**: Hosts the backend stack in containers for portability and reproducibility.
- **NGINX Reverse Proxy**: Listens on 443, terminates SSL (if not handled by Cloudflare), and routes requests:
    - `/api` → FastAPI backend (Uvicorn/Gunicorn, Dockerized)
    - `/ws` → FastAPI WebSocket endpoint (WebSocket upgrade supported)
    - `/`   → (optionally) static frontend, if needed
- **FastAPI Backend (Docker Container)**: Runs the simulation API and WebSocket server, connects to SQLite DB.
- **SQLite DB**: Stores simulation settings and recordings, mounted as a Docker volume for persistence.

### Containerization Plan
- **Dockerfile**: Will be added for the FastAPI backend (Python, Uvicorn/Gunicorn, requirements).
- **docker-compose.yml**: Will orchestrate backend and NGINX containers, network, and volumes.
- **NGINX Config**: See `deployment/config/nginx/modca.conf` for production-ready reverse proxy setup.

### Deployment Flow
1. Build and run containers on the VPS using Docker Compose.
2. NGINX listens on 443, proxies API and WebSocket traffic to the backend container.
3. Cloudflare manages SSL, DNS, and security at the edge.
4. Vercel serves the frontend, which communicates with the backend via `/api` and `/ws` endpoints.

### Next Steps
- Add Dockerfile and docker-compose.yml to the repository.
- Document build and deployment commands for the backend stack.
- Ensure persistent storage for SQLite DB via Docker volumes.
- Monitor and tune NGINX and backend performance as needed.

For developer and architecture details, see `../DEVELOPER_DOCUMENTATION.md`.

---

## 8. Docker Compose v2+ Notes and Troubleshooting (Updated)

- The backend is now deployed on Hetzner VPS (49.13.233.118).
- Use the public IP or ws.janis7ewski.org for API/WebSocket endpoint testing.
- All other notes remain as before.

---

## 9. Deployment Validation & Troubleshooting (Updated)

### API Test
- To verify the backend API is working, run:
  curl -i -X POST https://ws.janis7ewski.org/api/simulate -H 'Content-Type: application/json' -d '{...}'
- A 200 OK response with simulation data confirms the backend is healthy and NGINX is proxying correctly.

### WebSocket Test
- The WebSocket endpoint is available at wss://ws.janis7ewski.org/ws/simulate/<simulation_id>
- Use a tool like websocat or a browser-based WebSocket client to connect and interact.

### Healthcheck
- The backend Dockerfile healthcheck now uses /api to match the FastAPI root endpoint.
- If the backend container is 'unhealthy', ensure the healthcheck path matches your API root.

### NGINX Docker Networking
- NGINX proxy_pass directives must use the backend Docker Compose service name (modca_backend:8000), not 127.0.0.1.
- This enables inter-container communication in Docker Compose.

### 502 Bad Gateway Troubleshooting
- If you see 502 errors:
  - Ensure the backend container is healthy (docker compose ps)
  - Check backend logs for import or runtime errors
  - Confirm NGINX is proxying to the correct service name
  - Make sure no system NGINX is running on port 80

---

## Hetzner VPS Deployment Checklist (modCA_7web) (Updated)

- System update and firewall configuration may already be complete.
- **Current production backend IP:** `49.13.233.118`
- Follow the checklist for Docker, DNS, SSL, and Cloudflare proxy as described above.

---

## 10. Current Deployment Status & Debugging Progress (Updated)

### Current Issue
The backend service is failing to start with a `