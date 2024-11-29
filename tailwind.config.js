/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      'colors': {
        'white': '#efe9e9',
        'primary': 'rgb(25, 24, 27)'
      }
    }
  },

  plugins: []
};
