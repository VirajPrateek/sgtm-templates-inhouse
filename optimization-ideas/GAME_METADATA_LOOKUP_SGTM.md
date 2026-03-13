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
- Our sGTM currently runs on AWS — would need a GCP Firestore instance alongside it
- Cross-cloud latency if sGTM stays on AWS (AWS sGTM → GCP Firestore)
- `getGoogleAuth` for authentication works with Google Cloud credentials

**Verdict:** Worth keeping on the table. If we're open to using GCP for this specific piece (or if sGTM ever moves to GCP), the native Firestore API is the cleanest integration — no API Gateway/Lambda layer needed. The trade-off is cross-cloud complexity if the rest of our infra stays on AWS.

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

## Applicability: `view_item_list` (Batch Lookups)

The same pattern applies to `view_item_list`, which is the impression-level ecommerce event. The client-side CHTML currently:

1. Receives a `batch` array of gameIds (the visible games in the viewport)
2. Filters `game_impressions` to only those in the batch
3. Maps each to GA4 ecommerce `items` format
4. Pushes a `view_item_list` event

### What Changes for Server-Side

Instead of a single-ID lookup, we need a **batch lookup endpoint**:

```
GET /games?ids=game1,game2,game3,...game20
```

Or via POST if the list is large:

```
POST /games/batch
Body: {"ids": ["game1", "game2", ...]}
```

The Lambda uses DynamoDB's [`BatchGetItem`](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html) (supports up to 100 items per call).

### sGTM Variable Template (Batch)

```javascript
const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const getEventData = require('getEventData');

const batch = getEventData('impressions_list'); // array of gameIds
if (!batch || !batch.length) return undefined;

const ids = batch.join(',');
const apiUrl = 'https://<api-gateway-url>/games?ids=' + ids;

return sendHttpRequest(apiUrl, {
  method: 'GET',
  headers: {'x-api-key': '<API_KEY>'},
  timeout: 2000
}).then((result) => {
  if (result.statusCode === 200) {
    return JSON.parse(result.body);
  }
  return undefined;
}, () => undefined);
```

### Volume Consideration

`view_item_list` fires much more frequently than `select_item` (every scroll/viewport change vs. a single click). This means:

- **Higher API call volume** — the `templateDataStorage` caching layer becomes critical here
- **Batch efficiency matters** — one API call for 20 games is far better than 20 individual calls
- **Consider debouncing on the client/relay side** — don't fire impression events for every pixel scrolled; batch them into reasonable viewport chunks (likely already handled by existing logic)

### Shared Infrastructure

Both `select_item` and `view_item_list` use the **same DynamoDB table, same Lambda, same API Gateway**. The only difference is:

| Event | Lookup Type | Typical Batch Size | Frequency |
|---|---|---|---|
| `select_item` | Single ID | 1 | Low (per click) |
| `view_item_list` | Batch IDs | 10-30 | High (per scroll/viewport) |

---

## Important: Static vs. Dynamic Metadata

Some fields in the GA4 ecommerce `items` array are relatively stable (game name, type, section), while others are **dynamic** — they depend on the user's session, page layout, or personalization at the time of the event.

| Field | Likely Source | Notes |
|---|---|---|
| `item_id` (gameId) | Event payload | Already relayed with the event |
| `item_name` (gameName) | Lookup DB | Game's internal name |
| `item_variant` (gameDisplayName) | Lookup DB | Display name |
| `item_brand` (gameType) | Lookup DB | e.g., "slots", "table" |
| `item_category` (Game.section) | Lookup DB | Casino section |
| `item_category2` (categorySubType) | Lookup DB | Sub-category |
| `item_category3` (Game.GridPosition) | **Event payload** | Changes based on page layout, personalization, A/B tests |
| `item_category4` (categorySubLevel) | Lookup DB | Sub-level category |
| `index` (Game.position) | **Event payload** | Position in the list at time of impression/click |
| `item_list_id` | Hardcoded | Always `casino_games` |
| `item_list_name` | Hardcoded | Always `Casino Games` |
| `coupon` (gameBadges) | Lookup DB | May change with promotions |
| `location_id` | Event payload | Varies by event context |

> **Note:** The classification above is our best guess. Engineering teams who own the game data will know which fields change frequently and which are stable. This should be validated with them.

### What This Means

Values like `index` and `gridPosition` are contextual — the same game can appear at different positions for different users depending on personalization, A/B tests, or sorting. These need to come from the client/relay as part of the event payload.

The relay payload for a `select_item` event should look something like:

```json
{
  "event_name": "select_item",
  "data_product_id": "game_abc",
  "game_grid_position": "3x2",
  "game_index": 7,
  "location_id": "GA4-ClickCustom-gameImpressions"
}
```

And for `view_item_list` (batch):

