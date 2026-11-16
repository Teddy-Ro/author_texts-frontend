import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    // Preserve Host so the backend can compare it with the browser's Origin.
    '/api': { target: env.VITE_AUTHOR_TEXTS_API_TARGET || 'http://127.0.0.1:8000', changeOrigin: false },
    '/author_texts_media': {
      target: env.VITE_AUTHOR_TEXTS_MEDIA_TARGET || 'http://127.0.0.1:9000', changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/author_texts_media/, '/author-texts-media'),
    },
  };
  return {
    plugins: [react()],
    server: { port: 5173, strictPort: true, proxy },
    preview: { proxy },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/tests/author_texts_setup.ts',
      restoreMocks: true,
    },
  };
});
