/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: '#497552',
        cream: '#faf9f7',
        'warm-blue': '#6B8CAE',
        'dusty-purple': '#8B7BA8',
        'warm-amber': '#C4956C',
        'muted-rose': '#B8868B',
        'soft-emerald': '#7BA05B',
        'warm-neutral': '#9B9B9B',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont', 
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif'
        ],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px -4px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      transitionDuration: {
        '250': '250ms',
      },
      lineHeight: {
        'relaxed': '1.6',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};