import { createRequire } from 'node:module';
import type { Core } from '@strapi/strapi';
import request from 'supertest';
import { applyTestEnv } from '../setup/env';

// Strapi's ESM build does not run under Vite's module loader; use the CommonJS
// entry point, the same one the Strapi CLI loads.
const { compileStrapi, createStrapi } = createRequire(import.meta.url)(
  '@strapi/strapi'
) as typeof import('@strapi/strapi');

let instance: Core.Strapi | undefined;

export const startStrapi = async () => {
  if (instance) return instance;

  applyTestEnv();
  const appContext = await compileStrapi();
  instance = await createStrapi({ ...appContext, autoReload: false, serveAdminPanel: false }).load();
  instance.server.mount();

  return instance;
};

export const stopStrapi = async () => {
  if (!instance) return;
  // strapi.destroy() ends with process.removeAllListeners(), which also drops the IPC
  // listener of the Vitest worker. Closing the HTTP server and the pool is enough here.
  await instance.server.destroy();
  await instance.db.destroy();
  instance = undefined;
};

export const api = () => request(instance!.server.httpServer);

let sequence = 0;

export const createMember = async (overrides: Record<string, unknown> = {}) => {
  const strapi = instance!;
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });
  const username = `member_${Date.now()}_${++sequence}`;

  const user = await strapi.plugin('users-permissions').service('user').add({
    username,
    email: `${username}@test.local`,
    password: 'Password123!',
    provider: 'local',
    confirmed: true,
    blocked: false,
    role: role.id,
    displayName: `Membre ${sequence}`,
    ...overrides,
  });

  const jwt: string = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

  return { user: user as { id: number; documentId: string; username: string }, jwt };
};

export const createCategory = async (slug: string, name = slug) =>
  instance!.documents('api::category.category').create({ data: { slug, name } });
