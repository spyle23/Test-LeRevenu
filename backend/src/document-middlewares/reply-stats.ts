import type { Core } from '@strapi/strapi';

const REPLY_UID = 'api::reply.reply';
const DISCUSSION_UID = 'api::discussion.discussion';

/**
 * `replyCount` is denormalised on discussions so the feed can sort by activity and
 * filter unanswered threads on an indexed column. The value is recounted rather than
 * incremented: it stays correct after deletions from the admin panel and heals itself
 * if two replies are posted at the same time.
 */
export const registerReplyStats = (strapi: Core.Strapi) => {
  const findParentDiscussion = async (replyId: string) => {
    const reply = await strapi.documents(REPLY_UID).findOne({
      documentId: replyId,
      fields: ['createdAt'],
      populate: { discussion: { fields: ['slug'] } },
    });

    return reply as { createdAt: string; discussion?: { documentId: string } } | null;
  };

  const refresh = async (discussionId: string, lastActivityAt?: string) => {
    const replyCount = await strapi.documents(REPLY_UID).count({
      filters: { discussion: { documentId: { $eq: discussionId } } },
    });

    await strapi.documents(DISCUSSION_UID).update({
      documentId: discussionId,
      data: { replyCount, ...(lastActivityAt && { lastActivityAt }) },
    });
  };

  strapi.documents.use(async (context, next) => {
    if (context.uid !== REPLY_UID) return next();

    if (context.action === 'create') {
      const created = await next();
      const createdId = (created as { documentId?: string } | null)?.documentId;
      const reply = createdId ? await findParentDiscussion(createdId) : null;
      if (reply?.discussion) await refresh(reply.discussion.documentId, reply.createdAt);
      return created;
    }

    if (context.action === 'delete') {
      const { documentId } = context.params as { documentId: string };
      const reply = await findParentDiscussion(documentId);
      const result = await next();
      if (reply?.discussion) await refresh(reply.discussion.documentId);
      return result;
    }

    return next();
  });
};
