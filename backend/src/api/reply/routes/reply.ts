export default {
  routes: [
    {
      method: 'POST',
      path: '/discussions/:slug/replies',
      handler: 'api::reply.reply.create',
      config: {
        policies: ['global::is-authenticated', 'global::forbid-author-override'],
      },
    },
  ],
};
