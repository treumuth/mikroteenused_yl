/**
 * Users-service konfiguratsioon.
 * PORT — millisel pordil Express kuulab (docker-compose seab 3001).
 * SEED_PATH — algandmed JSON failist (mitte eraldi andmebaas).
 */

const path = require('path');

module.exports = {
  serviceName: 'users-service',
  port: Number(process.env.PORT) || 3001,
  seedPath: process.env.SEED_PATH || path.join(__dirname, '..', 'data', 'seed.json'),
  logLevel: process.env.LOG_LEVEL || 'info',
};
