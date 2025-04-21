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

# Configuration variables
APP_USER="www-data"
APP_GROUP="www-data"
APP_NAME="modca"
DOMAIN="yourdomain.com"  # Replace with actual domain
APP_DIR="/home/ubuntu/modca_7web"
VENV_DIR="$APP_DIR/backend/venv"
LOG_DIR="/var/log/$APP_NAME"
DB_DIR="/var/lib/$APP_NAME/db"
BACKUP_DIR="/var/backups/$APP_NAME"

log "Starting modCA_7web installation..."

# System updates
log "Updating system packages..."
apt update && apt upgrade -y || error "Failed to update system packages"

# Install dependencies
log "Installing system dependencies..."
apt install -y \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    build-essential \
    nginx \
    git \
    redis-server \
    supervisor \
    ufw \
    fail2ban \
    prometheus \
    node-exporter \
    grafana \
    certbot \
    python3-certbot-nginx || error "Failed to install dependencies"

# Configure firewall
log "Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

# Configure fail2ban
log "Configuring fail2ban..."
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl start fail2ban

# Create necessary directories
log "Creating application directories..."
mkdir -p "$LOG_DIR" "$DB_DIR" "$BACKUP_DIR"
chown -R $APP_USER:$APP_GROUP "$LOG_DIR" "$DB_DIR" "$BACKUP_DIR"
chmod 755 "$LOG_DIR" "$DB_DIR" "$BACKUP_DIR"

# Clone repository if not exists
if [ ! -d "$APP_DIR" ]; then
    log "Cloning repository..."
    git clone https://github.com/yourname/modca_7web.git "$APP_DIR"
fi

# Setup Python virtual environment
log "Setting up Python virtual environment..."
cd "$APP_DIR/backend"
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install gunicorn uvicorn[standard] redis prometheus_client

# Copy configuration files
log "Setting up configuration files..."

# Nginx configuration
cp "$APP_DIR/deployment/config/nginx/modca.conf" /etc/nginx/sites-available/modca
ln -sf /etc/nginx/sites-available/modca /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Systemd service
cp "$APP_DIR/deployment/config/systemd/modca.service" /etc/systemd/system/

# Prometheus configuration
cp "$APP_DIR/deployment/config/prometheus/prometheus.yml" /etc/prometheus/

# Setup log rotation
cp "$APP_DIR/deployment/config/logrotate/modca" /etc/logrotate.d/

# Setup environment
log "Setting up environment variables..."
cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
# Note: Manual configuration of .env file required

# Start services
log "Starting services..."
systemctl daemon-reload
systemctl enable --now redis-server
systemctl enable --now prometheus
systemctl enable --now node-exporter
systemctl enable --now grafana-server
systemctl enable --now modca
systemctl enable --now nginx

# Test nginx configuration
nginx -t || error "Nginx configuration test failed"
systemctl restart nginx

log "Installation completed successfully!"
log "Next steps:"
log "1. Configure SSL with: sudo certbot --nginx -d $DOMAIN"
log "2. Edit backend/.env with production values"
log "3. Configure Grafana at http://localhost:3000"
log "4. Set up monitoring alerts"
log "5. Configure backup schedules" 