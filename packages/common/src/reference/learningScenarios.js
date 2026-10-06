/**
 * Õppestsenaariumid — kirjeldavad, kuidas erinevad requestid süsteemis liiguvad.
 * Fail on tahtlikult pikk, et simuleerida suurem koodibaasi navigeerimist.
 */

const SCENARIOS = [];

function addScenario(id, title, steps) {
  SCENARIOS.push({ id, title, steps });
}

addScenario('S1', 'Edukas tellimus ühe raamatuga', [
  'Klient saadab POST http://localhost:8080/api/orders kehaga userId ja lines.',
  'api-gateway rateLimitStub lubab päringu läbi ja logib requestLogger middleware.',
  'Gateway proxy suunab /api/orders → orders-service POST /orders.',
  'orders-service validateerib userId ja lines massiivi.',
  'orders-service kutsub GET users-service/users/:id — kasutaja peab olema active.',
  'orders-service kutsub GET catalog-service/books/:id — loeb unitPriceCents.',
  'orders-service kutsub POST catalog-service/stock/reserve reservationId-ga.',
  'Kui reserve OK, orders-service arvutab lineTotalCents ja totalCents.',
  'Tellimus salvestatakse orderRepository mällu.',
  'Iga rea jaoks POST catalog-service/stock/commit vähendab stock.',
  'orders-service kutsub POST notifications-service/notify tüübiga ORDER_CONFIRMED.',
  'Klient saab 201 vastuse koos orderId ja totalEuros.',
]);

addScenario('S2', 'Laoseisu konflikt teisel real', [
  'Klient tellib kaks rida — esimene reserveerub edukalt.',
  'Teisel real POST /stock/reserve tagastab 409 INSUFFICIENT_STOCK.',
  'createOrder püüab vea ja kutsub rollbackReservations.',
  'rollbackReservations teeb POST /stock/release iga varasema rea kohta.',
  'Klient saab 409 ja sõnumi insufficient stock.',
  'Tellimust orderRepository ei salvestata.',
  'notifications-service ei saa kutset.',
]);

addScenario('S3', 'Kasutajat ei eksisteeri', [
  'POST /api/orders userId-ga, mida seed.json ei sisalda.',
  'users-service tagastab 404 USER_NOT_FOUND.',
  'ServiceClient tõstab AppError sama staatuskoodiga.',
  'createOrder mapib 404 USER_NOT_FOUND selge sõnumiga.',
  'Laoseisu reserveerimist ei alustata.',
]);

addScenario('S4', 'Mitteaktiivne kasutaja', [
  'userId usr-003 on seed-is active: false.',
  'GET /users/usr-003 tagastab profiili, kuid createOrder kontrollib user.active.',
  'Kui fetchUser õnnestub, viskab createOrder 403 USER_INACTIVE.',
  'Alternatiiv: validate-order endpoint users-service-is tagastaks 403 otse.',
]);

addScenario('S5', 'Gateway CORS eelflight', [
  'Brauser saadab OPTIONS /api/orders.',
  'Gateway index.js middleware vastab 204 ilma upstream kutseta.',
  'See on gateway cross-cutting funktsioon, mitte orders-service ots.',
]);

addScenario('S6', 'Otse orders-service vs gateway', [
  'Arendaja võib kutsuda POST localhost:3003/orders ilma gateway-ta.',
  'See on sama äriloogika, kuid tootmises avalik liikluse port on 8080.',
  'Mikroteenuste mõte: gateway peidab sisemised portid ja ühtlustab /api prefiksit.',
]);

addScenario('S7', 'Raamat laos null', [
  'book-103 seed-is stock: 0.',
  'GET /api/books/book-103 näitab stockAvailable 0.',
  'POST tellimus selle bookId-ga ebaõnnestub reserveerimisel 409-ga.',
]);

