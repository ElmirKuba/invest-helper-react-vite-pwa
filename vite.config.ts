import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{html,css,js,ico,png,svg,jpg}'],
      },
      manifest: {
        theme_color: '#8936FF',
        background_color: '#2EC6FE',
        icons: [
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: 'icon512_maskable.png',
            type: 'image/png',
          },
          {
            purpose: 'any',
            sizes: '512x512',
            src: 'icon512_rounded.png',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            type: 'image/png',
            sizes: '1648x994',
            form_factor: 'wide',
          },
          {
            src: '/screenshots/mobile.png',
            type: 'image/png',
            sizes: '414x896',
            form_factor: 'narrow',
          },
        ],
        orientation: 'any',
        display: 'standalone',
        lang: 'ru-RU',
        name: 'Invest Helper',
        short_name: 'IH',
        start_url: '/',
        description: 'Помощник диверсификации портфеля',
      },
    }),
  ],
});
