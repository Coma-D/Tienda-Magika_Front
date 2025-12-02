import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 👇 NUEVA CONFIGURACIÓN DE PROXY
    proxy: {
      // Redirige cualquier solicitud que comience con /api/v1 al puerto 3000
      '/api/v1': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
        secure: false, // Usar falso para desarrollo sin HTTPS
      },
    },
  },
})