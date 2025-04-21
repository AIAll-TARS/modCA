# modCA_7web Current Deployment Status

## Overview
This document tracks the current deployment status of the modCA_7web application as of April 21, 2025.

## Components Status

### 1. Backend Service (✓ OPERATIONAL)
- **Status**: Running
- **Service**: Systemd managed (`modca.service`)
- **Implementation**:
  - Using Gunicorn with Uvicorn workers
  - 4 worker processes
  - Running on `127.0.0.1:8000`
  - Running as user `aiall`
  - Auto-restart enabled
  - Environment properly configured
  - Logging to `/var/log/modca/`

Current systemd configuration:
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

### 2. Frontend Service (⚠️ DEVELOPMENT MODE)
- **Status**: Running in development mode
- **Service**: Manual start (not systemd managed)
- **Port**: 3000
- **Mode**: Development (`next dev`)
- **Required Actions**: 
  1. Production Build Setup:
     ```bash
     cd frontend
     npm run build
     ```
  2. Process Management (Option A - PM2):
     ```bash
     # Install PM2
     npm install -g pm2
     
     # Create ecosystem.config.js
     cat > ecosystem.config.js << EOL
     module.exports = {
       apps: [{
         name: 'modca-frontend',
         script: 'npm',
         args: 'start',
         cwd: '/home/aiall/projects/modca_7web/frontend',
         env: {
           NODE_ENV: 'production',
           PORT: 3000
         },
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: '1G',
         env_production: {
           NODE_ENV: 'production'
         }
       }]
     }
     EOL
     
     # Start with PM2
     pm2 start ecosystem.config.js
     pm2 save
     pm2 startup
     ```
  3. Process Management (Option B - Systemd):
     ```ini
     # /etc/systemd/system/modca-frontend.service
     [Unit]
     Description=modCA Web Frontend
     After=network.target
     
     [Service]
     Type=simple
     User=aiall
     Group=aiall
     WorkingDirectory=/home/aiall/projects/modca_7web/frontend
     Environment=NODE_ENV=production
     Environment=PORT=3000
     Environment=NEXT_PUBLIC_API_URL=http://localhost/api
     Environment=NEXT_PUBLIC_WS_URL=ws://localhost/ws
     ExecStart=/usr/bin/npm start
     Restart=always
     RestartSec=1
     
     [Install]
     WantedBy=multi-user.target
     ```

### 3. Nginx Reverse Proxy (✓ OPERATIONAL)
- **Status**: Configured and running
- **Configuration**: `/etc/nginx/sites-available/modca`
- **Features Implemented**:
  - Frontend proxy (port 3000)
  - Backend API proxy (port 8000)
  - WebSocket support
  - Rate limiting (10r/s with burst)
  - Security headers
  - Dot-file protection

Current routing configuration:
- Frontend: `http://localhost/` → `http://127.0.0.1:3000`
- API: `http://localhost/api/` → `http://127.0.0.1:8000`
- WebSocket: `ws://localhost/ws` → `ws://127.0.0.1:8000`

## Detailed Implementation Tasks

### 1. Frontend Production Deployment
1. **Environment Configuration**:
   ```bash
   # Create .env.production
   cat > frontend/.env.production << EOL
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws
   NODE_ENV=production
   EOL
   ```

2. **Build Process**:
   ```bash
   cd frontend
   npm ci  # Clean install of dependencies
   npm run build
   ```

3. **Static Asset Optimization**:
   - Implement image optimization in `next.config.js`
   - Configure CDN if needed
   - Set up caching headers in Nginx

4. **Monitoring Setup**:
   - Add health check endpoint
   - Configure error tracking
   - Set up performance monitoring

