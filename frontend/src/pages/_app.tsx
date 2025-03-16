import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

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
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </div>
            <Component {...pageProps} />
        </>
    );
} 