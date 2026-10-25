/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#FAF8F5',
          DEFAULT: '#F5F3EF',
          dark: '#EAE7E0',
          subtle: '#F0ECE3',
        },
        charcoal: {
          50: '#F5F6F7',
          100: '#E4E7EB',
          200: '#CBD1D8',
          300: '#9BA5B1',
          500: '#5A6472',
          700: '#323A45',
          800: '#222831',
          900: '#161A20',
          DEFAULT: '#191E24',
        },
        accent: {
          teal: '#0D9488',
          tealHover: '#0F766E',
          tealLight: '#F0FDFA',
          electric: '#0284C7',
          electricHover: '#0369A1',
          electricLight: '#F0F9FF',
          coral: '#E11D48',
          amber: '#D97706',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
