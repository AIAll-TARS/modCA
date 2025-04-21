## Technical Specification for Deploying `modCA_7web` to the Web

### I. Goal
Deploy `modCA_7web`, a locally running simulation platform, to a publicly accessible, secure, production-grade web environment with full backend/frontend functionality, real-time simulation, and persistent storage.

---

### II. Target Architecture

```
                                   Users (Web Browsers)
                                           ↓
                                    CloudFlare (CDN)
                                           ↓
                                         HTTPS
                                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer (Optional)                  │
└───────────────────────────────┬─────────────────────────────────┘
                                ↓
┌─────────────────┐      ┌──────────────┐     ┌──────────────────┐
│    NGINX        │◆◆◆◆◆│   Gunicorn   │◆◆◆◆◆│    FastAPI       │
│(Reverse Proxy)  │      │(ASGI server) │     │(Uvicorn workers) │
└────┬────────────┘      └──────┬───────┘     └────────┬─────────┘
     ↓                          ↓                       ↓
┌────────────┐            ┌───────────┐          ┌───────────┐
│  Next.js   │            │  SQLite   │          │  Redis    │
│  Frontend  │            │    DB     │          │ (Cache)   │
└────────────┘            └───────────┘          └───────────┘
     ↓
Static Assets
(S3/CloudFront)
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
    build-essential nginx git redis-server \
    supervisor ufw fail2ban -y

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# Configure fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
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
pip install gunicorn uvicorn[standard] redis

# Create production config
cp .env.example .env
nano .env  # Set production values
```

#### 4. Gunicorn Configuration
Create `/etc/systemd/system/modca.service`:
```ini
[Unit]
Description=modCA Web Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/home/ubuntu/modca_7web/backend
Environment="PATH=/home/ubuntu/modca_7web/backend/venv/bin"
Environment="PYTHONPATH=/home/ubuntu/modca_7web/backend"
Environment="PRODUCTION=true"
ExecStart=/home/ubuntu/modca_7web/backend/venv/bin/gunicorn \
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
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo mkdir -p /var/log/modca
sudo chown -R www-data:www-data /var/log/modca
sudo systemctl daemon-reload
sudo systemctl enable modca
sudo systemctl start modca
```

---

### IV. Frontend Deployment

#### Option A: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
   ```
4. Deploy

#### Option B: Self-hosted
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

#### 1. Base Configuration
Create `/etc/nginx/sites-available/modca`:
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
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' wss:;";

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
    location /api {
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

#### 2. Enable and Test
```bash
sudo ln -s /etc/nginx/sites-available/modca /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3. SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### VI. Environment Configuration

#### 1. Backend (.env)
```env
# Application
PRODUCTION=true
DEBUG=false
API_PORT=8000
ALLOWED_HOSTS=yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# Security
SECRET_KEY=your-secure-secret-key
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Logging
LOG_LEVEL=WARNING
LOG_FILE=/var/log/modca/app.log
```

#### 2. Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws
```

---

### VII. Database Management

#### Current SQLite Setup
```bash
# Set permissions
sudo mkdir -p /var/lib/modca/db
sudo mv backend/settings.db /var/lib/modca/db/
sudo chown -R www-data:www-data /var/lib/modca
sudo chmod 755 /var/lib/modca
sudo chmod 640 /var/lib/modca/db/settings.db

# Backup script (/etc/cron.daily/modca-backup)
#!/bin/bash
BACKUP_DIR="/var/backups/modca"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR
sqlite3 /var/lib/modca/db/settings.db ".backup '$BACKUP_DIR/settings_$DATE.db'"
find $BACKUP_DIR -type f -mtime +7 -delete
```

#### Future PostgreSQL Migration Plan
1. Create migration scripts
2. Set up PostgreSQL
3. Test migration process
4. Schedule maintenance window
5. Execute migration
6. Verify data integrity

---

### VIII. Monitoring & Maintenance

#### 1. System Monitoring
```bash
# Install monitoring tools
sudo apt install prometheus node-exporter grafana

# Configure Prometheus for modCA metrics
# /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: 'modca'
    static_configs:
      - targets: ['localhost:8000']
```

#### 2. Log Management
```bash
# Install log rotation
sudo nano /etc/logrotate.d/modca
/var/log/modca/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload modca
    endscript
}
```

#### 3. Backup Strategy
- Daily SQLite backups
- Weekly full system backups
- Regular configuration backups
- Automated cleanup of old backups

#### 4. Monitoring Endpoints
- `/health`: Basic health check
- `/metrics`: Prometheus metrics
- `/status`: Detailed system status

---

### IX. Deployment Structure

```
deployment/
├── README.md                 # Deployment documentation
├── scripts/
│   ├── install.sh           # Installation script
│   ├── backup.sh            # Backup script
│   └── update.sh            # Update script
├── config/
│   ├── nginx/
│   │   └── modca.conf       # NGINX configuration
│   ├── systemd/
│   │   └── modca.service    # Systemd service
│   └── prometheus/
│       └── prometheus.yml   # Prometheus config
├── monitoring/
│   └── grafana/
│       └── dashboards/      # Grafana dashboards
└── maintenance/
    ├── backup_restore.md    # Backup/restore procedures
    └── troubleshooting.md   # Troubleshooting guide
```

---

### X. Security Measures

1. **Application Security**
   - Rate limiting
   - Input validation
   - CORS restrictions
   - Security headers
   - HTTPS only
   - WebSocket security

2. **System Security**
   - Fail2ban
   - UFW firewall
   - Regular updates
   - Secure file permissions
   - Limited service accounts

3. **Monitoring & Alerts**
   - Resource monitoring
   - Error rate alerts
   - Security event logging
   - Uptime monitoring

---

### XI. Scaling Considerations

1. **Horizontal Scaling**
   - Load balancer configuration
   - Session management
   - WebSocket clustering
   - Static asset CDN

2. **Vertical Scaling**
   - CPU optimization
   - Memory management
   - Database tuning
   - Cache optimization

---

### XII. Disaster Recovery

1. **Backup Systems**
   - Database backups
   - Configuration backups
   - Log archives
   - System state backups

2. **Recovery Procedures**
   - Service restoration
   - Data recovery
   - Configuration restoration
   - Verification procedures

---

### Summary
- Production-ready deployment with security focus
- Scalable architecture with monitoring
- Comprehensive backup and recovery
- Detailed documentation and maintenance procedures
- Future-proof design with upgrade paths
