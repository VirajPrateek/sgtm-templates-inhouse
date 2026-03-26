# Array & Object Parser

## What It Does

Extracts values from nested objects or arrays using a key path. Accepts raw objects or JSON strings and walks into nested structures to return the value at the specified path.

## When to Use

- Pulling a specific field out of a parsed datalayer object (e.g. `ecommerce > items > 0 > item_name`)
- Reading flat dot-notation keys like `"component.CategoryEvent"` from an object
- Handling datalayers where the structure might be nested OR flat (with the fallback checkbox)

## Template Fields

| Field | Description |
|-------|-------------|
| **Array / Object** | The input data. Can be a JS object, array, or a JSON string (auto-parsed). |
| **Dot/Nested Keys** | The path to the value. Use `>` to walk nested keys. Dots are treated as literal characters. |
| **Enable flat key fallback** | When checked, if the `>` nested walk returns `undefined`, it joins the path with `.` and tries a direct flat key lookup. |

## Key Separator Rules

| Character | Behaviour |
|-----------|-----------|
| `.` (dot) | Literal string lookup. Looks for a single flat key like `"component.CategoryEvent"`. Does NOT walk into nested objects. |
| `>` (greater than) | Path separator. Splits on `>` and walks into nested objects step by step. |

## Quick Decision Guide

| Scenario | Key format | Flat fallback |
|----------|-----------|---------------|
| Datalayer is always nested | `component>CategoryEvent` | Off |
| Datalayer is always flat (dot-notation keys) | `component.CategoryEvent` | Off |
| Could be either nested or flat | `component>CategoryEvent` | **On** |

## Examples

**Nested object:**
```
Input: { component: { CategoryEvent: "slots" } }
Keys:  component>CategoryEvent
→ "slots"
```

**Flat dot-notation key:**
```
Input: { "component.CategoryEvent": "slots" }
Keys:  component.CategoryEvent
→ "slots"
```

**Deep nested path:**
```
Input: { ecommerce: { items: [{ item_name: "Bonus Spins" }] } }
Keys:  ecommerce>items>0>item_name
→ "Bonus Spins"
```

**Empty keys → returns full object:**
```
Input: { foo: "bar" }
Keys:  (empty)
→ { foo: "bar" }
```

See [USAGE.md](./USAGE.md) for the full behaviour matrix and test cases.
