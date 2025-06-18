# Deployment Documentation

## ✅ Current Status - OPERATIONAL

### Last Updated: June 18, 2025
- **Frontend**: ✅ Operational (https://www.janis7ewski.org)
- **Backend API**: ✅ Operational (https://ws.janis7ewski.org/api)
- **WebSocket**: ✅ Operational (wss://ws.janis7ewski.org/ws)
- **Database**: ✅ Connected and operational
- **SSL/HTTPS**: ✅ Working via Cloudflare + Let's Encrypt
- **Container Health**: ✅ All containers running and healthy

## Network Architecture

```
Client → Cloudflare (DNS + SSL) → Vercel (Frontend)
                               → Hetzner VPS (Backend)
                                 → Nginx (443)
                                   → FastAPI Backend (8000)
                                     → SQLite DB
```

## Current Deployment Status

### URLs
- **Frontend**: https://www.janis7ewski.org (Vercel)
- **API**: https://ws.janis7ewski.org/api (Hetzner VPS)
- **WebSocket**: wss://ws.janis7ewski.org/ws (Hetzner VPS)
- **Health Check**: https://ws.janis7ewski.org/api/health

### Frontend Hosting (Vercel)
- Framework: Next.js 14
- Region: fra1 (Frankfurt)
- Branch: prod
- Auto-deployment: Enabled
- Environment Variables:
  - NEXT_PUBLIC_API_URL=https://ws.janis7ewski.org/api
  - NEXT_PUBLIC_WS_URL=wss://ws.janis7ewski.org/ws

### Backend Hosting (Hetzner VPS)
- **IP**: 135.181.111.66
- **OS**: Ubuntu 24.04 LTS
- **Containers**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt certificates
- **CDN**: Cloudflare (Proxied)

### Container Status
- **Backend Container** (`modca_backend`): ✅ Running and healthy
- **Nginx Container** (`modca_nginx`): ✅ Running on ports 80/443
- **Database**: ✅ SQLite persistent storage
- **Network**: `modca_net` bridge network

## VPS Access & Management

### SSH Access
- **User**: `modca` (not root)
- **Command**: `ssh -i ~/.ssh/modca_vps modca@135.181.111.66`
- **Project Directory**: `/home/modca/modca_7web`
- **Key Requirements**:
  - Key file: `~/.ssh/modca_vps`
  - Permissions: 600 (`chmod 600 ~/.ssh/modca_vps`)
  - Key type: RSA

### Container Management
```bash
# Check container status
docker-compose ps

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs backend
docker-compose logs nginx

# Restart services
docker-compose restart
```

## Docker Configuration

### docker-compose.yml Structure
```yaml
services:
  backend:
    build: ./backend
    container_name: modca_backend
    expose: ["8000"]  # Internal network only
    networks: [modca_net]
    volumes: ["./backend/sqlite_data:/app/sqlite_data"]
    
  nginx:
    image: nginx:1.25-alpine
    container_name: modca_nginx
    ports: ["80:80", "443:443"]  # Public access
    networks: [modca_net]
    volumes:
      - ./config/nginx:/etc/nginx/conf.d
      - /etc/letsencrypt/live/ws.janis7ewski.org/fullchain.pem:/etc/letsencrypt/live/ws.janis7ewski.org/fullchain.pem:ro
      - /etc/letsencrypt/live/ws.janis7ewski.org/privkey.pem:/etc/letsencrypt/live/ws.janis7ewski.org/privkey.pem:ro
```

### Key Configuration Notes
- **Backend**: Uses `expose: "8000"` (not `ports`) for internal Docker network only
- **Nginx**: Proxies to `backend:8000` using Docker service name
- **SSL**: Let's Encrypt certificates mounted from host
- **Network**: Both containers on `modca_net` bridge network

## Nginx Configuration

### Proxy Configuration
```nginx
# API endpoints
location /api/ {
    proxy_pass http://backend:8000/api/;
    # ... headers and settings
}

# WebSocket endpoint
location /ws/simulate/ {
    proxy_pass http://backend:8000/ws/simulate/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    # ... CORS and headers
}
```

### Security Features
- **Rate Limiting**: 10 req/s per IP
- **Cloudflare Integration**: Real IP detection
- **Security Headers**: HSTS, CSP, XSS protection
- **CORS**: Configured for frontend domain
- **SSL**: TLS 1.2/1.3 with modern ciphers

## DNS & Cloudflare Configuration

### DNS Records (Cloudflare)
- **A Record**: `ws.janis7ewski.org` → `135.181.111.66` (Proxied ☁️)
- **A Record**: `api.janis7ewski.org` → `135.181.111.66` (Proxied ☁️)
- **A Record**: `janis7ewski.org` → `135.181.111.66` (Proxied ☁️)
- **CNAME**: `www` → `cname.vercel-dns.com` (Proxied ☁️)

### Cloudflare Settings
- **SSL/TLS**: Full (Strict)
- **Proxy Status**: Enabled (Orange Cloud)
- **WebSocket**: Enabled
- **Security**: DDoS protection, WAF enabled

## Git Workflow & Branch Strategy

### Branch Structure
- **`prod`**: Main production branch
  - Frontend auto-deploys to Vercel
  - Source for VPS backend
  - Tagged for releases
- **`dev`**: Development integration
- **`vps-deploy`**: VPS-specific branch (if needed)
- **`master`**: Stable releases

### Deployment Process
1. **Development**: Work in feature branches → merge to `dev`
2. **Testing**: Test in `dev` environment
3. **Production**: Merge `dev` → `prod`
4. **VPS Update**:
   ```bash
   # On VPS
   cd /home/modca/modca_7web
   git fetch origin
   git pull origin prod
   docker-compose down
   docker-compose up -d
   ```

## Monitoring & Health Checks

### Health Check Endpoints
- **API Health**: https://ws.janis7ewski.org/api/health
- **Container Health**: `docker-compose ps`
- **Nginx Status**: `curl -I https://ws.janis7ewski.org`

### Log Monitoring
```bash
# Backend logs
docker logs modca_backend --tail 50 -f

# Nginx logs
docker logs modca_nginx --tail 50 -f

# System logs
sudo journalctl -u docker -f
```

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. "521 Web server is down" Error
**Cause**: Nginx container not running
**Solution**:
```bash
cd /home/modca/modca_7web
docker-compose up -d
docker-compose ps  # Verify both containers running
```

#### 2. Frontend Cannot Connect to Backend
**Symptoms**: API calls fail, WebSocket connections fail
**Diagnosis**:
```bash
# Test API connectivity
curl -i https://ws.janis7ewski.org/api/health

# Check container status
docker-compose ps

# Check logs
docker-compose logs nginx
docker-compose logs backend
```

#### 3. SSL Certificate Issues
**Check Certificate**:
```bash
openssl s_client -connect ws.janis7ewski.org:443 -servername ws.janis7ewski.org
```

#### 4. Container Networking Issues
**Verify Internal Connectivity**:
```bash
# From nginx container to backend
docker exec modca_nginx wget -qO- http://backend:8000/api/health
```

### Diagnostic Commands
```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Network inspection
docker network ls
docker network inspect modca_7web_modca_net

# Port bindings
docker port modca_nginx
```

## Security Considerations

### SSL/TLS
- **Certificates**: Let's Encrypt (auto-renewal configured)
- **Protocols**: TLS 1.2/1.3 only
- **Ciphers**: Modern, secure cipher suites
- **HSTS**: Configured for security

### Access Control
- **SSH**: Key-based authentication only
- **Firewall**: UFW enabled, ports 22/80/443 open
- **User**: Non-root `modca` user for operations
- **Docker**: Rootless where possible

### Regular Maintenance
- **Updates**: Monthly security updates
- **Certificates**: Auto-renewal (Let's Encrypt)
- **Backups**: Database and configuration backups
- **Monitoring**: Log rotation and cleanup

## Backup & Recovery

### Database Backup
```bash
# Manual backup
cd /home/modca/modca_7web
cp -r backend/sqlite_data/ backup_$(date +%Y%m%d)/
```

### Configuration Backup
```bash
# Backup critical configs
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
    docker-compose.yml \
    config/ \
    deployment/
```

## Performance Optimization

### Current Performance
- **API Response Time**: < 100ms (local)
- **WebSocket Latency**: < 50ms
- **SSL Handshake**: < 200ms via Cloudflare
- **Container Resources**: Low utilization

### Monitoring Metrics
- **Container Memory**: < 512MB per container
- **CPU Usage**: < 10% under normal load
- **Disk I/O**: Minimal (SQLite operations)
- **Network**: Cloudflare CDN acceleration

---

## Quick Reference

### Essential Commands
```bash
# SSH to VPS
ssh -i ~/.ssh/modca_vps modca@135.181.111.66

# Navigate to project
cd /home/modca/modca_7web

# Check status
docker-compose ps

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Test connectivity
curl https://ws.janis7ewski.org/api/health
```

### Emergency Contacts & Resources
- **VPS Provider**: Hetzner Cloud
- **DNS/CDN**: Cloudflare
- **Frontend**: Vercel
- **SSL**: Let's Encrypt

---

*Last verified: June 18, 2025 - All systems operational*
