export const showNotification = (message: string) => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center transition-opacity duration-1000 z-50';

    const messageBox = document.createElement('div');
    messageBox.className = 'bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-xl text-gray-800 dark:text-gray-200 text-lg font-medium max-w-lg mx-4 text-center';
    messageBox.textContent = message;

    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);

    // Ensure opacity transition works by forcing a reflow
    overlay.offsetHeight;

    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 1000);
    }, 1000);
}; 