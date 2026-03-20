# Multi Selector — Examples & Behavior

## Overview
Extracts and formats data from array-based datalayer events (`betFilters`, `FeedbackQuestions`).
Deduplicates category/label/action/position. Preserves all values for location/event_details to maintain positional alignment.

## Behavior Summary
- `category_event`, `label_event`, `action_event`, `position_event` → deduplicated
- `location_event`, `event_details` → all values kept (positional alignment)
- Missing or empty values → `'na'`
- Supports both stringified and object datalayers
- No `try/catch` — validates string starts with `{` before parsing

## Supported Events
| Event Name | List Key |
|---|---|
| `Event.betFilters` | `betFilters` |
| `Event.FeebackLoad` | `FeedbackQuestions` |

---

## Example 1: All values present, repeated dimensions

```javascript
dataLayer.push({
  event: 'Event.FeebackLoad',
  FeedbackQuestions: [
    { "component.CategoryEvent": "bingo room", "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit", "component.PositionEvent": "feedback form",
      "component.LocationEvent": "question 1", "component.EventDetails": "answer 1" },
    { "component.CategoryEvent": "bingo room", "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit", "component.PositionEvent": "feedback form",
      "component.LocationEvent": "question 2", "component.EventDetails": "answer 2" },
    { "component.CategoryEvent": "bingo room", "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit", "component.PositionEvent": "feedback form",
      "component.LocationEvent": "question 3", "component.EventDetails": "answer 3" }
  ]
});
```

### Output
```
category_event  → "bingo room"
label_event     → "room interaction"
action_event    → "submit"
position_event  → "feedback form"
location_event  → "question 1|question 2|question 3"
event_details   → "answer 1|answer 2|answer 3"
```

---

## Example 2: Missing/empty values → 'na' placeholder

```javascript
FeedbackQuestions: [
  { ..., "component.LocationEvent": "abc", "component.EventDetails": "cba" },
  { ..., "component.LocationEvent": "",    "component.EventDetails": "fed" },
  { ..., "component.LocationEvent": "ghi", "component.EventDetails": ""    }
]
```

### Output
```
location_event  → "abc|na|ghi"
event_details   → "cba|fed|na"
```

Index 1: location `na` (was empty) maps to details `fed` — alignment preserved.

---

## Example 3: Duplicate location/details pairs

```javascript
FeedbackQuestions: [
  { ..., "component.LocationEvent": "abc", "component.EventDetails": "cba" },
  { ..., "component.LocationEvent": "def", "component.EventDetails": "fed" },
  { ..., "component.LocationEvent": "abc", "component.EventDetails": "cba" }
]
```

### Output
```
location_event  → "abc|def|abc"
event_details   → "cba|fed|cba"
```

Duplicates kept in location/event_details to preserve positional alignment.

---

## Failure Points
| Scenario | Result |
|---|---|
| `rawData` is not a string or object | Returns `undefined` |
| String doesn't start with `{` | Returns `undefined` |
| `JSON.parse` returns falsy | Returns `undefined` |
| Unknown event name (no `listKey` match) | Returns `undefined` |
| Empty or missing list array | Returns `undefined` |
| `returnType` typo or missing | Returns `undefined` |
| Keys renamed in datalayer | All values become `'na'` |

## Configuration
| Return Type | Source Key | Deduped? |
|---|---|---|
| `category_event` | `component.CategoryEvent` | Yes |
| `label_event` | `component.LabelEvent` | Yes |
| `action_event` | `component.ActionEvent` | Yes |
| `position_event` | `component.PositionEvent` | Yes |
| `location_event` | `component.LocationEvent` | No |
| `event_details` | `component.EventDetails` | No |

## Debugging
```javascript
const LOG_ENABLED = false;  // Change to true
```
Outputs one line: the returnType and event name being processed.
