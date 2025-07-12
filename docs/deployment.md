# Deployment Guide

## Environment Variables

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://ws.janis7ewski.org/api
NEXT_PUBLIC_WS_URL=wss://ws.janis7ewski.org/ws
```

### Backend (VPS)
```env
FRONTEND_URL=https://www.janis7ewski.org
```

## Domain Configuration

### Main Domain (www.janis7ewski.org)
- Serves the Next.js frontend
- Configured in Vercel
- No API or WebSocket proxying

### WebSocket Subdomain (ws.janis7ewski.org)
- Handles all API requests and WebSocket connections
- Configured in Nginx
- Proxies to backend services

## Nginx Configuration

```nginx
# ws.janis7ewski.org
server {
    listen 443 ssl;
    server_name ws.janis7ewski.org;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/ws.janis7ewski.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ws.janis7ewski.org/privkey.pem;

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket endpoints
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## Deployment Process

1. **Frontend (Vercel)**
   - Push to `prod` branch
   - Vercel automatically deploys
   - Verify environment variables in Vercel dashboard

2. **Backend (VPS)**
   ```bash
   ssh modca@135.181.111.66
   cd ~/modca_7web
   git pull origin prod
   cd deployment
   docker-compose down
   docker-compose up -d
   ```

## Troubleshooting

1. **CORS Issues**
   - Verify `FRONTEND_URL` in backend `.env`
   - Check `NEXT_PUBLIC_API_URL` in Vercel dashboard
   - Ensure all API calls use `getApiUrl()` in frontend code

2. **WebSocket Connection**
   - Verify `NEXT_PUBLIC_WS_URL` in Vercel dashboard
   - Check Nginx WebSocket configuration
   - Ensure backend WebSocket service is running

3. **API Requests**
   - All requests should go to `ws.janis7ewski.org`
   - Check Network tab in browser DevTools
   - Verify Nginx proxy configuration

## Monitoring

- Frontend logs: Vercel dashboard
- Backend logs: `docker-compose logs -f`
- Nginx logs: `/var/log/nginx/access.log` and `/var/log/nginx/error.log` 