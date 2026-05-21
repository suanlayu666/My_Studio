import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/My_Studio/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'My Studio',
        short_name: 'My Studio',
        description: 'Personal music player',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/My_Studio/',
        start_url: '/My_Studio/',
        icons: [
          { src: '/My_Studio/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/My_Studio/icon-256.png', sizes: '256x256', type: 'image/png' },
          { src: '/My_Studio/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/My_Studio/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
