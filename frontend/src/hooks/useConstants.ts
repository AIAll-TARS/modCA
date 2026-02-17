import { useState, useEffect } from 'react';
import { fetchConstants, SimulationConstants } from '../api/constants';

export function useConstants() {
    const [constants, setConstants] = useState<SimulationConstants | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadConstants = async () => {
        try {
            setLoading(true);
            console.log('useConstants: Fetching constants from API...');
            const data = await fetchConstants();
            console.log('useConstants: Received data:', data);
            setConstants(data);
            setError(null);
            console.log('useConstants: Constants set successfully');
        } catch (err) {
            console.error('useConstants: Failed to load constants:', err);
            setError('Failed to load simulation constants');
        } finally {
            console.log('useConstants: Loading complete');
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadConstants();
    }, []);

    return { constants, loading, error, resetConstants: loadConstants };
} 