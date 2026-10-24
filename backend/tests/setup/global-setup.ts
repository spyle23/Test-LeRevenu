import { Client } from 'pg';
import { applyTestEnv } from './env';

export default async function recreateTestDatabase() {
  applyTestEnv();
  const database = process.env.DATABASE_NAME!;

  if (!/^[a-z0-9_]+_test$/.test(database)) {
    throw new Error(`Refusing to reset "${database}": test databases must end with "_test".`);
  }

  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'postgres',
  });

  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
    await client.query(`CREATE DATABASE "${database}"`);
  } finally {
    await client.end();
  }
}
