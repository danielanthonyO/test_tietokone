import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'cd backend && npm run start',
      url: 'http://localhost:3000/customers',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/testdb',
        NODE_ENV: 'test',
        JWT_SECRET: 'dev_secret',
        JWT_EXPIRES_IN: '7d',
        PORT: '3000',
        FRONTEND_BASE_URL: 'http://localhost:5173',
      },
    },
    {
      command: 'cd frontend && npm run dev -- --host 0.0.0.0',
      url: 'http://localhost:5173/customers',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_URL: 'http://localhost:3000',
      },
    },
  ],
});
