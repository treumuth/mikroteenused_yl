/**
 * Kogu süsteemi API kataloog (dokumentatsioon koodis).
 * Aitab õpilastel orienteeruda ilma Postmanita.
 */

const SYSTEM_API_CATALOG = [
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'GET',
    path: '/health',
    purpose: 'Gateway elusignaal',
    responseExample: { status: 'ok', service: 'api-gateway' },
  },
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'GET',
    path: '/api/',
    purpose: 'Loetelu avalikest entrypointidest',
  },
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'GET',
    path: '/api/routes',
    purpose: 'Marsruutide tabel proxy jaoks',
  },
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'GET',
    path: '/api/users',
    upstream: 'users-service GET /users',
    purpose: 'Kasutajate nimekiri',
  },
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'GET',
    path: '/api/users/:id',
    upstream: 'users-service GET /users/:id',
    purpose: 'Ühe kasutaja profiil',
  },
  {
    service: 'users-service',
    visibility: 'internal',
    method: 'GET',
    path: '/users/:id/validate-order',
    purpose: 'Kontroll enne tellimust (active kasutaja)',
  },
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'GET',
    path: '/api/books',
    upstream: 'catalog-service GET /books',
    purpose: 'Raamatute nimekiri',
  },
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'GET',
    path: '/api/books/:id',
    upstream: 'catalog-service GET /books/:id',
    purpose: 'Raamatu detail koos laoseisuga',
  },
  {
    service: 'catalog-service',
    visibility: 'internal',
    method: 'POST',
    path: '/stock/reserve',
    purpose: 'Lao reserveerimine tellimuse jaoks',
    bodyExample: { bookId: 'book-101', quantity: 1, reservationId: 'ord-xxx-line-0' },
  },
  {
    service: 'catalog-service',
    visibility: 'internal',
    method: 'POST',
    path: '/stock/release',
    purpose: 'Reserveeringu tühistamine (rollback)',
  },
  {
    service: 'catalog-service',
    visibility: 'internal',
    method: 'POST',
    path: '/stock/commit',
    purpose: 'Reserveeringu kinnitamine pärast tellimuse salvestamist',
  },
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'POST',
    path: '/api/orders',
    upstream: 'orders-service POST /orders',
    purpose: 'Uue tellimuse loomine',
    bodyExample: {
      userId: 'usr-001',
      lines: [{ bookId: 'book-101', quantity: 1 }],
    },
  },
  {
    service: 'orders-service',
    visibility: 'internal',
    method: 'POST',
    path: '/orders',
    purpose: 'Sama mis gateway /api/orders, otse teenuses',
  },
  {
    service: 'notifications-service',
    visibility: 'internal',
    method: 'POST',
    path: '/notify',
    purpose: 'Tellimuse kinnituse teavitus (sync HTTP)',
  },
  {
    service: 'api-gateway',
    visibility: 'public',
    method: 'GET',
    path: '/api/notifications',
    upstream: 'notifications-service GET /history',
    purpose: 'Teavituste ajalugu',
  },
];

function describeCatalogEntry(entry) {
  const lines = [
    `[${entry.service}] ${entry.method} ${entry.path}`,
    `  Nähtavus: ${entry.visibility}`,
    `  Eesmärk: ${entry.purpose}`,
  ];
  if (entry.upstream) {
    lines.push(`  Upstream: ${entry.upstream}`);
  }
  if (entry.bodyExample) {
    lines.push(`  Näidis keha: ${JSON.stringify(entry.bodyExample)}`);
  }
  if (entry.responseExample) {
    lines.push(`  Näidis vastus: ${JSON.stringify(entry.responseExample)}`);
  }
  return lines.join('\n');
}

function getSystemApiCatalog() {
  return SYSTEM_API_CATALOG;
}

function printCatalogAsText() {
  return SYSTEM_API_CATALOG.map(describeCatalogEntry).join('\n\n');
}

module.exports = {
  SYSTEM_API_CATALOG,
  getSystemApiCatalog,
  printCatalogAsText,
  describeCatalogEntry,
};
