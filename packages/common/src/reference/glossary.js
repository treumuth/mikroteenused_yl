/**
 * Mikroteenuste sõnastik — seotud selle projekti konkreetsete failidega.
 */

const GLOSSARY = [
  {
    term: 'Mikroteenuse piir',
    definition:
      'Iga teenus (users, catalog, orders, notifications) on eraldi protsess/konteiner oma andmetega.',
    seeAlso: ['services/users-service/src/repositories/userRepository.js'],
  },
  {
    term: 'API Gateway',
    definition: 'Üks avalik sissepääs, mis marsruudib /api/* päringud õigele teenusele.',
    seeAlso: ['services/api-gateway/src/routes/routeTable.js'],
  },
  {
    term: 'Orchestration',
    definition: 'orders-service koordineerib mitut teenust tellimuse loomiseks.',
    seeAlso: ['services/orders-service/src/services/createOrder.js'],
  },
  {
    term: 'Saga / kompensatsioon',
    definition: 'Kui reserveerimine ebaõnnestub, releaseStock taastab varasemad reserveeringud.',
    seeAlso: ['services/orders-service/src/services/createOrder.js', 'rollbackReservations'],
  },
  {
    term: 'Health check',
    definition: 'GET /health — docker-compose kasutab seda depends_on condition: service_healthy jaoks.',
    seeAlso: ['packages/common/src/health.js', 'docker-compose.yml'],
  },
  {
    term: 'Upstream',
    definition: 'Teine mikroteenuse instants, mida ServiceClient HTTP kaudu kutsub.',
    seeAlso: ['packages/common/src/serviceClient.js'],
  },
  {
    term: 'Seed andmed',
    definition: 'JSON fail algväärtustega; laetakse teenuse käivitamisel mällu.',
    seeAlso: ['services/catalog-service/data/seed.json'],
  },
  {
    term: 'Path rewrite',
    definition: 'Gateway asendab /api/orders prefiksi /orders-ga enne orders-service poole saatmist.',
    seeAlso: ['services/api-gateway/src/proxy/registerProxies.js'],
  },
  {
    term: '409 Conflict',
    definition: 'Kasutatakse laoseisu puudumise korral catalog-service reserveStock meetodis.',
    seeAlso: ['services/catalog-service/src/repositories/bookRepository.js'],
  },
  {
    term: 'Sünkroonne side',
    definition: 'orders-service ootab notifications POST /notify vastust samas voos (stub).',
    seeAlso: ['services/notifications-service/src/services/notificationService.js'],
  },
];

function getGlossary() {
  return GLOSSARY;
}

module.exports = { GLOSSARY, getGlossary };
