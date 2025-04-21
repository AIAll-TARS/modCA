#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Log function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root"
fi

# Configuration
APP_NAME="modca"
APP_USER="modca"
APP_GROUP="modca"
APP_DIR="/home/aiall/projects/modca_7web"
BACKEND_DIR="$APP_DIR/backend"
VENV_DIR="$BACKEND_DIR/venv"
LOG_DIR="/var/log/$APP_NAME"
DB_DIR="/var/lib/$APP_NAME/db"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Create necessary directories
log "Creating necessary directories..."
mkdir -p "$LOG_DIR" "$DB_DIR"

# Create service user if not exists
log "Setting up service user..."
id -u $APP_USER &>/dev/null || useradd -r -s /bin/false $APP_USER

# Set up Python virtual environment
log "Setting up Python virtual environment..."
cd "$BACKEND_DIR"
python3.12 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install gunicorn uvicorn[standard] redis

# Set correct permissions
log "Setting permissions..."
chown -R $APP_USER:$APP_GROUP "$LOG_DIR" "$DB_DIR"
chown -R $APP_USER:$APP_GROUP "$BACKEND_DIR"
chmod -R 755 "$BACKEND_DIR"
chmod -R 755 "$LOG_DIR" "$DB_DIR"

# Create systemd service
log "Creating systemd service..."
cat > /etc/systemd/system/$APP_NAME.service << EOL
[Unit]
Description=modCA Web Application
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$VENV_DIR/bin:/usr/bin"
Environment="PYTHONPATH=$BACKEND_DIR"
Environment="PYTHONUNBUFFERED=1"
Environment="PRODUCTION=true"
ExecStart=$VENV_DIR/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=1

[Install]
WantedBy=multi-user.target
EOL

# Set correct permissions for service file
chmod 600 /etc/systemd/system/$APP_NAME.service

# Set up Nginx
log "Setting up Nginx..."
cat > "$NGINX_AVAILABLE/$APP_NAME" << EOL
# Rate limiting zone
limit_req_zone \$binary_remote_addr zone=modca_limit:10m rate=10r/s;

# Upstream for WebSocket
upstream websocket {
    server 127.0.0.1:8000;
    keepalive 32;
}

# Main server block
server {
    listen 80;
    listen [::]:80;
    server_name localhost;

    # Frontend proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Rate limiting
        limit_req zone=modca_limit burst=20 nodelay;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

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
EOL

# Enable site
ln -sf "$NGINX_AVAILABLE/$APP_NAME" "$NGINX_ENABLED/"
rm -f "$NGINX_ENABLED/default"

# Test Nginx configuration
nginx -t || error "Nginx configuration test failed"

# Start services
log "Starting services..."
systemctl daemon-reload
systemctl enable $APP_NAME
systemctl start $APP_NAME
systemctl restart nginx

# Verify services
log "Verifying services..."
systemctl is-active --quiet $APP_NAME || error "modCA service failed to start"
systemctl is-active --quiet nginx || error "Nginx service failed to start"

log "Deployment completed successfully!"
log "Please check the application at http://localhost"
log "Monitor the logs with: journalctl -u $APP_NAME -f" 