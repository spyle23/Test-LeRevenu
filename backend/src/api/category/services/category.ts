import { factories, type Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const UID = 'api::category.category';

const FIELDS = ['name', 'slug', 'description', 'icon', 'color', 'position'] as const;

type CategoryRecord = Record<string, any>;

const present = (category: CategoryRecord) => ({
  documentId: category.documentId as string,
  name: category.name as string,
  slug: category.slug as string,
  description: category.description ?? null,
  icon: category.icon ?? null,
  color: category.color ?? null,
  discussionCount: category.discussions?.count ?? 0,
});

const categoryService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async listWithStats() {
    const rows = await strapi.documents(UID).findMany({
      fields: [...FIELDS],
      sort: [{ position: 'asc' }, { name: 'asc' }],
      populate: { discussions: { count: true } },
    });

    return rows.map(present);
  },

  async findBySlug(slug: string) {
    const category = await strapi.documents(UID).findFirst({
      filters: { slug: { $eq: slug } },
      fields: [...FIELDS],
      populate: { discussions: { count: true } },
    });

    if (!category) throw new errors.NotFoundError('Cet espace n’existe pas.');

    return present(category);
  },
});

export type CategoryService = ReturnType<typeof categoryService>;

export default factories.createCoreService(UID, categoryService);
