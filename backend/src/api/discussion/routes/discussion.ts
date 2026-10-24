/**
 * Explicit routes instead of the core router: discussions are addressed by slug in
 * public URLs, and update/delete are intentionally not exposed to members.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/discussions',
      handler: 'api::discussion.discussion.find',
    },
    {
      method: 'GET',
      path: '/discussions/:slug',
      handler: 'api::discussion.discussion.findOne',
    },
    {
      method: 'POST',
      path: '/discussions',
      handler: 'api::discussion.discussion.create',
      config: {
        policies: ['global::is-authenticated', 'global::forbid-author-override'],
      },
    },
  ],
};
