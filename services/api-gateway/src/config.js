/**
 * API Gateway — ainus avalik sissepääs brauserile / Postmanile.
 * Sisemised teenused on docker võrgus; väljastpoolt käib liikluse läbi gateway port 8080.
 */

module.exports = {
  serviceName: 'api-gateway',
  port: Number(process.env.PORT) || 8080,
  logLevel: process.env.LOG_LEVEL || 'info',
  usersServiceUrl: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
  catalogServiceUrl: process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
  ordersServiceUrl: process.env.ORDERS_SERVICE_URL || 'http://localhost:3003',
  notificationsServiceUrl: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004',
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE) || 120,
};
