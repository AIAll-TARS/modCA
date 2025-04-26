## Technical Specification for Deploying `modCA_7web` to the Web

### I. Goal
Deploy `modCA_7web`, a locally running simulation platform, to a publicly accessible, secure, production-grade web environment with full backend/frontend functionality, real-time simulation, and persistent storage.

---

### II. Current Architecture

```
                                   Users (Web Browsers)
                                           ↓
                                     Cloudflare CDN
                                           ↓
                                    HTTPS/SSL (443)
                                           ↓
┌─────────────────┐      ┌──────────────────────┐     ┌──────────────────┐
│    Vercel       │◆◆◆◆◆│      Next.js 14      │◆◆◆◆◆│    FastAPI       │
│(Edge Network)   │      │(Frontend + API Routes)│     │(Uvicorn workers) │
└────┬────────────┘      └──────┬───────────────┘     └────────┬─────────┘
     ↓                          ↓                             ↓
┌────────────┐            ┌───────────┐                ┌──────────────┐
│ CloudFlare │            │  SQLite   │                │   WebSocket  │
│ Analytics  │            │    DB     │                │   Server     │
└────────────┘            └───────────┘                └──────────────┘

Production Setup:
- Vercel Edge Network (fra1 region)
- Cloudflare CDN & Security
- HTTPS/SSL enabled
- WebSocket support
- DDoS protection
```

---

### III. Frontend Deployment (Current Production Setup)

#### Vercel Configuration
```json
{
  "version": 2,
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

#### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  optimizeFonts: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: 'https://janis7ewski.org/api',
    NEXT_PUBLIC_WS_URL: 'wss://janis7ewski.org/ws'
  }
}
```

---

### IV. Cloudflare Configuration

#### DNS Setup
```
Type    Name     Content              Status
A       @        76.76.21.21         Proxied
CNAME   www      cname.vercel-dns.com Proxied
TXT     _vercel  [verification]      DNS only
```

#### Security Settings
- SSL/TLS Mode: Full (Strict)
- Security Level: Medium
- Bot Fight Mode: Enabled
- Browser Integrity Check: Enabled
- JS Detection: Enabled

#### Performance Settings
- HTTP/3 (QUIC): Enabled
- HTTP/2: Enabled
- TCP Turbo: Enabled
- WebSocket Support: Enabled
- Brotli Compression: Enabled
- Auto Minify: Enabled (HTML, CSS, JS)

#### Page Rules
```
1. WebSocket Rule:
   Pattern: *janis7ewski.org/ws*
   - SSL: Full
   - Cache Level: Bypass

2. API Rule:
   Pattern: *janis7ewski.org/api*
   - Cache Level: Bypass
   - Security Level: High
```

---

### V. Monitoring and Analytics

#### Current Implementation
- Cloudflare Analytics: Enabled
  - Traffic monitoring
  - Security events
  - Performance metrics
  
- Vercel Analytics: Enabled
  - Build performance
  - Edge function metrics
  - Real-time logs

#### Health Checks
- Automated Vercel deployment checks
- Cloudflare status monitoring
- WebSocket connection monitoring

---

### VI. Security Features

#### Current Implementation
- DDoS Protection: Enabled via Cloudflare
- SSL/TLS: Enforced HTTPS
- Security Headers:
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security: max-age=63072000
  Content-Security-Policy: Configured
  ```

---

### VII. Known Issues & Monitoring

#### Current Status
- Vercel reverse proxy warning (expected with Cloudflare integration)
- Some npm package deprecation notices (non-critical)

#### Next Steps
1. Monitor WebSocket performance
2. Watch for any caching issues
3. Regular security audits
4. Performance optimization if needed

---

### VIII. Version Information

- Last Updated: 2025-04-25
- Build Version: 0.1.0
- Next.js Version: 14.2.28
- Node.js Version: 20.x LTS
