/**
 * Integration tests run against PostgreSQL, like production, but on a dedicated
 * database that is dropped and recreated before every run.
 */
export const applyTestEnv = () => {
  const defaults: Record<string, string> = {
    DATABASE_CLIENT: 'postgres',
    DATABASE_HOST: 'localhost',
    DATABASE_PORT: '5433',
    DATABASE_USERNAME: 'strapi',
    DATABASE_PASSWORD: 'strapi',
    APP_KEYS: 'testKeyA,testKeyB',
    API_TOKEN_SALT: 'test-salt',
    ADMIN_JWT_SECRET: 'test-admin-secret',
    TRANSFER_TOKEN_SALT: 'test-transfer-salt',
    JWT_SECRET: 'test-jwt-secret',
    ENCRYPTION_KEY: 'test-encryption-key',
  };

  for (const [key, value] of Object.entries(defaults)) {
    process.env[key] ??= value;
  }

  process.env.DATABASE_NAME = process.env.TEST_DATABASE_NAME ?? 'lerevenu_community_test';
  process.env.SEED_DEMO_DATA = 'false';
  process.env.STRAPI_TELEMETRY_DISABLED = 'true';
};
