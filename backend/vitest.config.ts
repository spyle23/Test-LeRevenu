import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/setup/global-setup.ts'],
    // Each file boots its own Strapi in a fresh process (Strapi keeps module-level
    // registries), and files run one after the other on the shared test database.
    pool: 'forks',
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 180_000,
  },
});
