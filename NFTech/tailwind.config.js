/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './Views/**/*.cshtml',
        './wwwroot/js/**/*.js'
    ],
    theme: {
        extend: {
            colors: {
                'primary-dark': '#060b11',
                'primary-blue': '#1A3458',
                'accent-red': '#B71C1C',
                'light-gray': '#E2E6EC',
                'ribbon-bg': '#121f31',
                'card-bg-dark': 'rgba(26, 52, 88, 0.2)',
                'border-color': 'rgba(226, 230, 236, 0.12)'
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Space Grotesk"', 'sans-serif'],
            },
            transitionProperty: {
                'premium': 'all',
            },
            transitionTimingFunction: {
                'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
            transitionDuration: {
                '500': '500ms',
                '600': '600ms',
            }
        },
    },
    plugins: [],
}