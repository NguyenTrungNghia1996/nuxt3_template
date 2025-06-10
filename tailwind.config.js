// /** @type {import('tailwindcss').Config} */
// export default {
//   content:
//     [
//       './components/**/*.{vue,js}',
//       './layouts/**/*.vue',
//       './pages/**/*.vue',
//       './plugins/**/*.{js,ts}',
//       './nuxt.config.{js,ts}',
//     ],
//   theme: {
//     extend: {
//       fontFamily: {
//         roboto: ['Roboto', 'sans-serif'],
//       },
//     },
//   },
//   plugins: [
//     require('@tailwindcss/line-clamp'),
//   ],
// }
// tailwind.config.cjs
module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
