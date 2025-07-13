import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { ToastProvider } from '../components/Toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingProvider } from '../contexts/LoadingContext';

export default function App({ Component, pageProps }: AppProps) {
    const [darkMode, setDarkMode] = useState(true); // Default to dark mode

    useEffect(() => {
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
                <LoadingProvider>
                    <Head>
                        <title>ModCA Web</title>
                        <meta name="description" content="ModCA Web - Ecosystem Simulation" />
                        <link rel="icon" href="/favicon.ico" />
                    </Head>
                    <Component {...pageProps} />
                </LoadingProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
} 