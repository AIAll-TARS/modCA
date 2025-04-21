## Technical Specification for Deploying `modCA_7web` to the Web

### I. Goal
Deploy `modCA_7web`, a locally running simulation platform, to a publicly accessible, secure, production-grade web environment with full backend/frontend functionality, real-time simulation, and persistent storage.

---

### II. Current Architecture

```
                                   Users (Web Browsers)
                                           ↓
                                         HTTP
                                           ↓
┌─────────────────┐      ┌──────────────┐     ┌──────────────────┐
│    NGINX        │◆◆◆◆◆│   Gunicorn   │◆◆◆◆◆│    FastAPI       │
│(Reverse Proxy)  │      │(ASGI server) │     │(Uvicorn workers) │
└────┬────────────┘      └──────┬───────┘     └────────┬─────────┘
     ↓                          ↓                       ↓
┌────────────┐            ┌───────────┐
│  Next.js   │            │  SQLite   │
│  Frontend  │            │    DB     │
└────────────┘            └───────────┘

Future Additions Planned:
- CloudFlare CDN
- HTTPS/SSL
- Redis Cache
- S3/CloudFront for static assets
- Load Balancer (if needed)
```

---

### III. Backend Deployment

#### 1. Server Requirements
- Ubuntu 24.04 LTS (recommended) or 22.04 LTS
- Minimum 2 vCPUs, 4GB RAM
- 20GB SSD storage
- Python 3.12+ (primary) or 3.8+ (fallback)

#### 2. System Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3.12 python3.12-venv python3.12-dev \
    build-essential nginx git -y

# Additional security packages (TODO):
# sudo apt install redis-server supervisor ufw fail2ban -y

# TODO: Configure firewall
# sudo ufw allow 'Nginx Full'
# sudo ufw allow OpenSSH
# sudo ufw enable

# TODO: Configure fail2ban
# sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
# sudo systemctl enable fail2ban
# sudo systemctl start fail2ban
```

#### 3. Backend Application Setup
```bash
# Clone repository
git clone https://github.com/yourname/modca_7web.git
cd modca_7web/backend

# Setup virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install gunicorn uvicorn[standard]

# TODO: Add Redis when implemented
# pip install redis
```

#### 4. Gunicorn Configuration
Create `/etc/systemd/system/modca.service`:
```ini
[Unit]
Description=modCA Web Application
After=network.target

[Service]
Type=simple
User=aiall
Group=aiall
WorkingDirectory=/home/aiall/projects/modca_7web/backend
Environment="PATH=/home/aiall/projects/modca_7web/backend/venv/bin:/usr/bin"
Environment="PYTHONPATH=/home/aiall/projects/modca_7web/backend"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/home/aiall/projects/modca_7web/backend/venv/bin/gunicorn \
    -k uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --timeout 120 \
    --keep-alive 5 \
    --log-level warning \
    --access-logfile /var/log/modca/access.log \
    --error-logfile /var/log/modca/error.log \
    app.main:app
Restart=always
RestartSec=1

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo mkdir -p /var/log/modca
sudo chown -R aiall:aiall /var/log/modca
sudo systemctl daemon-reload
sudo systemctl enable modca
sudo systemctl start modca
```

---

### IV. Frontend Deployment

Current Status: Development Mode
TODO: Implement one of the following options:

#### Option A: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
   ```
4. Deploy

#### Option B: Self-hosted with PM2
```bash
# Build frontend
cd frontend
npm install
npm run build

# Install PM2 for process management
npm install -g pm2

# Create PM2 config (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'modca-frontend',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### V. NGINX Configuration

Current implementation (HTTP only, SSL pending):
```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=modca_limit:10m rate=10r/s;

# Upstream for WebSocket
upstream websocket {
    server 127.0.0.1:8000;
    keepalive 32;
}

# Main server block
server {
    listen 80;
    listen [::]:80;
    server_name localhost;  # Change this to your domain when deploying to production

    # Frontend proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=modca_limit burst=20 nodelay;
    }

    # API proxy
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket specific timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Deny access to . files
    location ~ /\. {
        deny all;
    }
}
```

TODO: Add SSL configuration:
```nginx
# SSL configuration to be added
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# Security headers to be added
add_header Strict-Transport-Security "max-age=63072000" always;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' wss:;";
```

---

### VI. Monitoring and Logging

Current Status:
- Backend logs: `/var/log/modca/`
- Nginx logs: `/var/log/nginx/`
- Frontend: Console output (development mode)

TODO:
1. Set up log rotation
2. Configure monitoring
3. Implement health checks
4. Set up alerts

---

### VII. Backup Strategy

TODO:
1. Database backup configuration
2. Code backup strategy
3. Log backup strategy
4. Backup testing procedures
