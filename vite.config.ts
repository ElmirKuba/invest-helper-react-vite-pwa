import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      /** пишем свой sw.js */
      strategies: 'injectManifest',
      /** где лежит исходник SW */
      srcDir: 'src',
      /** использовать TypeScript SW */
      filename: 'sw.ts',
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{html,css,js,ico,png,svg,jpg,webmanifest,json,woff2}'],
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Invest Helper Application',
        short_name: 'Invest Helper',
        start_url: '.',
        display: 'standalone',
        background_color: '#2EC6FE',
        theme_color: '#8936FF',
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
        lang: 'ru-RU',
        description: 'Помощник диверсификации портфеля',
      },
    }),
  ],
});
