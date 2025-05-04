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

## 3. Current Deployment Status

- **Frontend URL**: https://janis7ewski.org
- **WebSocket URL**: wss://janis7ewski.org/ws
- **API URL**: https://janis7ewski.org/api
- **Build Status**: ✅ Successful (Vercel)
- **Monitoring**: Cloudflare & Vercel analytics enabled
- **Security**: SSL/TLS, DDoS, security headers
- **Known Issues**: Vercel reverse proxy warning (expected), some npm deprecation notices (non-critical)
- **Next Steps**: Monitor WebSocket, caching, security audits, performance tuning

---

## 4. Domain & DNS Information

- **Domain Name**: janis7ewski.org
- **Registrar**: Cloudflare, Inc.
- **DNS Provider**: Cloudflare
- **Nameservers**: aldo.ns.cloudflare.com, venus.ns.cloudflare.com
- **DNS Records:**
  - A @ → 76.76.21.21 (proxied)
  - CNAME www → cname.vercel-dns.com (proxied)
  - TXT _vercel → [verification] (DNS only)
- **SSL Certificate**: Managed by Cloudflare
- **Domain Control Panel**: https://dash.cloudflare.com
- **Admin Contact**: AIAll@janis7ewski.org
- **Registration Date**: April 21, 2025
- **Expiration Date**: April 21, 2026
- **Auto-Renewal**: Enabled

---

## 5. Monitoring & Security

- **Cloudflare Analytics**: Traffic, security, performance
- **Vercel Analytics**: Build, edge, runtime
- **Security Features**:
  - DDoS Protection
  - SSL/TLS (Full Strict)
  - Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
  - Content-Security-Policy
- **Performance**:
  - HTTP/3, Brotli, Auto Minify
  - WebSocket support

---

## 6. Known Issues & Next Steps

- Vercel reverse proxy warning (expected with Cloudflare)
- Some npm package deprecation notices (non-critical)
- **Next Steps:**
  1. Monitor WebSocket performance
  2. Watch for caching issues
  3. Regular security audits
  4. Performance optimization if needed

---

## 7. Containerized Backend Deployment (Docker & NGINX)

### Updated Backend Architecture

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
                              │ VPS (Hetzner/DO/EC2...) │
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

### 8. Docker Compose v2+ Notes and Troubleshooting

- The `version` attribute has been removed from `docker-compose.yml` for compatibility with Docker Compose v2+ (recommended by Docker).
- The backend service sets `COMPOSE_BAKE=true` to enable buildx bake for faster, more efficient builds.
- If you see a warning about the version attribute, ensure you are using Docker Compose v2 and that the `version` line is removed.
- If you encounter a port 80 conflict, ensure no other service (such as system NGINX) is running on port 80: `sudo systemctl stop nginx`.
- If you see Docker permission errors, make sure your user is in the `docker` group and you have logged out and back in after running `sudo usermod -aG docker $USER`.

---

## 9. Deployment Validation & Troubleshooting

### API Test
- To verify the backend API is working, run:
  curl -i -X POST http://localhost/api/simulate -H 'Content-Type: application/json' -d '{...}'
- A 200 OK response with simulation data confirms the backend is healthy and NGINX is proxying correctly.

### WebSocket Test
- The WebSocket endpoint is available at ws://<your-domain-or-ip>/ws/simulate/<simulation_id>
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