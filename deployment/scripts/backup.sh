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
BACKUP_ROOT="/var/backups/$APP_NAME"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/$DATE"
RETENTION_DAYS=7
DB_PATH="/var/lib/$APP_NAME/db/settings.db"
CONFIG_DIR="/home/ubuntu/modca_7web/deployment/config"
LOG_DIR="/var/log/$APP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
log "Backing up database..."
if [ -f "$DB_PATH" ]; then
    sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/settings.db'"
else
    error "Database file not found at $DB_PATH"
fi

# Backup configuration files
log "Backing up configuration files..."
if [ -d "$CONFIG_DIR" ]; then
    tar czf "$BACKUP_DIR/config.tar.gz" -C "$CONFIG_DIR" .
else
    warn "Configuration directory not found at $CONFIG_DIR"
fi

# Backup logs
log "Backing up logs..."
if [ -d "$LOG_DIR" ]; then
    tar czf "$BACKUP_DIR/logs.tar.gz" -C "$LOG_DIR" .
else
    warn "Log directory not found at $LOG_DIR"
fi

# Create backup archive
log "Creating backup archive..."
cd "$BACKUP_ROOT"
tar czf "$DATE.tar.gz" "$DATE"
rm -rf "$DATE"

# Clean up old backups
log "Cleaning up old backups..."
find "$BACKUP_ROOT" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# Optional: Upload to remote storage
# if command -v aws &> /dev/null; then
#     log "Uploading backup to S3..."
#     aws s3 cp "$BACKUP_ROOT/$DATE.tar.gz" "s3://your-bucket/backups/$APP_NAME/"
# fi

log "Backup completed successfully!"
log "Backup stored at: $BACKUP_ROOT/$DATE.tar.gz" 