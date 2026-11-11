import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { iwsdkDev } from '@iwsdk/vite-plugin-dev';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const enableXrEmulator = mode === 'xr' || env.VITE_XR_DEV === 'true';

  return {
    base: env.VITE_BASE_PATH || '/',
    server: {
      port: 5173,
      strictPort: false,
      host: 'localhost',
    },
    plugins: [
      react(),
      tailwindcss(),
      ...(enableXrEmulator
        ? [
            iwsdkDev({
              emulator: {
                device: 'metaQuest3',
                injectOnBuild: false,
              },
            }),
          ]
        : []),
    ],
    build: {
      target: 'esnext',
    },
  };
});
