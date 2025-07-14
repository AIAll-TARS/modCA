import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { fetchConstants } from '../api/constants';
import { updateConstants } from '../constants';
import '../styles/globals.css';
import { ToastProvider } from '../components/Toast';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
    const [darkMode, setDarkMode] = useState(true); // Default to dark mode

    useEffect(() => {
        // Fetch and update constants when app starts
        fetchConstants()
            .then(constants => {
                updateConstants(constants);
            })
            .catch(error => {
                console.error('Failed to fetch simulation constants:', error);
            });

        // Check if there's a saved theme preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Set dark mode based on saved preference or system preference
        const shouldUseDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
        setDarkMode(shouldUseDarkMode);

        // Apply the class to html element
        document.documentElement.classList.toggle('dark', shouldUseDarkMode);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        document.documentElement.classList.toggle('dark', newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    };

    return (
        <ErrorBoundary>
            <ToastProvider>
                <Head>
                    <title>ModCA Web</title>
                    <meta name="description" content="ModCA Web - Ecosystem Simulation" />
                    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                    <meta name="theme-color" content="#121212" />
                </Head>
                <Component {...pageProps} />
            </ToastProvider>
        </ErrorBoundary>
    );
} 