/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Fredoka', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fredoka', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        toy: {
          red: '#EF4444',
          yellow: '#FBBF24',
          blue: '#3B82F6',
          green: '#22C55E',
          orange: '#F97316',
          purple: '#A855F7',
          sky: '#E0F2FE',
          grass: '#DCFCE7',
          sand: '#FEF3C7',
          wood: '#92400E',
        },
      },
    },
  },
  plugins: [],
};
