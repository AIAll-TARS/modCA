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

# Configuration
APP_NAME="modca"
APP_DIR="/home/ubuntu/modca_7web"
VENV_DIR="$APP_DIR/backend/venv"
BACKUP_SCRIPT="$APP_DIR/deployment/scripts/backup.sh"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root"
fi

# Create backup before update
log "Creating backup before update..."
if [ -f "$BACKUP_SCRIPT" ]; then
    bash "$BACKUP_SCRIPT" || error "Backup failed"
else
    error "Backup script not found at $BACKUP_SCRIPT"
fi

# Update repository
log "Updating repository..."
cd "$APP_DIR"
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
UPSTREAM_COMMIT=$(git rev-parse @{u})

if [ "$CURRENT_COMMIT" = "$UPSTREAM_COMMIT" ]; then
    warn "Already up to date"
    exit 0
fi

# Stash any local changes
git stash

# Pull updates
log "Pulling updates..."
git pull origin main || error "Failed to pull updates"

# Update backend
log "Updating backend dependencies..."
cd "$APP_DIR/backend"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install --upgrade gunicorn uvicorn[standard] redis prometheus_client

# Update frontend
log "Updating frontend dependencies..."
cd "$APP_DIR/frontend"
npm install
npm run build

# Update configuration files if needed
log "Checking for configuration updates..."
if [ -d "$APP_DIR/deployment/config" ]; then
    # Nginx
    if diff -q "$APP_DIR/deployment/config/nginx/modca.conf" "/etc/nginx/sites-available/modca" >/dev/null; then
        log "Nginx configuration unchanged"
    else
        log "Updating Nginx configuration..."
        cp "$APP_DIR/deployment/config/nginx/modca.conf" "/etc/nginx/sites-available/modca"
        nginx -t || error "Nginx configuration test failed"
        systemctl reload nginx
    fi

    # Systemd
    if diff -q "$APP_DIR/deployment/config/systemd/modca.service" "/etc/systemd/system/modca.service" >/dev/null; then
        log "Systemd service unchanged"
    else
        log "Updating systemd service..."
        cp "$APP_DIR/deployment/config/systemd/modca.service" "/etc/systemd/system/modca.service"
        systemctl daemon-reload
    fi

    # Prometheus
    if diff -q "$APP_DIR/deployment/config/prometheus/prometheus.yml" "/etc/prometheus/prometheus.yml" >/dev/null; then
        log "Prometheus configuration unchanged"
    else
        log "Updating Prometheus configuration..."
        cp "$APP_DIR/deployment/config/prometheus/prometheus.yml" "/etc/prometheus/prometheus.yml"
        systemctl restart prometheus
    fi
fi

# Restart services
log "Restarting services..."
systemctl restart modca
systemctl restart nginx

# Verify services
log "Verifying services..."
if ! systemctl is-active --quiet modca; then
    error "modCA service failed to start"
fi

if ! systemctl is-active --quiet nginx; then
    error "Nginx service failed to start"
fi

log "Update completed successfully!"
log "Please check the application status and logs for any issues." 