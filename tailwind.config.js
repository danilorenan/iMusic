/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Project Nova Core Theme (Inspired by Spotify Dark)
                nova: {
                    background: '#121212',
                    surface: '#282828',
                    surfaceHover: '#3E3E3E',
                    accent: '#1DB954', // Spotify Green
                    accentActive: '#1ED760',
                    textPrimary: '#FFFFFF',
                    textSecondary: '#B3B3B3',
                }
            },
            fontFamily: {
                // Adicionaremos fontes na próxima fase
                sans: ['System'],
            }
        },
    },
    plugins: [],
}
