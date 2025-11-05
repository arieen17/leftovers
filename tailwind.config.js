/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "light-blue": "#AAD7EB",
      },
      fontFamily: {
        sans: ["Inter_400Regular", "sans-serif"],
        "sans-medium": ["Inter_500Medium", "sans-serif"],
        "sans-semibold": ["Inter_600SemiBold", "sans-serif"],
        "sans-bold": ["Inter_700Bold", "sans-serif"],
        bayon: ["Bayon_400Regular", "sans-serif"],
      },
    },
  },
  plugins: [],
};
