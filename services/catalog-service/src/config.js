const path = require('path');

module.exports = {
  serviceName: 'catalog-service',
  port: Number(process.env.PORT) || 3002,
  seedPath: process.env.SEED_PATH || path.join(__dirname, '..', 'data', 'seed.json'),
  logLevel: process.env.LOG_LEVEL || 'info',
};
