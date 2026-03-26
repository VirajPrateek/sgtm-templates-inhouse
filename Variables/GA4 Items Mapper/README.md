# GA4 Items Mapper

## What It Does

Builds the GA4 `items[]` array for ecommerce and sports betting events. Takes raw datalayer product data and maps it into the correct GA4 item schema based on the event type. This is the server-side equivalent of the client-side items mapping logic.

## When to Use

Any time you need to populate the `items` parameter on a GA4 event tag in SGTM. Select the event type and wire up the relevant datalayer variables — the template handles all the field mapping and formatting.

## Template Fields

| Field | Description |
|-------|-------------|
| **Event Type** | The raw datalayer event name (dropdown). Determines which mapping logic runs. |
| **Parsed Data Var** | The parsed datalayer object (from Array & Object Parser or similar). Used for component-level fields. |
| **Actual Event Name** | Map to `{{Event Name}}`. Used for branching logic within certain event types. |
| **Parameters to be mapped** | Conditional fields that appear based on the selected event type (transactionProducts, item_id, item_category, etc.). |

## Supported Event Types

| Event Type | Items List | Description |
|------------|-----------|-------------|
| `Cart.betAdded` | Single item | Bet selection added to betslip |
| `select_item` | Single item | Sports module click (module-level tracking) |
| `select_item-Mar` | Single item | Marquee click |
| `select_item-NR` | Single item | Next Races click |
| `showmodule` | Multiple items | Sports module impression (view_item_list) |
| `showmarquee` | Multiple items | Marquee impression |
| `shownextraces` | Multiple items | Next Races impression |
| `Cart.purchase` | Multiple items | Bet placement / purchase |
| `Cart.checkout` | Multiple items | Checkout / betslip review |
| `purchaseComplete` | Multiple items | Bingo purchase completion |
| `productDetail` | Multiple items | Bingo product detail view |
| `gameMultiplier` | Multiple items | Casino game multiplier events |

## How It Works

1. Reads the selected event type and the incoming datalayer fields
2. Runs a `switch` statement matching the event type
3. Maps raw datalayer keys to GA4 item properties (`item_name`, `item_id`, `item_brand`, `item_category`, `price`, etc.)
4. Includes sport name resolution via an internal sport ID lookup table (e.g. `4` → `"football"`)
5. Lowercases string values where appropriate
6. Returns the final `items[]` array

## Sport ID Lookup

The template contains a built-in lookup table mapping numeric sport IDs to sport names (e.g. `4` → `football`, `100` → `esports`, `1001` → `virtual sports`). This is used to populate `item_category` or `item_variant` depending on the event type.

## Key Behaviours

- Single-item events (`Cart.betAdded`, `select_item`, etc.) return an array with one object
- Multi-item events (`showmodule`, `Cart.purchase`, etc.) iterate over the products array
- For `select_item` and marquee events, if `componentModuleCustName` is provided and not `"na"`, it uses component-level fields from the parsed datalayer; otherwise falls back to `transactionProducts` fields
- Prices in `Cart.purchase` and `Cart.checkout` are divided by 100 (pence to pounds conversion)
- Unknown event types log a warning and return an empty array

## Debugging

```javascript
const LOG_ENABLED = false;  // Change to true in the template code
```
