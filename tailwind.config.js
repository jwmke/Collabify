/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      lato: ['Lato', 'sans-serif']
    },
    colors: {
      'dark-gray': '#212121',
      'green': '#1db954',
      'light-gray': '#b3b3b3',
      'med-grey': '#535353',
      'white': '#ffffff',
      'black': '#000000'
    }
  },
  plugins: [],
}
