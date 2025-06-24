const {nextui} = require('@nextui-org/theme');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|card|dropdown|form|modal|navbar|table|ripple|spinner|menu|divider|popover|checkbox|spacer).js"
  ],
  theme: {
    extend: {},
  },
  plugins: [nextui()],
}

