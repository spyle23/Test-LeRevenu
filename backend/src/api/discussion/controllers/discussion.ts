import { factories } from '@strapi/strapi';
import type { DiscussionService } from '../services/discussion';
import { validateCreateDiscussion, validateListQuery } from '../validation';

const UID = 'api::discussion.discussion';

export default factories.createCoreController(UID, ({ strapi }) => {
  const discussions = () => strapi.service(UID) as unknown as DiscussionService;

  return {
    async find(ctx) {
      const query = await validateListQuery(ctx.query);
      const { results, pagination } = await discussions().list(query);

      ctx.body = { data: results, meta: { pagination } };
    },

    async findOne(ctx) {
      ctx.body = { data: await discussions().findBySlug(ctx.params.slug) };
    },

    async create(ctx) {
      const input = await validateCreateDiscussion(ctx.request.body?.data);
      // The author always comes from the verified JWT, never from the payload.
      const data = await discussions().createForAuthor(ctx.state.user.documentId, input);

      ctx.status = 201;
      ctx.body = { data };
    },
  };
});
