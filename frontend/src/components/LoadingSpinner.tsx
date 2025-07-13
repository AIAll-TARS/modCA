import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Loading...',
    fullScreen = false
}) => {
    const overlayClasses = fullScreen
        ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        : 'flex items-center justify-center p-4';

    return (
        <div className={overlayClasses}>
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl">
                <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <div className="text-lg text-gray-300">{message}</div>
                </div>
            </div>
        </div>
    );
}; 