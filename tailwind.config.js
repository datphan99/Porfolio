/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f2f2f0',
        ink: '#111111',
        dark: '#0d0d0d',
        dot: '#ff3700',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['"Inter Display"', 'Inter', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      borderRadius: {
        card: '22px',
      },
    },
  },
  plugins: [],
};
