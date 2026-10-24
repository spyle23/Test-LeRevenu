import type { Core } from '@strapi/strapi';
import { syncPermissions } from './bootstrap/permissions';
import { seedDemoData } from './bootstrap/seed';
import { registerReplyStats } from './document-middlewares/reply-stats';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    registerReplyStats(strapi);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncPermissions(strapi);

    if (process.env.SEED_DEMO_DATA === 'true') {
      await seedDemoData(strapi);
    }
  },
};
