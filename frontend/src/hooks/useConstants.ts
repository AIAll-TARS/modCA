import { useState, useEffect } from 'react';
import { fetchConstants, SimulationConstants } from '../api/constants';

export function useConstants() {
    const [constants, setConstants] = useState<SimulationConstants | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadConstants = async () => {
        try {
            setLoading(true);
            const data = await fetchConstants();
            setConstants(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load constants:', err);
            setError('Failed to load simulation constants');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadConstants();
    }, []);

    return { constants, loading, error, resetConstants: loadConstants };
} 