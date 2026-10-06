/**
 * Gateway marsruutide tabel — õpilased saavad seostada path prefixi teenusega.
 *
 * | Avalik path (gateway)     | Sihtteenus            | Upstream path              |
 * |---------------------------|-----------------------|----------------------------|
 * | GET/POST /api/users...    | users-service         | /users...                  |
 * | GET /api/books...         | catalog-service       | /books...                  |
 * | GET/POST /api/orders...   | orders-service        | /orders...                 |
 * | GET /api/notifications... | notifications-service | /history...                |
 */

function buildRouteTable(config) {
  return [
    {
      name: 'users',
      publicPrefix: '/api/users',
      target: config.usersServiceUrl,
      upstreamPrefix: '/users',
      description: 'Kasutajate profiilid ja nimekirjad',
    },
    {
      name: 'catalog',
      publicPrefix: '/api/books',
      target: config.catalogServiceUrl,
      upstreamPrefix: '/books',
      description: 'Raamatukataloog ja hinnad',
    },
    {
      name: 'orders',
      publicPrefix: '/api/orders',
      target: config.ordersServiceUrl,
      upstreamPrefix: '/orders',
      description: 'Tellimuste loomine ja päring',
    },
    {
      name: 'notifications',
      publicPrefix: '/api/notifications',
      target: config.notificationsServiceUrl,
      upstreamPrefix: '/history',
      description: 'Saadetud teavituste ajalugu (õppeotstarbeks)',
    },
  ];
}

module.exports = { buildRouteTable };
