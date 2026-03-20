# Multi Selector - Usage Examples

## Overview
This variable extracts and formats data from event arrays in the datalayer. It deduplicates values for category, label, action, and position, while preserving all values (with positional alignment) for location and event_details.

## Key Features
- Deduplicates: `category_event`, `label_event`, `action_event`, `position_event`
- Preserves all values (no dedup): `location_event`, `event_details` — to maintain index-level correlation
- Uses `'na'` as placeholder for missing/empty values
- Supports both stringified and object data layers

## Supported Events
- `Event.betFilters` → reads from `betFilters` array
- `Event.FeebackLoad` → reads from `FeedbackQuestions` array

---

## Example 1: Basic — All values present, repeated dimensions

### DataLayer Push
```javascript
dataLayer.push({
  event: 'Event.FeebackLoad',
  FeedbackQuestions: [
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "question 1",
      "component.EventDetails": "answer 1"
    },
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "question 2",
      "component.EventDetails": "answer 2"
    },
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "question 3",
      "component.EventDetails": "answer 3"
    }
  ]
});
```

### Output
```
category_event  → "bingo room"                      (deduped)
label_event     → "room interaction"                 (deduped)
action_event    → "submit"                           (deduped)
position_event  → "feedback form"                    (deduped)
location_event  → "question 1|question 2|question 3" (all values)
event_details   → "answer 1|answer 2|answer 3"      (all values)
```

---

## Example 2: Missing values — 'na' placeholder

### DataLayer Push
```javascript
dataLayer.push({
  event: 'Event.FeebackLoad',
  FeedbackQuestions: [
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "abc",
      "component.EventDetails": "cba"
    },
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "",
      "component.EventDetails": "fed"
    },
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "ghi",
      "component.EventDetails": ""
    }
  ]
});
```

### Output
```
category_event  → "bingo room"
label_event     → "room interaction"
action_event    → "submit"
position_event  → "feedback form"
location_event  → "abc|na|ghi"
event_details   → "cba|fed|na"
```

Index 1: location is `na` (was empty), details is `fed` — alignment preserved.
Index 2: location is `ghi`, details is `na` (was empty) — alignment preserved.

---

## Example 3: Duplicate location/details pairs

### DataLayer Push
```javascript
dataLayer.push({
  event: 'Event.FeebackLoad',
  FeedbackQuestions: [
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "abc",
      "component.EventDetails": "cba"
    },
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "def",
      "component.EventDetails": "fed"
    },
    {
      "component.CategoryEvent": "bingo room",
      "component.LabelEvent": "room interaction",
      "component.ActionEvent": "submit",
      "component.PositionEvent": "feedback form",
      "component.LocationEvent": "abc",
      "component.EventDetails": "cba"
    }
  ]
});
```

### Output
```
category_event  → "bingo room"
label_event     → "room interaction"
action_event    → "submit"
position_event  → "feedback form"
location_event  → "abc|def|abc"
event_details   → "cba|fed|cba"
```

Duplicates in location/event_details are kept to preserve positional alignment.

---

## Configuration

### Return Type Options
- `category_event` — `component.CategoryEvent` values (deduped)
- `label_event` — `component.LabelEvent` values (deduped)
- `action_event` — `component.ActionEvent` values (deduped)
- `position_event` — `component.PositionEvent` values (deduped)
- `location_event` — `component.LocationEvent` values (all, positional)
- `event_details` — `component.EventDetails` values (all, positional)

## Debugging

To enable logging, change in the code:
```javascript
const LOG_ENABLED = false;  // Change to true
```
