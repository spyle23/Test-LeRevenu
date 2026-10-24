/**
 * The API never returns raw user records: relations to users are populated with an
 * explicit field list and mapped here, so e-mails or role data cannot leak through
 * a careless `populate`.
 */
export const AUTHOR_FIELDS = ['username', 'displayName', 'isEditorial', 'isSubscriber'] as const;
export const CATEGORY_FIELDS = ['name', 'slug', 'icon', 'color'] as const;

export const authorPopulate = { fields: [...AUTHOR_FIELDS] };

interface AuthorRecord {
  username: string;
  displayName?: string | null;
  isEditorial?: boolean | null;
  isSubscriber?: boolean | null;
}

interface CategoryRecord {
  documentId: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
}

export interface PublicAuthor {
  username: string;
  displayName: string;
  isEditorial: boolean;
  isSubscriber: boolean;
}

export const presentAuthor = (author?: AuthorRecord | null): PublicAuthor | null =>
  author
    ? {
        username: author.username,
        displayName: author.displayName || author.username,
        isEditorial: Boolean(author.isEditorial),
        isSubscriber: Boolean(author.isSubscriber),
      }
    : null;

export const presentCategory = (category?: CategoryRecord | null) =>
  category
    ? {
        documentId: category.documentId,
        name: category.name,
        slug: category.slug,
        icon: category.icon ?? null,
        color: category.color ?? null,
        ...(category.description !== undefined && { description: category.description }),
      }
    : null;

export const excerpt = (text: string, maxLength = 220): string => {
  const flat = text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  if (flat.length <= maxLength) return flat;
  const lastSpace = flat.lastIndexOf(' ', maxLength);
  return `${flat.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
};