addScenario('S8', 'Healthcheck ahel docker-compose', [
  'users, catalog, notifications käivituvad esimesena.',
  'orders-service depends_on healthy tingimusel.',
  'api-gateway ootab ka orders-service health.',
  'See vähendab race conditioni, kus tellimus tehakse enne upstream valmisolekut.',
]);

addScenario('S9', 'Notification sync vs queue', [
  'Selles projektis orders-service kutsub notify otse HTTP POST-iga.',
  'See on sünkroonne side: tellimuse loomise voog ootab notify vastust (või logib vea).',
  'Päris süsteemis saadetaks sageli sõnum queue-sse ja notify töötleks async.',
]);

addScenario('S10', 'Kogusumma arvutus', [
  'Hind tuleb catalog-service book.priceCents väljast.',
  'orders-service korrutab quantity * unitPriceCents iga rea jaoks.',
  'calculateOrderTotalCents liidab read kokku createOrder.js failis.',
]);

// Laiendatud stsenaariumid (korduvad variatsioonid õppimiseks)
const VARIATIONS = [
  ['S11', 'Kaks sama raamatut erinevates ridades', 'Eraldi reserveerimine iga rea kohta.'],
  ['S12', 'Suur quantity vs väike stock', '409 kui quantity > stockAvailable.'],
  ['S13', 'Vale bookId', '404 BOOK_NOT_FOUND catalog-service-st.'],
  ['S14', 'Puuduv lines massiiv', '400 VALIDATION_ERROR orders-service.'],
  ['S15', 'quantity 0', '400 positive integer validation.'],
  ['S16', 'Gateway 502 upstream maas', 'Proxy error handler tagastab BAD_GATEWAY.'],
  ['S17', 'Rate limit 429', 'Liiga palju päringuid samalt IP-lt gateway-s.'],
  ['S18', 'GET tellimus pärast POST', 'GET /api/orders/:orderId loeb mälust.'],
  ['S19', 'Notifications history', 'GET /api/notifications näitab varasemaid notify kirjeid.'],
  ['S20', 'Catalog search meta', 'GET catalog-service /catalog/search filtreerib seed raamatuid.'],
];

for (const [id, title, detail] of VARIATIONS) {
  addScenario(id, title, [
    detail,
    'Vaata vastava teenuse routes ja service kihti.',
    'Jälgi HTTP staatuskoode packages/common reference/restConventions.js failis.',
    'Märgi, millised sammud on gateway vs sisemised teenused.',
  ]);
}

// Pikemad narratiivsed plokid
for (let i = 1; i <= 25; i += 1) {
  addScenario(
    `SX${i}`,
    `Lisaharjutus ${i}: voogude kaardistamine`,
    [
      `Harjutus ${i}a: ava services/orders-service/src/services/createOrder.js ja leia try/catch reserveerimise ümbruses.`,
      `Harjutus ${i}b: ava services/api-gateway/src/routes/routeTable.js ja seosta publicPrefix upstreamPrefix-ga.`,
      `Harjutus ${i}c: ava services/catalog-service/src/repositories/bookRepository.js reserveStock meetod.`,
      `Harjutus ${i}d: märgi docker-compose.yml environment muutujad orders-service jaoks.`,
      `Harjutus ${i}e: selgita klassikaline mikroteenuse reegel — iga teenus omab oma andmeid.`,
      `Harjutus ${i}f: users-service seed.json ei ole jagatud fail orders-service-ga; andmed liiguvad HTTP kaudu.`,
      `Harjutus ${i}g: notifications-service ei loe tellimust orders mälust; saab ainult POST /notify payloadi.`,
      `Harjutus ${i}h: gateway /api/notifications proxy pathRewrite asendab prefiksi /history-ga.`,
    ]
  );
}

function getLearningScenarios() {
  return SCENARIOS;
}

function findScenario(id) {
  return SCENARIOS.find((s) => s.id === id) || null;
}

module.exports = { getLearningScenarios, findScenario, SCENARIOS };
