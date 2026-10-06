const { ServiceClient } = require('@raamatupood/common');

/**
 * Eraldi wrapperid iga upstream teenuse jaoks — hoiab createOrder loetavana.
 */
function createUpstreamClients(config, logger) {
  const users = new ServiceClient({ baseUrl: config.usersServiceUrl, logger });
  const catalog = new ServiceClient({ baseUrl: config.catalogServiceUrl, logger });
  const notifications = new ServiceClient({
    baseUrl: config.notificationsServiceUrl,
    logger,
  });

  return {
    async fetchUser(userId) {
      const data = await users.get(`/users/${encodeURIComponent(userId)}`);
      return data.user;
    },

    async fetchBook(bookId) {
      const data = await catalog.get(`/books/${encodeURIComponent(bookId)}`);
      return data.book;
    },

    async reserveStock(bookId, quantity, reservationId) {
      return catalog.post('/stock/reserve', { bookId, quantity, reservationId });
    },

    async releaseStock(bookId, quantity, reservationId) {
      return catalog.post('/stock/release', { bookId, quantity, reservationId });
    },

    async commitStock(bookId, quantity) {
      return catalog.post('/stock/commit', { bookId, quantity });
    },

    async sendOrderNotification(payload) {
      return notifications.post('/notify', payload);
    },
  };
}

module.exports = { createUpstreamClients };
