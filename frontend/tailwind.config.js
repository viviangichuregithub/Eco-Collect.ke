/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'eco-green': '#355E62',
        'eco-light': '#ECF1E6',
      },
      boxShadow: {
        'custom': 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
      },
    },
  },
  plugins: [],
}