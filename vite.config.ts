import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.VITE_BASE_URL ?? '/';
const appVersion = process.env.VITE_APP_VERSION ?? '0.0.0';
const buildAt = process.env.VITE_BUILD_AT ?? new Date().toISOString();

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_AT__: JSON.stringify(buildAt),
  },
  build: {
    outDir: 'docs',
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'z-PWA Contacts',
        short_name: 'zContacts',
        description: 'Carnet de contacts offline-first',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
