module.exports = {
  serviceName: 'notifications-service',
  port: Number(process.env.PORT) || 3004,
  logLevel: process.env.LOG_LEVEL || 'info',
  maxHistory: Number(process.env.MAX_HISTORY) || 500,
};
