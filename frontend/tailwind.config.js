/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enable class-based dark mode
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
                base: '18px', // Increase base font size to 18px
            },
            colors: {
                // Dark mode colors
                dark: {
                    bg: '#121212',
                    card: '#1E1E1E',
                    border: '#333333',
                    text: '#E0E0E0',
                },
            },
        },
    },
    plugins: [],
} 