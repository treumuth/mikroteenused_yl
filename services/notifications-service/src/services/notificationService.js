const crypto = require('crypto');
const { AppError, validateNonEmptyString } = require('@raamatupood/common');
const { buildTemplate } = require('../templates/emailTemplates');

class NotificationService {
  constructor(repository) {
    this.repo = repository;
  }

  /**
   * POST /notify — orders-service kutsub pärast tellimuse salvestamist.
   * See on push-mudel (teenus teavitatakse kohe), mitte polling ega message queue.
   */
  notify(payload) {
    const type = validateNonEmptyString(payload.type, 'type');
    const orderId = validateNonEmptyString(payload.orderId, 'orderId');
    const userId = validateNonEmptyString(payload.userId, 'userId');

    if (type !== 'ORDER_CONFIRMED') {
      throw new AppError('Unsupported notification type', 400, 'UNSUPPORTED_TYPE', { type });
    }

    const email = payload.email || 'unknown@example.ee';
    const totalCents = Number(payload.totalCents) || 0;
    const lineCount = Number(payload.lineCount) || 0;

    const rendered = buildTemplate(type, {
      orderId,
      userId,
      email,
      totalCents,
      lineCount,
      userDisplayName: payload.userDisplayName,
    });

    const entry = {
      id: `ntf-${crypto.randomBytes(4).toString('hex')}`,
      type,
      orderId,
      userId,
      email,
      totalCents,
      lineCount,
      channel: 'email-stub',
      subject: rendered.subject,
      bodyPreview: rendered.text.slice(0, 240),
      createdAt: new Date().toISOString(),
      status: 'sent-stub',
    };

    return this.repo.append(entry);
  }

  getHistory(limit) {
    return { items: this.repo.list(limit) };
  }

  getByOrder(orderId) {
    return { items: this.repo.findByOrderId(orderId) };
  }
}

module.exports = { NotificationService };
