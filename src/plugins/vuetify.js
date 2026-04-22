/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com
 */

// Composables
/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

const kartTheme = {
  dark: true,
  colors: {
    background: '#0D0D0D', // darker black
    surface: '#1E1E1E', // standard dark gray surface
    primary: '#D32F2F', // kart red
    secondary: '#424242', // light gray
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'kartTheme',
    themes: {
      kartTheme,
    },
  },
})
