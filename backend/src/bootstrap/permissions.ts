import type { Core } from '@strapi/strapi';

const ROLE_UID = 'plugin::users-permissions.role';
const PERMISSION_UID = 'plugin::users-permissions.permission';

const READ_ACTIONS = [
  'api::category.category.find',
  'api::category.category.findOne',
  'api::discussion.discussion.find',
  'api::discussion.discussion.findOne',
];

const WRITE_ACTIONS = ['api::discussion.discussion.create', 'api::reply.reply.create'];

const ROLE_ACTIONS: Record<string, string[]> = {
  public: READ_ACTIONS,
  authenticated: [...READ_ACTIONS, ...WRITE_ACTIONS],
};

const MANAGED_PREFIXES = ['api::category.', 'api::discussion.', 'api::reply.'];

/**
 * Permissions as code: on every boot the Public and Authenticated roles are aligned
 * with the table above for the community APIs. A write permission granted to Public
 * by mistake in the admin panel is revoked at the next restart.
 */
export const syncPermissions = async (strapi: Core.Strapi) => {
  const roles = await strapi.db.query(ROLE_UID).findMany({
    where: { type: { $in: Object.keys(ROLE_ACTIONS) } },
  });

  for (const role of roles) {
    const wanted = new Set(ROLE_ACTIONS[role.type]);
    const current = await strapi.db.query(PERMISSION_UID).findMany({
      where: { role: { id: role.id } },
    });

    const managed = current.filter((permission) =>
      MANAGED_PREFIXES.some((prefix) => permission.action.startsWith(prefix))
    );
    const stale = managed.filter((permission) => !wanted.has(permission.action));
    const granted = new Set(managed.map((permission) => permission.action));
    const missing = [...wanted].filter((action) => !granted.has(action));

    if (stale.length) {
      await strapi.db.query(PERMISSION_UID).deleteMany({
        where: { id: { $in: stale.map((permission) => permission.id) } },
      });
    }

    for (const action of missing) {
      await strapi.db.query(PERMISSION_UID).create({ data: { action, role: role.id } });
    }

    if (stale.length || missing.length) {
      strapi.log.info(
        `[permissions] ${role.type}: +${missing.length} / -${stale.length} community permission(s)`
      );
    }
  }
};
