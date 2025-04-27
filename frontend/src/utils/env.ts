export function getApiUrl() {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8000/api';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://janis7ewski.org/api';
}

export function getWsUrl() {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'ws://localhost:8000/ws';
    }
    return process.env.NEXT_PUBLIC_WS_URL || 'wss://janis7ewski.org/ws';
} 