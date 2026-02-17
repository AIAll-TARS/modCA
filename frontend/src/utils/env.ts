function stripTrailingSlash(url: string) {
    return url.replace(/\/+$/, '');
}

function ensurePathSuffix(url: string, suffix: string) {
    const clean = stripTrailingSlash(url);
    return clean.endsWith(suffix) ? clean : clean + suffix;
}

export function getApiUrl() {
    // Local development: call backend directly
    // Check both client-side and server-side for local development
    const isLocalDevelopment = 
        // Client-side check
        (typeof window !== 'undefined' && 
         (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '0.0.0.0')) ||
        // Server-side check for development mode
        (typeof window === 'undefined' && process.env.NODE_ENV === 'development');
    
    if (isLocalDevelopment) {
        // For local development, always use port 8002 for API
        const hostname = window?.location?.hostname || 'localhost';
        return `http://${hostname}:8002/api`;
    }

    // Prefer explicit env var (Vercel / VPS). Normalize so misconfig like
    // NEXT_PUBLIC_API_URL="https://example.com" still works.
    if (process.env.NEXT_PUBLIC_API_URL) {
        return ensurePathSuffix(process.env.NEXT_PUBLIC_API_URL, '/api');
    }

    // VPS/default: same origin is the safest when nginx proxies /api
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api`;
    }

    // SSR fallback for production
    return 'https://ws.janis7ewski.org/api';
}

export function getWsUrl() {
    // Local development: use local WebSocket
    // Check both client-side and server-side for local development
    const isLocalDevelopment = 
        // Client-side check
        (typeof window !== 'undefined' && 
         (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '0.0.0.0')) ||
        // Server-side check for development mode
        (typeof window === 'undefined' && process.env.NODE_ENV === 'development');
    
    if (isLocalDevelopment) {
        // For local development, always use port 8002 for WebSocket
        const hostname = window?.location?.hostname || 'localhost';
        return `ws://${hostname}:8002/ws`;
    }

    if (process.env.NEXT_PUBLIC_WS_URL) {
        return ensurePathSuffix(process.env.NEXT_PUBLIC_WS_URL, '/ws');
    }

    if (typeof window !== 'undefined') {
        const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${wsProto}//${window.location.host}/ws`;
    }

    return 'wss://ws.janis7ewski.org/ws';
}
