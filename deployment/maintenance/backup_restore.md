# Backup and Restore Procedures

## Backup

### Database Backup
```bash
# Daily automatic backup
/etc/cron.daily/modca-backup

# Manual backup
sqlite3 /var/lib/modca/db/settings.db ".backup '/var/backups/modca/settings_$(date +%Y%m%d_%H%M%S).db'"
```

### Configuration Backup
```bash
# Backup all configuration files
tar czf /var/backups/modca/config_$(date +%Y%m%d_%H%M%S).tar.gz /etc/nginx/sites-available/modca /etc/systemd/system/modca.service /etc/prometheus/prometheus.yml
```

### Log Backup
```bash
# Backup all logs
tar czf /var/backups/modca/logs_$(date +%Y%m%d_%H%M%S).tar.gz /var/log/modca/
```

## Restore

### Database Restore
```bash
# Stop the service
systemctl stop modca

# Restore database
sqlite3 /var/lib/modca/db/settings.db ".restore '/var/backups/modca/settings_YYYYMMDD.db'"

# Start the service
systemctl start modca
```

### Configuration Restore
```bash
# Extract configuration backup
tar xzf /var/backups/modca/config_YYYYMMDD_HHMMSS.tar.gz -C /

# Reload services
systemctl daemon-reload
systemctl reload nginx
systemctl restart modca
```

### Log Restore
```bash
# Extract log backup
tar xzf /var/backups/modca/logs_YYYYMMDD_HHMMSS.tar.gz -C /
```

## Retention Policy

- Database backups: 7 days
- Configuration backups: 30 days
- Log backups: 14 days

## Verification

After any restore operation:
1. Check service status: `systemctl status modca`
2. Verify nginx configuration: `nginx -t`
3. Test application functionality
4. Check logs for errors: `journalctl -u modca -n 50` 