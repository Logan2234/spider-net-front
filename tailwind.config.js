const theme = {
    screens: { sm: '480px', md: '768px', lg: '976px', xl: '1440px' },
    colors: {
        blue: '#1fb6ff',
        purple: '#7e5bef',
        pink: '#ff49db',
        orange: '#ff7849',
        green: '#13ce66',
        yellow: '#ffc82c',
        'gray-dark': '#273444',
        gray: '#8492a6',
        'gray-light': '#d3dce6',
        test: '#aaaaaa'
    },
    fontFamily: { sans: ['Graphik', 'sans-serif'], serif: ['Nunito', 'Merriweather', 'serif'] },
    extend: { spacing: { 128: '32rem', 144: '36rem' }, borderRadius: { '4xl': '4rem' } }
};

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme,
    plugins: [],
    darkMode: 'selector',
    important: true,
    prefix: 'zad'
};
