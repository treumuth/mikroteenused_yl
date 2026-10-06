# Mikroteenused — koodibaasi lugemise ülesanne (algtase)

## Kontekst

See repository simuleerib väikest **veebiraamatupoodi**, mis on jaotatud mitmeks **mikroteenuseks**:

- **api-gateway** — klientide ühtne sissepääs (port **8080**)
- **users-service** — kasutajad
- **catalog-service** — raamatud, hinnad ja laoseis
- **orders-service** — tellimuste loomine (koordineerib teisi teenuseid)
- **notifications-service** — tellimuse kinnituse teavitused (stub)

Sinu ülesanne **ei nõua** kogu süsteemi ümberkirjutamist. Loe koodi, jälgi vooge ja vasta küsimustele. Allikas on ainult see repository (v.a. üldine HTTP/REST teadmine).

## Soovituslik töökord

1. Alusta [`docker-compose.yml`](docker-compose.yml) ja [`services/api-gateway/src/routes/routeTable.js`](services/api-gateway/src/routes/routeTable.js) failist — saad ülevaate, kuhu päringud suunatakse.
2. Tellimuse voog on ülesande tuum: [`services/orders-service/src/services/createOrder.js`](services/orders-service/src/services/createOrder.js).
3. Kasutajate ja raamatute algandmed on seed failides (`data/seed.json`).

Valikuline: käivita `npm run up` juurkaustas (vajab Dockerit) ja proovi päringuid README näidete järgi.

## Küsimused (10)

Vasta lühidalt, kuid **põhjendatult**. Viita võimalusel **failidele ja funktsioonidele** (nt `createOrder.js`, `routeTable.js`).

### 1. Gateway marsruutimine

Millised **avalikud** path prefiksid (gateway kaudu, `/api/...`) suunatakse millisele teenusele? Koosta tabel: **avalik path** → **teenuse nimi** → **upstream path** (vt gateway marsruutide seadistust).

### 2. REST — tellimuse loomine

Millise **HTTP meetodi** ja **täieliku path-iga** (kliendi vaatenurgast, gateway kaudu) saab **uue tellimuse** luua?

### 3. Orchestration eduka tellimuse puhul

Kirjelda **järjestuses** vähemalt **viis sammu**, mis toimuvad **eduka** tellimuse loomisel. Maini vähemalt **nelja** erinevat teenust või nende API kutset (nt users, catalog, orders, notifications).

### 4. Laoseisu konflikt

Mis juhtub, kui tellimuse **ühel real** ei piisa laoseisu?  
- Milline **HTTP staatus** tagastatakse?  
- Kas varem reserveeritud read **tagasi pööratakse**? Kui jah, **kus** see koodis toimub?

### 5. Konfiguratsioon

Kust **orders-service** teab **catalog-service** aadressi? Miks see on **keskkonnamuutuja** (mitte näiteks kõvakooditud `http://localhost:3002` tootmises)?

### 6. Veakäsitlus — kasutaja

Mis **HTTP staatus** tagastatakse ja **millisel tingimusel**, kui:

- tellimuse kehas **puudub** `userId`, või  
- `userId` on olemas, kuid **kasutajat ei leita**?

### 7. API gateway roll

Selgita oma sõnadega, mis on **API gateway** roll selles projektis. Too **üks konkreetne näide** koodist (nt CORS, `/api` prefiks, proxy, rate limit).

### 8. Catalog andmed

Kust **catalog-service** saab **algse** hinna ja laoseisu? Kirjelda, **milline fail** (või failid) ja **milline repository** seda laadib.

### 9. Teavituste side

Kuidas **notifications-service** saab teada, et tellimus on loodud? Kas see on **sünkroonne HTTP kutse**, **sõnumijärjekord** või midagi muud? Selgita, mida **see koodibaas** tegelikult teeb.

### 10. Kogusumma

**Kus** arvutatakse tellimuse **kogusumma** (sentides või eurodes)? **Millise teenuse** andmeid (hind, kogus jne) kasutatakse?

---

Esita vastused dokumendina (PDF või Markdown). Iga vastuse juures soovitame vähemalt ühte **failiviidet**.