```json
{
  "event_name": "view_item_list",
  "impressions_list": ["game_abc", "game_def", "game_ghi"],
  "game_positions": {
    "game_abc": {"grid_position": "1x1", "index": 1},
    "game_def": {"grid_position": "1x2", "index": 2},
    "game_ghi": {"grid_position": "1x3", "index": 3}
  },
  "location_id": "GA4-ViewCustom-gameImpressions"
}
```

The sGTM tag then **merges** the metadata from the lookup DB with the positional/contextual data from the event payload to build the final GA4 `items` array.

### Risk if Overlooked

If we only send `gameId` and rely entirely on the lookup DB, we'll lose `index` and `gridPosition` data — which are important for understanding game placement performance and personalization effectiveness.

---

## Multi-Site / Multi-Label Scaling

Game catalogs are not universal — different sites/labels may have different game sets, different metadata, or even different games sharing the same ID. The lookup solution needs to account for this.

### The Problem

If we have a single flat DynamoDB table keyed only by `gameId`, we can't distinguish between the same game appearing differently across sites, or site-specific game catalogs.

### Proposed Approach: Site-Scoped Lookups

The API should accept a site/label identifier alongside the gameId. This could be derived from:

- **Hostname** (e.g., `brand-a.com` vs `brand-b.com`)
- **Page ID or site label** passed in the event payload
- **A dedicated site identifier** set in the relay or sGTM config

#### DynamoDB Table Design (Multi-Site)

Use a **composite key** — partition key on `siteId`, sort key on `gameId`:

| Attribute | Type | Key | Description |
|---|---|---|---|
| `siteId` (PK) | String | Partition Key | Site/label identifier (e.g., hostname or brand code) |
| `gameId` (SK) | String | Sort Key | Game identifier |
| `gameName` | String | — | Internal game name |
| `gameDisplayName` | String | — | Display name |
| `gameType` | String | — | e.g., "slots", "table" |
| `section` | String | — | Casino section |
| `categorySubType` | String | — | Sub-category |
| `categorySubLevel` | String | — | Sub-level category |
| `gameBadges` | String | — | Badge labels |
| `updatedAt` | String | — | ISO timestamp of last update |

This allows:
- Querying all games for a site: `PK = "brand-a"`
- Looking up a specific game on a specific site: `PK = "brand-a", SK = "game_abc"`
- Different metadata for the same gameId across sites

#### API Call Pattern

```
GET /games/{gameId}?site=brand-a
GET /games?ids=game1,game2&site=brand-a
```

Or derived from the event:

```javascript
const hostname = getEventData('page_hostname'); // or a mapped site label
const apiUrl = 'https://<api-gateway-url>/games/' + gameId + '?site=' + hostname;
```

#### Batch Lookup (view_item_list)

```
GET /games?ids=game1,game2,game3&site=brand-a
```

The Lambda uses `BatchGetItem` with the composite key (`siteId` + `gameId` pairs).

### Questions for Engineering

- How do we want to identify sites? Hostname, brand code, or some other label?
- Are game catalogs fully separate per site, or is there overlap with shared metadata?
- Should the API fall back to a "default" site if a site-specific entry isn't found?
- Who owns the pipeline to populate per-site game data into DynamoDB?

---

## Open Questions for Team Discussion

1. **Data freshness:** How often does game metadata change? Engineering teams who own the game data should advise on this — it determines our cache/TTL strategy.

2. **Data source:** Where does the canonical game metadata live today? CMS? Database? API? We need a pipeline to populate the lookup DB.

3. **Relay vs. sGTM enrichment:** Do we prefer enriching at the relay level (simpler, fewer moving parts) or at the sGTM level (more flexible, reusable across tags)?

4. **Latency budget:** The `sendHttpGet` call adds network latency to every `select_item` event. Is ~10-50ms acceptable? Should we implement `templateDataStorage` as a per-instance cache to reduce API calls?

5. **API authentication:** API key via header? IAM auth? What's our security posture for this internal API?

6. **Scope:** We've confirmed `select_item` (single lookup) and `view_item_list` (batch lookup) both need this. Do other ecommerce events (`view_item`, `add_to_cart`, etc.) also need it?

7. **Fallback behavior:** What happens if the API is down or the gameId isn't found? Fire the event without ecommerce items? Drop it? Log and continue?

8. **GCP vs. AWS for lookup DB:** Are we open to using GCP Firestore for this (native sGTM support, no API layer needed), or do we want to stay fully on AWS?

9. **Multi-site strategy:** How do we identify sites/labels for scoped lookups? Who owns the per-site game catalog data?

---

## Suggested DynamoDB Table Design

See the [Multi-Site / Multi-Label Scaling](#multi-site--multi-label-scaling) section above for the recommended composite key design (`siteId` + `gameId`).

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
