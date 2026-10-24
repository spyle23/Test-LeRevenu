import { errors } from '@strapi/utils';

/**
 * Role permissions already keep anonymous visitors out of write routes. This policy is
 * the second lock: if someone grants a write action to the Public role from the admin
 * panel, publishing still requires a signed-in member.
 */
export default (policyContext: { state: { user?: unknown } }) => {
  if (policyContext.state.user) return true;

  throw new errors.UnauthorizedError('Connectez-vous pour publier.');
};
