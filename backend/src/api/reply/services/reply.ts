import { factories, type Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { authorPopulate, presentAuthor } from '../../../utils/presenters';
import type { CreateReplyInput } from '../validation';

const UID = 'api::reply.reply';
const DISCUSSION_UID = 'api::discussion.discussion';

const replyService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async createForAuthor(authorId: string, discussionSlug: string, input: CreateReplyInput) {
    const discussion = await strapi.documents(DISCUSSION_UID).findFirst({
      filters: { slug: { $eq: discussionSlug } },
      fields: ['slug'],
    });

    if (!discussion) {
      throw new errors.NotFoundError('Cette discussion n’existe pas ou a été supprimée.');
    }

    // Reply counters on the discussion are refreshed by the document middleware
    // (src/document-middlewares/reply-stats.ts), whatever created the reply.
    const reply = await strapi.documents(UID).create({
      data: { content: input.content, author: authorId, discussion: discussion.documentId },
      fields: ['content', 'createdAt'],
      populate: { author: authorPopulate },
    });

    return {
      documentId: reply.documentId,
      content: reply.content,
      createdAt: reply.createdAt,
      author: presentAuthor((reply as Record<string, any>).author),
    };
  },
});

export type ReplyService = ReturnType<typeof replyService>;

export default factories.createCoreService(UID, replyService);
