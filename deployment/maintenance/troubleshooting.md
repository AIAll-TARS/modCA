# Troubleshooting Guide

## Common Issues and Solutions

### Service Won't Start

1. Check service status:
```bash
systemctl status modca
journalctl -u modca -n 50
```

2. Verify Python environment:
```bash
# Check Python version
/home/aiall/projects/modca_7web/backend/venv/bin/python --version

# Check installed packages
/home/aiall/projects/modca_7web/backend/venv/bin/pip list
```

3. Check file permissions:
```bash
ls -l /var/log/modca
ls -l /var/lib/modca/db
```

### Database Issues

1. Check database integrity:
```bash
sqlite3 /var/lib/modca/db/settings.db "PRAGMA integrity_check;"
```

2. Check database permissions:
```bash
ls -l /var/lib/modca/db/settings.db
```

3. Verify database connection:
```bash
sqlite3 /var/lib/modca/db/settings.db ".tables"
```

### WebSocket Connection Issues

1. Check WebSocket status:
```bash
netstat -an | grep 8000
```

2. Verify NGINX WebSocket configuration:
```bash
nginx -T | grep -A 10 "location /ws"
```

### Memory Issues

1. Check memory usage:
```bash
free -h
ps aux | grep modca
```

2. Monitor memory over time:
```bash
top -b -n 1 | grep modca
```

### Performance Issues

1. Check CPU usage:
```bash
top -b -n 1 | grep modca
```

2. Monitor I/O:
```bash
iostat -x 1 5
```

3. Check network connections:
```bash
netstat -an | grep 8000 | wc -l
```

## Monitoring Alerts

### High Memory Usage
- Check grid size in active simulations
- Consider reducing maximum allowed grid size
- Review memory limits in systemd service file

### High CPU Usage
- Check number of concurrent simulations
- Review worker configuration in gunicorn
- Consider adding rate limiting

### Database Growth
- Check simulation recording settings
- Review backup retention policy
- Consider cleanup of old recordings

## Recovery Procedures

### Emergency Shutdown
```bash
systemctl stop modca
systemctl stop nginx
```

### Data Recovery
1. Stop services
2. Restore from latest backup
3. Check data integrity
4. Restart services

### Service Recovery
```bash
# Restart all components
systemctl restart modca
systemctl restart nginx
systemctl restart prometheus
```

## Logging

### Log Locations
- Application logs: `/var/log/modca/app.log`
- Access logs: `/var/log/modca/access.log`
- Error logs: `/var/log/modca/error.log`

### Log Analysis
```bash
# Check for errors
grep ERROR /var/log/modca/app.log

# Check access patterns
tail -f /var/log/modca/access.log

# Monitor real-time errors
tail -f /var/log/modca/error.log
``` 