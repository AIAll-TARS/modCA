# modCA_7web Deployment Documentation

## 1. Repository Structure & Workflow (Summary)

- **dev**: Main integration branch for development and testing.
- **deploy**: Deployment/production branch, updated from tested dev.
- **feature/*, bugfix/*, exp/**: For features, bugfixes, and experiments.
- **master**: (Optional) Stable, tagged releases.

**Directory layout:**
```
modca_7web/
├── backend/      # FastAPI backend
├── frontend/     # Next.js frontend
├── deployment/   # Deployment scripts/configs
├── docs/         # Documentation
├── recordings/   # Simulation recordings
├── .github/      # GitHub Actions, templates
├── ...
```

**Workflow:**
- Develop in feature/bugfix/exp branches, merge to dev via PR.
- Deploy from deploy branch (branched from dev).
- Tag releases on deploy or master.

See `DEVELOPER_DOCUMENTATION.md` for full details.

---

## 2. Technical Specification for Deployment

### 2.1 Architecture

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
```

- Vercel (fra1 region) for frontend (Next.js)
- FastAPI backend (Uvicorn workers)
- SQLite for storage
- WebSocket for real-time
- Cloudflare for DNS, CDN, SSL, DDoS

### 2.2 Vercel & Next.js Configuration
- `vercel.json` and `next.config.js` set for production, security headers, and region
- Environment variables for API and WebSocket URLs

### 2.3 Cloudflare Configuration
- DNS: A record to Vercel, CNAME for www, TXT for verification
- SSL/TLS: Full (Strict)
- Security: Bot Fight, Integrity Check, DDoS
- Performance: HTTP/3, Brotli, Auto Minify
- Page Rules: WebSocket and API bypass cache

---

## 3. Current Deployment Status

- **Frontend URL**: https://janis7ewski.org
- **WebSocket URL**: wss://janis7ewski.org/ws
- **API URL**: https://janis7ewski.org/api
- **Build Status**: ✅ Successful (Vercel)
- **Monitoring**: Cloudflare & Vercel analytics enabled
- **Security**: SSL/TLS, DDoS, security headers
- **Known Issues**: Vercel reverse proxy warning (expected), some npm deprecation notices (non-critical)
- **Next Steps**: Monitor WebSocket, caching, security audits, performance tuning

---

## 4. Domain & DNS Information

- **Domain Name**: janis7ewski.org
- **Registrar**: Cloudflare, Inc.
- **DNS Provider**: Cloudflare
- **Nameservers**: aldo.ns.cloudflare.com, venus.ns.cloudflare.com
- **DNS Records:**
  - A @ → 76.76.21.21 (proxied)
  - CNAME www → cname.vercel-dns.com (proxied)
  - TXT _vercel → [verification] (DNS only)
- **SSL Certificate**: Managed by Cloudflare
- **Domain Control Panel**: https://dash.cloudflare.com
- **Admin Contact**: AIAll@janis7ewski.org
- **Registration Date**: April 21, 2025
- **Expiration Date**: April 21, 2026
- **Auto-Renewal**: Enabled

---

## 5. Monitoring & Security

- **Cloudflare Analytics**: Traffic, security, performance
- **Vercel Analytics**: Build, edge, runtime
- **Security Features**:
  - DDoS Protection
  - SSL/TLS (Full Strict)
  - Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
  - Content-Security-Policy
- **Performance**:
  - HTTP/3, Brotli, Auto Minify
  - WebSocket support

---

## 6. Known Issues & Next Steps

- Vercel reverse proxy warning (expected with Cloudflare)
- Some npm package deprecation notices (non-critical)
- **Next Steps:**
  1. Monitor WebSocket performance
  2. Watch for caching issues
  3. Regular security audits
  4. Performance optimization if needed

---

For developer and architecture details, see `../DEVELOPER_DOCUMENTATION.md`. 