import { randomBytes } from 'node:crypto';
import { factories, type Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { slugify } from '../../../utils/slugify';
import {
  CATEGORY_FIELDS,
  authorPopulate,
  excerpt,
  presentAuthor,
  presentCategory,
} from '../../../utils/presenters';
import type { CreateDiscussionInput, DiscussionListQuery, DiscussionSort } from '../validation';

const UID = 'api::discussion.discussion';
const CATEGORY_UID = 'api::category.category';

const SUMMARY_FIELDS = ['title', 'slug', 'type', 'content', 'replyCount', 'lastActivityAt', 'createdAt'] as const;

const SORTS: Record<DiscussionSort, Array<Record<string, 'asc' | 'desc'>>> = {
  recent: [{ createdAt: 'desc' }, { id: 'desc' }],
  oldest: [{ createdAt: 'asc' }, { id: 'asc' }],
  active: [{ replyCount: 'desc' }, { lastActivityAt: 'desc' }, { id: 'desc' }],
};

const summaryPopulate = {
  author: authorPopulate,
  category: { fields: [...CATEGORY_FIELDS] },
};

// Document Service results are loosely typed here on purpose: the populate shape is
// decided by this file, and the presenters below are the single place reading it.
type DiscussionRecord = Record<string, any>;

const toSummary = (doc: DiscussionRecord) => ({
  documentId: doc.documentId as string,
  slug: doc.slug as string,
  title: doc.title as string,
  excerpt: excerpt(doc.content ?? ''),
  type: doc.type,
  replyCount: doc.replyCount ?? 0,
  createdAt: doc.createdAt,
  lastActivityAt: doc.lastActivityAt ?? doc.createdAt,
  author: presentAuthor(doc.author),
  category: presentCategory(doc.category),
});

const toDetail = (doc: DiscussionRecord) => {
  const { excerpt: _excerpt, ...summary } = toSummary(doc);
  return {
    ...summary,
    content: doc.content as string,
    replies: (doc.replies ?? []).map((reply: DiscussionRecord) => ({
      documentId: reply.documentId as string,
      content: reply.content as string,
      createdAt: reply.createdAt,
      author: presentAuthor(reply.author),
    })),
  };
};

const buildFilters = ({ category, type, status, q }: DiscussionListQuery) => ({
  ...(category && { category: { slug: { $eq: category } } }),
  ...(type && { type: { $eq: type } }),
  ...(status === 'unanswered' && { replyCount: { $eq: 0 } }),
  ...(q && { $or: [{ title: { $containsi: q } }, { content: { $containsi: q } }] }),
});

const discussionService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async list(query: DiscussionListQuery) {
    const filters = buildFilters(query);
    const { page, pageSize } = query;

    const [rows, total] = await Promise.all([
      strapi.documents(UID).findMany({
        filters,
        sort: SORTS[query.sort],
        fields: [...SUMMARY_FIELDS],
        populate: summaryPopulate,
        start: (page - 1) * pageSize,
        limit: pageSize,
      }),
      strapi.documents(UID).count({ filters }),
    ]);

    return {
      results: rows.map(toSummary),
      pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total },
    };
  },

  async findBySlug(slug: string) {
    const doc = await strapi.documents(UID).findFirst({
      filters: { slug: { $eq: slug } },
      fields: [...SUMMARY_FIELDS],
      populate: {
        author: authorPopulate,
        category: { fields: [...CATEGORY_FIELDS, 'description'] },
        replies: {
          fields: ['content', 'createdAt'],
          sort: [{ createdAt: 'asc' }, { id: 'asc' }],
          populate: { author: authorPopulate },
        },
      },
    });

    if (!doc) {
      throw new errors.NotFoundError('Cette discussion n’existe pas ou a été supprimée.');
    }

    return toDetail(doc);
  },

  async createForAuthor(authorId: string, input: CreateDiscussionInput) {
    const category = await strapi.documents(CATEGORY_UID).findFirst({
      filters: { slug: { $eq: input.category } },
      fields: ['slug'],
    });

    if (!category) {
      const message = 'Cet espace n’existe pas.';
      throw new errors.ValidationError(message, {
        errors: [{ path: ['category'], message, name: 'ValidationError' }],
      });
    }

    const created = await strapi.documents(UID).create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        slug: await this.generateSlug(input.title),
        author: authorId,
        category: category.documentId,
        replyCount: 0,
        lastActivityAt: new Date().toISOString(),
      },
      fields: [...SUMMARY_FIELDS],
      populate: summaryPopulate,
    });

    return toSummary(created);
  },

  /**
   * Readable slug first; a short random suffix only when the title is already taken.
   * Strapi's entity validator still rejects a duplicate uid if two requests race.
   */
  async generateSlug(title: string) {
    const base = slugify(title) || 'discussion';
    const taken = await strapi.documents(UID).count({ filters: { slug: { $eq: base } } });
    return taken ? `${base}-${randomBytes(3).toString('hex')}` : base;
  },
});

export type DiscussionService = ReturnType<typeof discussionService>;

export default factories.createCoreService(UID, discussionService);
