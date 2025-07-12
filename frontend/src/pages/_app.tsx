import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { fetchConstants } from '../api/constants';
import { updateConstants } from '../constants';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        // Fetch and update constants when app starts
        fetchConstants()
            .then(constants => {
                updateConstants(constants);
            })
            .catch(error => {
                console.error('Failed to fetch simulation constants:', error);
            });
    }, []);

    return <Component {...pageProps} />;
} 