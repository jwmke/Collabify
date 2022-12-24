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
      'light-green': '#8aefad',
      'dark-green': '#1a6834',
      'light-gray': '#b3b3b3',
      'med-light-grey': "#6b6b6b",
      'med-grey': '#535353',
      'white': '#ffffff',
      'black': '#000000'
    }
  },
  plugins: [],
}
