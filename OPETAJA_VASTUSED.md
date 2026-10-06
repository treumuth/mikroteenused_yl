# Õpetaja vastused — mikroteenuste ülesanne

> Failiviited viitavad selle repo seisule; reanumbrid võivad väikeste muudatuste korral nihkuda — otsi sama faili ja funktsiooni nime.

## 1. Gateway marsruutimine

Allikas: [`services/api-gateway/src/routes/routeTable.js`](services/api-gateway/src/routes/routeTable.js)

| Avalik path (gateway) | Teenus | Upstream path |
|----------------------|--------|---------------|
| `/api/users` | users-service | `/users` |
| `/api/books` | catalog-service | `/books` |
| `/api/orders` | orders-service | `/orders` |
| `/api/notifications` | notifications-service | `/history` |

Proxy rewrite: [`services/api-gateway/src/proxy/registerProxies.js`](services/api-gateway/src/proxy/registerProxies.js) — `pathRewrite` asendab `publicPrefix` → `upstreamPrefix`.

**Märkus:** lao endpointid (`/stock/reserve` jne) **ei** läbi gateway-d; neid kutsub **orders-service** otse catalog-service URL-il.

---

## 2. REST — tellimuse loomine

**POST** `http://localhost:8080/api/orders` (või `POST /api/orders` suhtelise path-ina gateway-l).

Upstream: **POST** `/orders` orders-service-s ([`services/orders-service/src/routes/ordersRoutes.js`](services/orders-service/src/routes/ordersRoutes.js)).

---

## 3. Orchestration (edukas tellimus)

Peamine voog: [`services/orders-service/src/services/createOrder.js`](services/orders-service/src/services/createOrder.js)

Võimalik vastus (järjekord):

1. Gateway proxy → **orders-service** `POST /orders`.
2. Valideeritakse `userId` ja `lines`.
3. **GET** `users-service` `/users/:id` — kasutaja olemasolu ja `active`.
4. Iga rea kohta **GET** `catalog-service` `/books/:id` — hind ja meta.
5. Iga rea kohta **POST** `catalog-service` `/stock/reserve`.
6. Arvutatakse read ja `totalCents`; tellimus salvestatakse **orders-service** mällu.
7. Iga rea kohta **POST** `/stock/commit` — laoseis väheneb.
8. **POST** `notifications-service` `/notify` (tüüp `ORDER_CONFIRMED`).
9. Klient saab **201** koos tellimuse andmetega.

---

## 4. Laoseisu konflikt

- **409** (`INSUFFICIENT_STOCK`) — tuleb catalog-service `reserveStock`-ist ([`services/catalog-service/src/repositories/bookRepository.js`](services/catalog-service/src/repositories/bookRepository.js)) ja mapitakse createOrder-s.
- **Jah, tagasipööramine:** `rollbackReservations` kutsub **POST** `/stock/release` juba reserveeritud ridadele ([`createOrder.js`](services/orders-service/src/services/createOrder.js), funktsioon `rollbackReservations`, catch plokis enne vea edasi viskamist).

Tellimust ei salvestata, kui reserveerimine ebaõnnestub.

---

## 5. Konfiguratsioon

[`services/orders-service/src/config.js`](services/orders-service/src/config.js): `catalogServiceUrl: process.env.CATALOG_SERVICE_URL`.

Dockeris: [`docker-compose.yml`](docker-compose.yml) — `CATALOG_SERVICE_URL: http://catalog-service:3002`.

**Miks env:** konteinerite hostinimed ja portid erinevad keskkonna kaupa (dev, docker, pilv); teenused jäävad samaks, muutub ainult konfiguratsioon.

---

## 6. Veakäsitlus — kasutaja

- **Puuduv `userId`:** **400** — [`orderService.js`](services/orders-service/src/services/orderService.js) (`userId is required`).
- **Kasutajat ei leita:** **404** — users-service tagastab 404; createOrder mapib sõnumiga `Cannot create order: user not found` ([`createOrder.js`](services/orders-service/src/services/createOrder.js)).

**Mitteaktiivne kasutaja (lisa):** **403** `USER_INACTIVE` createOrder-s, kui `user.active === false`.

---

## 7. API gateway roll

Näited (üks piisab, mitu on boonus):

- **CORS** päised ja OPTIONS 204 — [`services/api-gateway/src/index.js`](services/api-gateway/src/index.js).
- **Ühtne avalik port** 8080 ja `/api/...` prefiks.
- **Reverse proxy** sisemistele teenustele — `registerProxies.js`.
- **Rate limit stub** — [`rateLimitStub.js`](services/api-gateway/src/middleware/rateLimitStub.js).

---

## 8. Catalog andmed

- Põhiandmed: [`services/catalog-service/data/seed.json`](services/catalog-service/data/seed.json).
- Laiendatud demoandmed: [`services/catalog-service/data/extendedSeed.json`](services/catalog-service/data/extendedSeed.json) (merge käivitamisel).
- Laadimine: [`BookRepository.loadSeed`](services/catalog-service/src/repositories/bookRepository.js) / `ingestSeedFile`.

---

## 9. Teavitused

**Sünkroonne HTTP:** pärast tellimuse salvestamist orders-service kutsub **POST** `/notify` ([`upstreamClients.js`](services/orders-service/src/clients/upstreamClients.js), [`notificationService.js`](services/notifications-service/src/services/notificationService.js)).

**Ei ole** message queue (RabbitMQ/Kafka) — see on teadlik lihtsustus; kommentaarid repository failis.

Kui notify ebaõnnestub, logitakse viga, kuid tellimus jääb salvestatuks ([`createOrder.js`](services/orders-service/src/services/createOrder.js) try/catch notify ümber).

---

## 10. Kogusumma

[`services/orders-service/src/services/createOrder.js`](services/orders-service/src/services/createOrder.js):

- `calculateLineTotalCents(unitPriceCents, quantity)` — hind tuleb **catalog-service** `book.priceCents` väljast (fetchBook).
- `calculateOrderTotalCents(lines)` — liidab read.
- Vastuses ka `totalEuros` string ([`ordersRoutes`](services/orders-service/src/routes/ordersRoutes.js) / createOrder return).

---

## Hindamislisa

- Oodatakse failiviiteid, mitte ainult üldist määratlust.
- Küsimus 3 ja 4 on kriitilised — kontrolli, kas õpilane jälgis **teenuste vahelist** voogu, mitte ainult gateway-d.
