export function getApiUrl() {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8000/api';
    }
    return 'https://www.janis7ewski.org/backend-api';
}

export function getWsUrl() {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'ws://localhost:8000/ws';
    }
    return 'wss://www.janis7ewski.org/backend-ws';
} 