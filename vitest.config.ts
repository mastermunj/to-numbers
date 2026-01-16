import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.ts'],
    watch: false,
    cache: false,
    coverage: {
      enabled: true,
      include: ['src/**'],
    },
  },
});
