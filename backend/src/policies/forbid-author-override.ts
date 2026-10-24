import { errors } from '@strapi/utils';

interface PolicyContext {
  state: { user?: { id: number; documentId: string } };
  request: { body?: { data?: { author?: unknown } } };
}

const designatesUser = (value: unknown, user: { id: number; documentId: string }) =>
  value === user.id || value === String(user.id) || value === user.documentId;

/**
 * Controllers always take the author from the JWT. This policy makes an attempt to
 * post on behalf of someone else explicit (403) instead of silently rewriting it.
 */
export default (policyContext: PolicyContext) => {
  const author = policyContext.request.body?.data?.author;
  if (author === undefined || author === null) return true;

  const { user } = policyContext.state;
  if (user && designatesUser(author, user)) return true;

  throw new errors.PolicyError('Vous ne pouvez pas publier au nom d’un autre membre.', {
    policy: 'forbid-author-override',
  });
};
