import { factories } from '@strapi/strapi';
import type { CategoryService } from '../services/category';

const UID = 'api::category.category';

export default factories.createCoreController(UID, ({ strapi }) => {
  const categories = () => strapi.service(UID) as unknown as CategoryService;

  return {
    async find(ctx) {
      ctx.body = { data: await categories().listWithStats() };
    },

    async findOne(ctx) {
      ctx.body = { data: await categories().findBySlug(ctx.params.slug) };
    },
  };
});
