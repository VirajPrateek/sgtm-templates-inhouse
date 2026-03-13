# Game Metadata Lookup in Server-Side GTM (AWS Infrastructure)

**Status:** Proposal / Discussion  
**Date:** 2026-03-13  
**Author:** Analytics Engineering Team

---

## Problem Statement

### Current Client-Side Approach

On the client side, we have a GTM custom HTML tag that:

1. Reads the full `game_impressions` array from the dataLayer (an array of objects with game metadata)
2. Filters by `data-product-id` to find the clicked game
3. Maps the matched object into GA4 ecommerce `items` format
4. Pushes a `select_item` event to the dataLayer

This works because the full `game_impressions` array is available in the browser's dataLayer at the time of the click.

### The Migration Challenge

When moving to server-side GTM, we relay the event (including `data-product-id`) to the sGTM container. However, we **cannot reliably persist the full `game_impressions` array** on the server side for later lookup because:

- **`templateDataStorage` is per-instance, not shared.** The sGTM sandbox API [`templateDataStorage`](https://developers.google.com/tag-platform/tag-manager/server-side/api#templatedatastorage) stores data in memory on a single server/pod. In a multi-instance deployment (multiple Cloud Run revisions, ECS tasks, or Kubernetes pods), there is no guarantee the same instance handles both the impression and the click.
- **We cannot relay the entire impressions array on every click event** — it's too large and wasteful.

So when a `select_item` event arrives at sGTM with just a `gameId`, we have no way to look up the game's `gameName`, `gameType`, `section`, `categorySubType`, `gridPosition`, etc.

---

## Proposed Solution: External Game Metadata Lookup via API

### Architecture

```
Client Browser
    │
    ├── (page load) game_impressions array in dataLayer (as before)
    │
    ├── (click) relay sends event with gameId to sGTM
    │
    ▼
sGTM Container (AWS ECS/EKS)
    │
    ├── sendHttpGet() ──► API Gateway + Lambda ──► DynamoDB
    │                         (game metadata API)
    │
    ├── Receives: { gameId, gameName, gameType, section, ... }
    │
    ├── Maps to GA4 ecommerce items format
    │
    └── Fires GA4 select_item tag
```

### How It Works

1. **A DynamoDB table** stores all game metadata, keyed by `gameId`
2. **A lightweight API** (API Gateway + Lambda) exposes a GET endpoint: `/games/{gameId}`
3. **An sGTM variable template** uses [`sendHttpGet`](https://developers.google.com/tag-platform/tag-manager/server-side/api#sendHttpGet) to call the API and return the game metadata
4. **An sGTM tag** uses the variable to build the GA4 ecommerce payload

### sGTM Sandbox Compatibility

The sGTM sandboxed JavaScript environment supports outbound HTTP calls via:

- [`sendHttpGet(url, options)`](https://developers.google.com/tag-platform/tag-manager/server-side/api#sendHttpGet) — returns a promise resolving to `{statusCode, headers, body}`
- [`sendHttpRequest(url, options, body)`](https://developers.google.com/tag-platform/tag-manager/server-side/api#sendHttpRequest) — same, but supports POST/PUT/etc.

These are the **only way** to reach non-Google services from within sGTM templates. There is no AWS SDK, no direct DynamoDB access, no native Redis client — just HTTP.

### Pseudocode for sGTM Variable Template

```javascript
const sendHttpGet = require('sendHttpGet');
const JSON = require('JSON');
const getEventData = require('getEventData');
const logToConsole = require('logToConsole');

const gameId = getEventData('data_product_id');
if (!gameId) return undefined;

const apiUrl = 'https://<api-gateway-url>/games/' + gameId;

return sendHttpGet(apiUrl, {
  headers: {'x-api-key': '<API_KEY>'},
  timeout: 1000
}).then((result) => {
  if (result.statusCode === 200) {
    return JSON.parse(result.body);
  }
  logToConsole('Game lookup failed: ' + result.statusCode);
  return undefined;
}, () => undefined);
```

---

## Why DynamoDB?

| Criteria | DynamoDB | ElastiCache (Redis) | RDS (Postgres/MySQL) |
|---|---|---|---|
| Latency | Single-digit ms | Sub-ms | ~5-10ms |
| Scaling | Auto, serverless | Manual cluster sizing | Manual |
| Cost at low volume | Very cheap (on-demand) | Fixed cluster cost | Fixed instance cost |
| Operational overhead | Near zero | Moderate | High |
| Key-value lookup fit | Perfect | Perfect | Overkill |
| Serverless option | Yes (on-demand mode) | No | Aurora Serverless (expensive) |

**Recommendation: DynamoDB** — it's the natural fit for key-value lookups, scales automatically, costs almost nothing at our volume, and pairs perfectly with Lambda.

---

## Alternative Approaches Considered

### 1. Enrich at the Datalayer Relay Level

Instead of looking up in sGTM, do the enrichment in our Node.js relay (`datalayer-relay`) before forwarding to sGTM.

**Pros:**
- No sGTM sandbox limitations — full AWS SDK access
- No extra API Gateway/Lambda infrastructure
- Lower latency (one fewer network hop)

**Cons:**
- Couples game metadata logic to the relay
- Relay becomes responsible for more than just relaying
- Harder to reuse the lookup for other sGTM tags/triggers

**Verdict:** Worth considering if we want to keep sGTM templates simple. Could be a Phase 1 approach.

### 2. Use Google Firestore (Pantheon Artemis Pattern)

Google's [Pantheon Artemis template](https://github.com/google-marketing-solutions/gps-sgtm-pantheon/blob/main/sgtm/artemis/README.md) demonstrates using the native [`Firestore` API](https://developers.google.com/tag-platform/tag-manager/server-side/api#firestore) in sGTM for lookups. This is a first-class, built-in API — no HTTP calls needed.

**Pros:**
- Native sGTM API, no external HTTP call needed
- Built-in caching within request scope
- Well-documented pattern (Pantheon project)

**Cons:**
- Requires a GCP project with Firestore
- Our sGTM runs on AWS — we'd need to maintain a GCP Firestore instance just for this
- Cross-cloud latency (AWS sGTM → GCP Firestore)
- `getGoogleAuth` for authentication only works with Google Cloud credentials

**Verdict:** Not practical for our AWS-hosted setup. The Firestore API in sGTM is tightly coupled to GCP.

### 3. Relay the Full Impressions Array with Every Event

Send the entire `game_impressions` array as part of every click event payload.

**Cons:**
- Payload bloat (could be hundreds of games)
- Bandwidth waste
- Doesn't scale

**Verdict:** Not viable.

### 4. Use `templateDataStorage` with Sticky Sessions

Force load balancer to route same user to same sGTM instance.

**Cons:**
- Defeats the purpose of horizontal scaling
- Still unreliable (instance restarts, deployments)
- Complex infrastructure config

**Verdict:** Anti-pattern. Don't do this.

---

## Open Questions for Team Discussion

1. **Data freshness:** How often does game metadata change? This determines our cache/TTL strategy.
   - If rarely: aggressive caching in `templateDataStorage` (per-instance cache) + DynamoDB as source of truth
   - If frequently: short TTL or no caching

2. **Data source:** Where does the canonical game metadata live today? CMS? Database? API? We need a pipeline to populate DynamoDB.

3. **Relay vs. sGTM enrichment:** Do we prefer enriching at the relay level (simpler, fewer moving parts) or at the sGTM level (more flexible, reusable across tags)?

4. **Latency budget:** The `sendHttpGet` call adds network latency to every `select_item` event. Is ~10-50ms acceptable? Should we implement `templateDataStorage` as a per-instance cache to reduce API calls?

5. **API authentication:** API key via header? IAM auth? What's our security posture for this internal API?

6. **Scope:** Is this just for `select_item`, or do other ecommerce events (`view_item`, `add_to_cart`, etc.) also need this lookup?

7. **Fallback behavior:** What happens if the API is down or the gameId isn't found? Fire the event without ecommerce items? Drop it? Log and continue?

---

## Suggested DynamoDB Table Design

**Table name:** `game-metadata`

| Attribute | Type | Description |
|---|---|---|
| `gameId` (PK) | String | Unique game identifier (partition key) |
| `gameName` | String | Internal game name |
| `gameDisplayName` | String | Display name shown to users |
| `gameType` | String | e.g., "slots", "table", "live" |
| `section` | String | Casino section |
| `categorySubType` | String | Sub-category |
| `categorySubLevel` | String | Sub-level category |
| `gameBadges` | String | Badge labels |
| `updatedAt` | String | ISO timestamp of last update |

**On-demand capacity mode** — no need to provision read/write capacity for our volume.

---

## Caching Strategy (Hybrid)

To minimize API calls, combine two layers:

1. **`templateDataStorage`** (per-instance, in-memory): Cache game metadata for ~5-10 minutes. Most instances will serve repeated lookups for popular games from cache.
2. **DynamoDB** (shared, persistent): Source of truth. Only hit when cache misses.

```javascript
const templateDataStorage = require('templateDataStorage');
const sendHttpGet = require('sendHttpGet');
const JSON = require('JSON');
const getTimestampMillis = require('getTimestampMillis');

const cacheKey = 'game_' + gameId;
const cached = templateDataStorage.getItemCopy(cacheKey);
const now = getTimestampMillis();

// Cache for 5 minutes (300000ms)
if (cached && (now - cached.ts) < 300000) {
  return cached.data;
}

return sendHttpGet(apiUrl, {headers: {'x-api-key': key}, timeout: 1000})
  .then((result) => {
    if (result.statusCode === 200) {
      const data = JSON.parse(result.body);
      templateDataStorage.setItemCopy(cacheKey, {data: data, ts: now});
      return data;
    }
    return undefined;
  }, () => undefined);
```

> **Note:** `templateDataStorage` is per-instance. Different pods will build their own cache independently. This is fine — it just means the first request on each instance for a given game will hit the API.

---

## References

- [sGTM Server-Side APIs (full reference)](https://developers.google.com/tag-platform/tag-manager/server-side/api)
- [`sendHttpGet` API](https://developers.google.com/tag-platform/tag-manager/server-side/api#sendHttpGet)
- [`sendHttpRequest` API](https://developers.google.com/tag-platform/tag-manager/server-side/api#sendHttpRequest)
- [`templateDataStorage` API](https://developers.google.com/tag-platform/tag-manager/server-side/api#templatedatastorage)
- [`Firestore` API in sGTM](https://developers.google.com/tag-platform/tag-manager/server-side/api#firestore)
- [Pantheon Artemis (Firestore lookup pattern for sGTM)](https://github.com/google-marketing-solutions/gps-sgtm-pantheon/blob/main/sgtm/artemis/README.md)
- [AWS DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [AWS API Gateway + Lambda integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started-with-lambda-integration.html)

---

## Next Steps

- [ ] Team alignment on relay-enrichment vs. sGTM-enrichment approach
- [ ] Identify canonical source for game metadata (for DynamoDB population pipeline)
- [ ] Prototype the Lambda + API Gateway + DynamoDB stack
- [ ] Build sGTM variable template with caching
- [ ] Load test to validate latency under production traffic
