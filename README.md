# Raamatupood — mikroteenuste demo ja ülesanne

Node.js + Express mikroteenuste näidis **algtaseme** õppimiseks. Õpilased loevad koodi ja vastavad [`ULEANNE.md`](ULEANNE.md) küsimustele; õpetaja vastused on [`OPETAJA_VASTUSED.md`](OPETAJA_VASTUSED.md).

## Arhitektuur

```text
Klient → api-gateway:8080 → (users | catalog | orders | notifications)
orders-service → HTTP → users, catalog, notifications
```

## Eeldused

- Docker Desktop (soovituslik demo jaoks)
- Node 20 (kui soovid teenuseid ilma Dockerita käivitada)

## Käivitamine Dockeriga

```bash
npm run up
```

Peata:

```bash
npm run down
```

### Portid

| Teenus | Port |
|--------|------|
| api-gateway | 8080 |
| users-service | 3001 |
| catalog-service | 3002 |
| orders-service | 3003 |
| notifications-service | 3004 |

Health: `GET http://localhost:8080/health` (ja sama `/health` igal teenusel otseselt).

## Näidis-ID-d (seed)

**Kasutajad** — [`services/users-service/data/seed.json`](services/users-service/data/seed.json):

- `usr-001` — aktiivne (Mari)
- `usr-003` — **mitteaktiivne** (test)

**Raamatud** — [`services/catalog-service/data/seed.json`](services/catalog-service/data/seed.json):

- `book-101` — laos olemas
- `book-103` — **stock 0** (konflikti test)

## Näidis-päringud

### Raamat

```bash
curl -s http://localhost:8080/api/books/book-101
```

### Edukas tellimus

```bash
curl -s -X POST http://localhost:8080/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"usr-001\",\"lines\":[{\"bookId\":\"book-101\",\"quantity\":1}]}"
```

(PowerShellis võid kasutada ka `Invoke-RestMethod`.)

### Laoseisu konflikt (book-103)

```bash
curl -s -X POST http://localhost:8080/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"usr-001\",\"lines\":[{\"bookId\":\"book-103\",\"quantity\":1}]}"
```

Oodatav: HTTP **409**.

### Gateway marsruutide loetelu

```bash
curl -s http://localhost:8080/api/routes
```

## Olulised failid õppimiseks

- [`services/api-gateway/src/routes/routeTable.js`](services/api-gateway/src/routes/routeTable.js)
- [`services/orders-service/src/services/createOrder.js`](services/orders-service/src/services/createOrder.js)
- [`services/catalog-service/src/repositories/bookRepository.js`](services/catalog-service/src/repositories/bookRepository.js)
- [`docker-compose.yml`](docker-compose.yml)

## Struktuur

```text
packages/common/          — jagatud logimine, vead, ServiceClient, health
services/api-gateway/
services/users-service/
services/catalog-service/
services/orders-service/
services/notifications-service/
```
