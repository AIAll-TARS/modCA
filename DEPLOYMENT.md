# Deployment Guide

This guide provides instructions for deploying the modCA_7 web application.

## System Requirements

- Python 3.8 or higher
- Node.js 14 or higher
- Docker (optional)
- Nginx (for production)

## Backend Deployment

### 1. Local Development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Production Deployment

#### Using Docker

1. Build the Docker image:
```bash
docker build -t modca7-backend .
```

2. Run the container:
```bash
docker run -d -p 8000:8000 modca7-backend
```

#### Using Nginx

1. Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

2. Configure Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/modca7 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Frontend Deployment

### 1. Local Development

```bash
cd frontend
npm install
npm run dev
```

### 2. Production Build

```bash
cd frontend
npm install
npm run build
```

### 3. Deploying to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

## Environment Variables

### Backend

Create a `.env` file in the backend directory:
```
GRID_SIZE=100
MAX_STEPS=1000
```

### Frontend

Create a `.env.local` file in the frontend directory:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## SSL Configuration

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

## Monitoring

1. Check application logs:
```bash
# Backend logs
docker logs modca7-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

2. Monitor system resources:
```bash
# CPU and memory usage
htop

# Disk usage
df -h
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   - Check if ports 8000 (backend) and 3000 (frontend) are available
   - Use `lsof -i :8000` to check port usage

2. **Nginx Issues**:
   - Check Nginx configuration: `sudo nginx -t`
   - Check Nginx status: `sudo systemctl status nginx`

3. **Docker Issues**:
   - Check container status: `docker ps`
   - Check container logs: `docker logs <container_id>`

### Performance Tuning

1. **Nginx Configuration**:
   - Enable gzip compression
   - Configure caching
   - Set appropriate worker processes

2. **Application Settings**:
   - Adjust grid size (max 100x100)
   - Configure appropriate step sizes
   - Monitor memory usage

## Backup and Recovery

1. **Database Backup**:
```bash
# Backup SQLite database
cp backend/settings.db backend/settings.db.backup
```

2. **Configuration Backup**:
```bash
# Backup Nginx configuration
sudo cp /etc/nginx/sites-available/modca7 /etc/nginx/sites-available/modca7.backup
```

## Security Considerations

1. **Firewall Configuration**:
```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

2. **SSL/TLS**:
   - Use HTTPS for all connections
   - Configure secure WebSocket connections
   - Set appropriate security headers

3. **Application Security**:
   - Validate all input parameters
   - Implement rate limiting
   - Use secure session management

## Scaling Considerations

1. **Horizontal Scaling**:
   - Use load balancer for multiple backend instances
   - Configure session management for multiple servers

2. **Vertical Scaling**:
   - Monitor resource usage
   - Adjust server resources as needed

## Maintenance

1. **Regular Updates**:
   - Update dependencies regularly
   - Monitor security advisories
   - Apply security patches promptly

2. **Performance Monitoring**:
   - Monitor response times
   - Track resource usage
   - Optimize based on metrics 