### 2. SSL/HTTPS Implementation
1. **Certificate Installation**:
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx

   # Obtain certificate
   sudo certbot --nginx -d yourdomain.com

   # Configure auto-renewal
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer
   ```

2. **Nginx SSL Configuration**:
   ```nginx
   # SSL configuration
   ssl_protocols TLSv1.2 TLSv1.3;
   ssl_prefer_server_ciphers off;
   ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
   ssl_session_timeout 1d;
   ssl_session_cache shared:SSL:50m;
   ssl_session_tickets off;
   ssl_stapling on;
   ssl_stapling_verify on;
   ```

3. **Security Headers**:
   ```nginx
   add_header Strict-Transport-Security "max-age=63072000" always;
   add_header X-Frame-Options DENY;
   add_header X-Content-Type-Options nosniff;
   add_header X-XSS-Protection "1; mode=block";
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' wss:;";
   ```

### 3. Logging and Monitoring Setup
1. **Log Rotation Configuration**:
   ```bash
   # Create logrotate configuration
   sudo cat > /etc/logrotate.d/modca << EOL
   /var/log/modca/*.log {
       daily
       rotate 14
       compress
       delaycompress
       notifempty
       create 0640 aiall aiall
       sharedscripts
       postrotate
           systemctl reload modca
       endscript
   }
   EOL
   ```

2. **Monitoring Setup**:
   - Install Prometheus and Node Exporter:
     ```bash
     sudo apt install prometheus prometheus-node-exporter
     ```
   - Configure Prometheus targets:
     ```yaml
     # /etc/prometheus/prometheus.yml
     scrape_configs:
       - job_name: 'modca'
         static_configs:
           - targets: ['localhost:8000']
     ```
   - Install and configure Grafana:
     ```bash
     sudo apt install grafana
     sudo systemctl enable grafana-server
     sudo systemctl start grafana-server
     ```

3. **Health Checks Implementation**:
   ```python
   # Backend health check endpoint
   @app.get("/health")
   async def health_check():
       return {
           "status": "healthy",
           "timestamp": datetime.now().isoformat(),
           "version": "1.0.0",
           "components": {
               "database": check_db_connection(),
               "workers": check_workers_status(),
               "memory_usage": get_memory_usage()
           }
       }
   ```

### 4. Backup Strategy
1. **Database Backup**:
   ```bash
   # Create backup script
   cat > /usr/local/bin/modca-backup << EOL
   #!/bin/bash
   BACKUP_DIR="/var/backups/modca"
   DATE=$(date +%Y%m%d)
   mkdir -p $BACKUP_DIR
   
   # Backup SQLite database
   sqlite3 /path/to/your/database.db ".backup '$BACKUP_DIR/db_$DATE.sqlite'"
   
   # Compress backup
   gzip $BACKUP_DIR/db_$DATE.sqlite
   
   # Remove backups older than 30 days
   find $BACKUP_DIR -name "db_*.sqlite.gz" -mtime +30 -delete
   EOL
   
   # Make executable
   chmod +x /usr/local/bin/modca-backup
   
   # Add to crontab
   echo "0 2 * * * /usr/local/bin/modca-backup" | sudo tee -a /etc/crontab
   ```

2. **Code Backup**:
   ```bash
   # Create code backup script
   cat > /usr/local/bin/modca-code-backup << EOL
   #!/bin/bash
   BACKUP_DIR="/var/backups/modca/code"
   DATE=$(date +%Y%m%d)
   mkdir -p $BACKUP_DIR
   
   # Backup code
   cd /home/aiall/projects/modca_7web
   git archive --format=tar.gz -o $BACKUP_DIR/code_$DATE.tar.gz HEAD
   
   # Remove backups older than 7 days
   find $BACKUP_DIR -name "code_*.tar.gz" -mtime +7 -delete
   EOL
   
   # Make executable
   chmod +x /usr/local/bin/modca-code-backup
   
   # Add to crontab
   echo "0 3 * * * /usr/local/bin/modca-code-backup" | sudo tee -a /etc/crontab
   ```

3. **Log Backup**:
   ```bash
   # Create log backup script
   cat > /usr/local/bin/modca-log-backup << EOL
   #!/bin/bash
   BACKUP_DIR="/var/backups/modca/logs"
   DATE=$(date +%Y%m%d)
   mkdir -p $BACKUP_DIR
   
   # Backup logs
   tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /var/log/modca/
   
   # Remove backups older than 14 days
   find $BACKUP_DIR -name "logs_*.tar.gz" -mtime +14 -delete
   EOL
   
   # Make executable
   chmod +x /usr/local/bin/modca-log-backup
   
   # Add to crontab
   echo "0 4 * * * /usr/local/bin/modca-log-backup" | sudo tee -a /etc/crontab
   ```

### 5. Security Enhancements
1. **Firewall Configuration**:
   ```bash
   # Configure UFW
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

2. **Fail2ban Setup**:
   ```bash
   # Install fail2ban
   sudo apt install fail2ban
   
   # Configure fail2ban
   sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
   sudo cat > /etc/fail2ban/jail.d/custom.conf << EOL
   [nginx-http-auth]
   enabled = true
   port = http,https
   logpath = /var/log/nginx/error.log
   
   [nginx-limit-req]
   enabled = true
   port = http,https
   logpath = /var/log/nginx/error.log
   EOL
   
   # Start fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. **Security Scanning**:
   ```bash
   # Install security scanning tools
   sudo apt install rkhunter lynis
   
   # Run security scans
   sudo rkhunter --check
   sudo lynis audit system
   ```

## Implementation Order
1. Frontend Production Setup
2. SSL/HTTPS Configuration
3. Logging Setup
4. Monitoring Implementation
5. Backup Strategy
6. Security Enhancements

## Verification Checklist
- [ ] Frontend builds successfully in production mode
- [ ] SSL certificates are installed and auto-renewing
- [ ] Logs are rotating properly
- [ ] Monitoring is capturing metrics
- [ ] Backups are running and verified
- [ ] Security measures are in place and tested

## Notes
- All paths and configurations assume current project structure
- Adjust usernames, paths, and domain names as needed
- Test each component in staging before production
- Document any deviations from these procedures 