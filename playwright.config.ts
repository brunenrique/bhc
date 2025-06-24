import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: process.env.CI
    ? {
        command: 'pnpm run start',
        port: 3000,
        timeout: 120 * 1000,
      }
    : undefined,
});
