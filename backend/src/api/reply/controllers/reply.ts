import { factories } from '@strapi/strapi';
import type { ReplyService } from '../services/reply';
import { validateCreateReply } from '../validation';

const UID = 'api::reply.reply';

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const input = await validateCreateReply(ctx.request.body?.data);
    const replies = strapi.service(UID) as unknown as ReplyService;
    const data = await replies.createForAuthor(ctx.state.user.documentId, ctx.params.slug, input);

    ctx.status = 201;
    ctx.body = { data };
  },
}));
