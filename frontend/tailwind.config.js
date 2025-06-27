/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            fontSize: {
                base: '18px',
            },
            colors: {
                // Default dark theme colors
                bg: '#121212',
                card: '#1E1E1E',
                border: '#333333',
                text: '#E0E0E0',
            },
        },
    },
    plugins: [],
} 