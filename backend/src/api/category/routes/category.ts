export default {
  routes: [
    {
      method: 'GET',
      path: '/categories',
      handler: 'api::category.category.find',
    },
    {
      method: 'GET',
      path: '/categories/:slug',
      handler: 'api::category.category.findOne',
    },
  ],
};
