# Multi Selector

## What It Does

Extracts and formats data from array-based datalayer events (`Event.betFilters` and `Event.FeebackLoad`). It reads the array of items from the datalayer, pulls out a specific dimension (category, label, action, etc.), and returns the values joined with `|` as a pipe-delimited string.

## When to Use

- Extracting component dimensions from `betFilters` or `FeedbackQuestions` arrays
- Building pipe-delimited strings for GA4 event parameters from multi-item datalayer pushes

## Template Fields

| Field | Description |
|-------|-------------|
| **Return Type** | Which dimension to extract. One of: `category_event`, `label_event`, `action_event`, `position_event`, `location_event`, `event_details` |
| **Enable Sorting** | Sort results alphabetically. Warning: breaks index correlation between return types. |

## Supported Events

| Event Name | Array Key in Datalayer |
|------------|----------------------|
| `Event.betFilters` | `betFilters` |
| `Event.FeebackLoad` | `FeedbackQuestions` |

## Return Types & Source Keys

| Return Type | Source Key | Deduplicated? |
|-------------|-----------|---------------|
| `category_event` | `component.CategoryEvent` | Yes |
| `label_event` | `component.LabelEvent` | Yes |
| `action_event` | `component.ActionEvent` | Yes |
| `position_event` | `component.PositionEvent` | Yes |
| `location_event` | `component.LocationEvent` | No (preserves positional alignment) |
| `event_details` | `component.EventDetails` | No (preserves positional alignment) |

## Key Behaviours

- `category_event`, `label_event`, `action_event`, `position_event` are deduplicated — repeated values appear only once
- `location_event` and `event_details` keep all values to preserve positional alignment across return types
- Missing or empty values default to `"na"`
- Supports both stringified JSON and object datalayers
- Returns `undefined` if the event name doesn't match, the array is empty, or the return type is invalid

See [EXAMPLE.md](./EXAMPLE.md) for detailed input/output examples.
