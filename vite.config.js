import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Solo separamos Firebase, que es masivo y seguro de aislar.
          // Dejamos que Vite maneje React y Material UI de forma nativa para evitar errores.
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
        }
      }
    }
  }
})