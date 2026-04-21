import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.ts'],
    watch: false,
    cache: false,
    coverage: {
      enabled: true,
      include: ['src/**'],
      exclude: ['src/types.ts'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
