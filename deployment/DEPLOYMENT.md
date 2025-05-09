# Deployment Documentation

## Current Deployment Status

### URLs
- Frontend: https://www.janis7ewski.org
- WebSocket: wss://ws.janis7ewski.org/ws
- API: https://ws.janis7ewski.org/api

### Frontend Hosting (Vercel)
- Framework: Next.js 14
- Region: fra1 (Frankfurt)
- Branch: prod
- Auto-deployment: Enabled
- Environment Variables:
  - NEXT_PUBLIC_API_URL
  - NEXT_PUBLIC_WS_URL

### Backend Hosting
- VPS: Hetzner Cloud
- IP: 49.13.233.118
- OS: Ubuntu 24.04 LTS
- Docker & Docker Compose
- Nginx as reverse proxy
- Let's Encrypt SSL certificates
- Cloudflare CDN & Security

### Recent Changes
1. Vercel Configuration
   - Added Git deployment settings
   - Configured environment variables
   - Updated CORS and WebSocket headers
   - Fixed routing configuration

2. Nginx Configuration
   - Rate limiting implemented
   - Cloudflare IP ranges configured
   - WebSocket proxy settings optimized
   - SSL configuration updated
   - Security headers enhanced

3. API Testing
   - All endpoints tested and working
   - WebSocket connections verified
   - Cloudflare integration confirmed
   - SSL/TLS working correctly

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

2. WebSocket Connection Issues
   - Check Cloudflare WebSocket proxy status
   - Verify SSL/TLS settings
   - Check backend WebSocket logs
   - Test direct connection (bypass Cloudflare)

3. Container Health
   - Check container status: `docker ps`
   - View container logs: `docker logs <container_id>`
   - Check resource usage: `docker stats`
   - Verify health checks: `curl https://ws.janis7ewski.org/health`

4. SSL Issues
   - Check certificate validity: `openssl s_client -connect ws.janis7ewski.org:443`
   - Verify Cloudflare SSL/TLS settings
   - Check Let's Encrypt certificate renewal
   - Verify SSL configuration in Nginx

### Useful Commands

```bash
# Check container status
docker ps

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

# Check Cloudflare status
curl -I https://ws.janis7ewski.org
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
┌─────────────────┐      ┌──────────────────────┐     ┌──────────────────┐
│    Vercel       │◆◆◆◆◆│      Next.js 14      │◆◆◆◆◆│    FastAPI       │
│(Edge Network)   │      │(Frontend + API Routes)│     │(Uvicorn workers) │
└────┬────────────┘      └──────┬───────────────┘     └────────┬─────────┘
     ↓                          ↓                             ↓
┌────────────┐            ┌───────────┐                ┌──────────────┐
│ CloudFlare │            │  SQLite   │                │   WebSocket  │
│ Analytics  │            │    DB     │                │   Server     │
└────────────┘            └───────────┘                └──────────────┘
```

- Vercel (fra1 region) for frontend (Next.js)
- FastAPI backend (Uvicorn workers)
- SQLite for storage
- WebSocket for real-time
- Cloudflare for DNS, CDN, SSL, DDoS

### 2.2 Vercel & Next.js Configuration
- `vercel.json` and `next.config.js` set for production, security headers, and region
- Environment variables for API and WebSocket URLs

### 2.3 Cloudflare Configuration
- DNS: A record to Vercel, CNAME for www, TXT for verification
- SSL/TLS: Full (Strict)
- Security: Bot Fight, Integrity Check, DDoS
- Performance: HTTP/3, Brotli, Auto Minify
- Page Rules: WebSocket and API bypass cache

---

## 3. Current Deployment Status (Updated)

### URLs
- Frontend: https://www.janis7ewski.org
- WebSocket: wss://ws.janis7ewski.org/ws
- API: https://ws.janis7ewski.org/api

### Backend Hosting
- VPS: Hetzner Cloud (49.13.233.118)
- OS: Ubuntu 24.04 LTS
- Docker: 26.1.3
- Docker Compose: v2.27.0

### Current Progress
- ✅ Project structure reorganized
- ✅ Docker configuration fixed
- ✅ Nginx configuration updated
- ✅ Health check endpoint working
- ✅ API endpoints accessible
- ✅ WebSocket endpoint configured
- ✅ SSL certificates installed and configured
- ✅ Rate limiting configured (10 req/s)
- ✅ Cloudflare IP ranges configured
- ⏳ Cloudflare proxy pending
- ⏳ Monitoring setup pending

## Recent Changes

### SSL Configuration
- Installed Let's Encrypt certificates
- Configured Nginx for HTTPS
- Set up HTTP to HTTPS redirect
- Configured modern SSL ciphers and protocols
- Added SSL certificate auto-renewal

### Nginx Configuration
- Fixed API endpoint routing by preserving `/api` prefix
- Updated WebSocket proxy configuration
- Configured health check endpoint
- Added rate limiting (10 requests per second)
- Added SSL configuration
- Set up HTTP to HTTPS redirect

### Docker Configuration
- Updated health check to use correct endpoint
- Fixed container networking
- Added proper volume mounts
- Added SSL certificate volume mounts
- Exposed port 443 for HTTPS

### API Endpoints
- `/health` - Health check endpoint
- `/api/settings` - Get/save simulation settings
- `/api/simulate` - Start/control simulations
- `/api/recordings` - Manage simulation recordings
- `/ws` - WebSocket connection for real-time updates

## Next Steps

1. SSL Configuration
   - [ ] Install Certbot
   - [ ] Obtain Let's Encrypt certificates
   - [ ] Configure SSL in Nginx
   - [ ] Set up auto-renewal

2. Cloudflare Setup
   - [ ] Enable Cloudflare proxy
   - [ ] Configure SSL/TLS settings
   - [ ] Set up WebSocket proxy
   - [ ] Configure caching rules

3. Monitoring
   - [ ] Set up basic system monitoring
   - [ ] Configure application metrics
   - [ ] Set up alerting
   - [ ] Monitor WebSocket performance

4. Performance Optimization
   - [ ] Tune Nginx settings
   - [ ] Optimize Docker configuration
   - [ ] Configure caching
   - [ ] Set up load balancing if needed

## Troubleshooting

### Common Issues
1. API 404 errors
   - Check if the endpoint exists in FastAPI
   - Verify Nginx proxy configuration
   - Check backend logs

2. WebSocket connection issues
   - Verify WebSocket proxy settings
   - Check SSL configuration
   - Monitor connection limits

3. Container health checks
   - Check container logs
   - Verify endpoint accessibility
   - Review health check configuration

4. SSL Issues
   - Check certificate validity
   - Verify Nginx SSL configuration
   - Check certificate auto-renewal

### Useful Commands
```bash
# Check container status
docker compose ps

# View container logs
docker compose logs -f [service]

# Test API endpoints
curl -v https://ws.janis7ewski.org/api/settings
curl -v https://ws.janis7ewski.org/health

# Test WebSocket
curl -v -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Host: ws.janis7ewski.org" -H "Origin: https://ws.janis7ewski.org" wss://ws.janis7ewski.org/ws

# SSL Certificate Management
certbot --nginx -d ws.janis7ewski.org
certbot renew --dry-run

# Run API test script
cd deployment/scripts
./test_api_endpoints.sh
```

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