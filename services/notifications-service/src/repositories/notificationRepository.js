/**
 * Teavitused salvestatakse mällu — simuleerib "saadetud e-kirju" logi.
 * Päris süsteemis võiks orders-service postitada sõnumijärjekorda (RabbitMQ, Kafka);
 * siin on teadlikult lihtne sünkroonne HTTP kutse orders → notifications.
 */

class NotificationRepository {
  constructor(maxHistory, logger) {
    this.maxHistory = maxHistory;
    this.logger = logger;
    this.items = [];
  }

  append(entry) {
    this.items.unshift(entry);
    if (this.items.length > this.maxHistory) {
      this.items.length = this.maxHistory;
    }
    this.logger.info('Notification recorded', {
      id: entry.id,
      type: entry.type,
      orderId: entry.orderId,
    });
    return entry;
  }

  list(limit = 50) {
    return this.items.slice(0, limit);
  }

  findByOrderId(orderId) {
    return this.items.filter((n) => n.orderId === orderId);
  }
}

module.exports = { NotificationRepository };
