import type { Core } from '@strapi/strapi';
import type { DiscussionService } from '../api/discussion/services/discussion';
import { DEMO_CATEGORIES, DEMO_DISCUSSIONS, DEMO_USERS } from './demo-data';

const USER_UID = 'plugin::users-permissions.user';
const ROLE_UID = 'plugin::users-permissions.role';
const CATEGORY_UID = 'api::category.category';
const DISCUSSION_UID = 'api::discussion.discussion';
const REPLY_UID = 'api::reply.reply';

const HOUR = 60 * 60 * 1000;

export const DEFAULT_DEMO_PASSWORD = 'Revenu2026!';

const hoursAgo = (now: number, hours: number) => new Date(now - hours * HOUR);

/**
 * Seeds the mock-up content once, on an empty database. Everything runs in a single
 * transaction so an interrupted seed never leaves a half-filled community behind.
 */
export const seedDemoData = async (strapi: Core.Strapi) => {
  if ((await strapi.documents(CATEGORY_UID).count({})) > 0) return;

  strapi.log.info('[seed] Empty database, loading the demo community…');
  const now = Date.now();
  const password = process.env.DEMO_USERS_PASSWORD || DEFAULT_DEMO_PASSWORD;

  await strapi.db.transaction(async () => {
    const authenticated = await strapi.db.query(ROLE_UID).findOne({ where: { type: 'authenticated' } });
    const userIds = new Map<string, string>();

    for (const user of DEMO_USERS) {
      const existing = await strapi.db.query(USER_UID).findOne({ where: { username: user.username } });
      const record =
        existing ??
        (await strapi.plugin('users-permissions').service('user').add({
          ...user,
          email: `${user.username.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@demo.lerevenu.fr`,
          password,
          provider: 'local',
          confirmed: true,
          blocked: false,
          role: authenticated.id,
        }));
      userIds.set(user.username, record.documentId);
    }

    const categoryIds = new Map<string, string>();
    for (const [position, category] of DEMO_CATEGORIES.entries()) {
      const created = await strapi.documents(CATEGORY_UID).create({ data: { ...category, position } });
      categoryIds.set(category.slug, created.documentId);
    }

    const discussions = strapi.service(DISCUSSION_UID) as unknown as DiscussionService;

    for (const item of DEMO_DISCUSSIONS) {
      const createdAt = hoursAgo(now, item.hoursAgo);
      const discussion = await strapi.documents(DISCUSSION_UID).create({
        data: {
          title: item.title,
          content: item.content,
          type: item.type,
          slug: await discussions.generateSlug(item.title),
          author: userIds.get(item.author),
          category: categoryIds.get(item.category),
        },
      });

      let lastActivityAt = createdAt;
      for (const [index, [author, content]] of item.replies.entries()) {
        const reply = await strapi.documents(REPLY_UID).create({
          data: { content, author: userIds.get(author), discussion: discussion.documentId },
        });

        // Replies are spread between the question and now, like in the mock-up.
        const replyHoursAgo = item.hoursAgo - (item.hoursAgo * (index + 1)) / (item.replies.length + 1.4);
        lastActivityAt = hoursAgo(now, replyHoursAgo);
        await strapi.db.query(REPLY_UID).update({
          where: { documentId: reply.documentId },
          data: { createdAt: lastActivityAt, updatedAt: lastActivityAt },
        });
      }

      await strapi.db.query(DISCUSSION_UID).update({
        where: { documentId: discussion.documentId },
        data: { createdAt, updatedAt: lastActivityAt, lastActivityAt, replyCount: item.replies.length },
      });
    }
  });

  strapi.log.info(
    `[seed] ${DEMO_USERS.length} members, ${DEMO_CATEGORIES.length} spaces and ${DEMO_DISCUSSIONS.length} discussions created.`
  );
};
