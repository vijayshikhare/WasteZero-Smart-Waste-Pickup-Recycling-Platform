/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      green: {
        50: '#f0fdf4',
        600: '#16a34a',
        700: '#15803d',
        900: '#14532d',
      },
      emerald: {
        50: '#ecfdf5',
        700: '#047857',
        950: '#022c22',
      },
    },
  },
  plugins: [],
}
