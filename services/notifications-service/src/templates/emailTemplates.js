/**
 * E-kirja mallid (stub) — notifications-service ei saada päris SMTP kaudu,
 * kuid mallid näitavad, kuidas äriloogika eraldatakse transport kihist.
 */

function formatEuros(cents) {
  return `${(Number(cents) / 100).toFixed(2)} EUR`;
}

function orderConfirmedTemplate(payload) {
  const { orderId, email, totalCents, lineCount, userDisplayName } = payload;
  const name = userDisplayName || 'Klient';
  return {
    to: email,
    subject: `Tellimus ${orderId} on kinnitatud`,
    text: [
      `Tere, ${name}!`,
      '',
      `Teie tellimus ${orderId} on edukalt kinnitatud.`,
      `Ridade arv: ${lineCount}`,
      `Summa: ${formatEuros(totalCents)}`,
      '',
      'Täname ostu eest!',
      '— Raamatupood (automaatne teade)',
    ].join('\n'),
    html: [
      `<p>Tere, <strong>${name}</strong>!</p>`,
      `<p>Tellimus <code>${orderId}</code> on kinnitatud.</p>`,
      `<ul><li>Ridu: ${lineCount}</li><li>Summa: ${formatEuros(totalCents)}</li></ul>`,
      '<p>Täname ostu eest!</p>',
    ].join(''),
  };
}

function stockAlertTemplate(payload) {
  return {
    to: payload.email,
    subject: `Lao hoiatus: ${payload.bookTitle}`,
    text: `Raamatul ${payload.bookTitle} on laos alles ${payload.stockAvailable} tk.`,
  };
}

function buildTemplate(type, payload) {
  if (type === 'ORDER_CONFIRMED') {
    return orderConfirmedTemplate(payload);
  }
  if (type === 'STOCK_ALERT') {
    return stockAlertTemplate(payload);
  }
  return {
    to: payload.email || 'unknown@example.ee',
    subject: 'Teade',
    text: 'Unsupported template type',
  };
}

module.exports = { buildTemplate, orderConfirmedTemplate, formatEuros };
