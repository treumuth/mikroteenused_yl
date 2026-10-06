const crypto = require('crypto');

/**
 * Tellimused hoitakse mälus — teenus ei jaga andmebaasi teiste teenustega.
 */
class OrderRepository {
  constructor(logger) {
    this.logger = logger;
    this.ordersById = new Map();
    this.orderSeq = 1000;
  }

  generateOrderId() {
    this.orderSeq += 1;
    const suffix = crypto.randomBytes(3).toString('hex');
    return `ord-${this.orderSeq}-${suffix}`;
  }

  save(order) {
    this.ordersById.set(order.orderId, { ...order, savedAt: new Date().toISOString() });
    this.logger.info('Order persisted in memory', { orderId: order.orderId, totalCents: order.totalCents });
    return order;
  }

  findById(orderId) {
    return this.ordersById.get(orderId) || null;
  }

  listRecent(limit = 20) {
    const all = Array.from(this.ordersById.values());
    all.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
    return all.slice(0, limit);
  }
}

module.exports = { OrderRepository };
