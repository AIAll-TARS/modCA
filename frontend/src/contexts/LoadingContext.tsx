import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface LoadingContextType {
    showLoading: (message?: string) => void;
    hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>('Loading...');

    const showLoading = useCallback((newMessage?: string) => {
        if (newMessage) setMessage(newMessage);
        setIsLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        setIsLoading(false);
        setMessage('Loading...'); // Reset to default message
    }, []);

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading }}>
            {isLoading && <LoadingSpinner message={message} fullScreen={true} />}
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}; 