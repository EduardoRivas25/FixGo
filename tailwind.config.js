/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        display: ['Nunito_700Bold', 'Nunito', 'system-ui', 'sans-serif'],
        ui: ['Nunito_400Regular', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
