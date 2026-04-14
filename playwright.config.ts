import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'cd backend && node dist/src/main.js',
      url: 'http://127.0.0.1:3000',
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/testdb',
        NODE_ENV: 'test',
        JWT_SECRET: 'dev_secret',
        JWT_EXPIRES_IN: '7d',
        PORT: '3000',
      },
    },
    {
      command: 'cd frontend && npm run dev -- --host 0.0.0.0',
      url: 'http://127.0.0.1:5173',
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        VITE_API_URL: 'http://127.0.0.1:3000',
      },
    },
  ],
});