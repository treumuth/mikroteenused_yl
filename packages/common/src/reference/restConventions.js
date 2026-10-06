/**
 * REST ja HTTP konventsioonid selles monorepos.
 * Õpilased võivad seda faili kasutada küsimustele vastates (põhimõisted).
 *
 * Mikroteenuse piirang: iga teenus avaldab oma API; teised teenused ei pääse otse
 * teise teenuse mälust andmeid lugema — ainult HTTP kaudu.
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_SHAPE = {
  description: 'Kõik teenused tagastavad vea kujul { error: { code, message, details? } }',
  example: {
    error: {
      code: 'USER_NOT_FOUND',
      message: 'User not found',
      details: { userId: 'usr-999' },
    },
  },
};

const RESOURCE_NAMING = [
  'Kasuta mitmuse nimetusi path-is: /users, /books, /orders',
  'Üksik ressurss ID-ga: GET /users/:id',
  'Alamressursid eraldi path-ina: POST /stock/reserve (catalog-service sisemine API)',
];

const IDEMPOTENCY_NOTES = `
Tellimuse POST /orders ei ole idempotent (iga kutse loob uue tellimuse).
Laoseisu reserveerimisel kasutatakse reservationId, et release saaks õige reserveeringu tühistada.
`;

const GATEWAY_VS_DIRECT = `
Klient peaks alati kasutama api-gateway port 8080 ja /api/... prefiksit.
Orders-service kutsub catalog-service otse docker võrgus (CATALOG_SERVICE_URL), mitte läbi gateway —
see on tüüpiline server-to-server side mikroteenuste arhitektuuris.
`;

const HEALTH_ENDPOINT = `
GET /health igas teenuses tagastab { status: "ok", service, uptimeSeconds }.
Docker healthcheck kasutab seda, et oodata kuni konteiner on valmis (depends_on condition).
`;

function getRestConventionsSummary() {
  return {
    httpStatus: HTTP_STATUS,
    errorShape: ERROR_SHAPE,
    resourceNaming: RESOURCE_NAMING,
    notes: {
      idempotency: IDEMPOTENCY_NOTES.trim(),
      gatewayVsDirect: GATEWAY_VS_DIRECT.trim(),
      health: HEALTH_ENDPOINT.trim(),
    },
  };
}

module.exports = {
  HTTP_STATUS,
  ERROR_SHAPE,
  getRestConventionsSummary,
};
