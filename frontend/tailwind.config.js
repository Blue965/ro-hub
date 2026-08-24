module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        roblue: {
          50: '#f2f8ff',
          100: '#dff0ff',
          200: '#bfe0ff',
          500: '#0066FF',
          700: '#0047B3'
        }
      }
    }
  },
  plugins: []
};
