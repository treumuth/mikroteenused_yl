/**
 * Orders-service seob end teiste mikroteenustega URL-ide kaudu.
 * Docker Compose seab USERS_SERVICE_URL, CATALOG_SERVICE_URL, NOTIFICATIONS_SERVICE_URL
 * konteinerite sisemiste hostinimedega (nt http://users-service:3001).
 */

module.exports = {
  serviceName: 'orders-service',
  port: Number(process.env.PORT) || 3003,
  logLevel: process.env.LOG_LEVEL || 'info',
  usersServiceUrl: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
  catalogServiceUrl: process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
  notificationsServiceUrl: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004',
};
