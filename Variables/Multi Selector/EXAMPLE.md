# Multi Selector - Usage Examples

## Overview
This variable extracts and formats data from event arrays while maintaining positional consistency across all fields.

## Key Features
- Maintains array length consistency (all return types have same number of items)
- Uses 'na' as placeholder for missing values
- Optional sorting (WARNING: breaks index correlation between different return types)
- Supports both stringified and object data layers

## Input Example

```javascript
{
  "betFilters": [
    {
      "component.CategoryEvent": "sports",
      "component.LabelEvent": "football",
      "component.ActionEvent": "click",
      "component.PositionEvent": "1",
      "component.LocationEvent": "header",
      "component.EventDetails": "premier-league"
    },
    {
      "component.CategoryEvent": "sports",
      "component.LabelEvent": "tennis",
      // ActionEvent missing
      "component.PositionEvent": "2",
      // LocationEvent missing
      "component.EventDetails": "wimbledon"
    },
    {
      // CategoryEvent missing
      "component.LabelEvent": "basketball",
      "component.ActionEvent": "hover",
      "component.PositionEvent": "3",
      "component.LocationEvent": "sidebar",
      // EventDetails missing
    }
  ]
}
```

## Output Examples (Sorting Disabled)

All arrays maintain the same length and order, so index positions correlate:

```
returnType = 'category_event'  → "sports|sports|na"
returnType = 'label_event'     → "football|tennis|basketball"
returnType = 'action_event'    → "click|na|hover"
returnType = 'position_event'  → "1|2|3"
returnType = 'location_event'  → "header|na|sidebar"
returnType = 'event_details'   → "premier-league|wimbledon|na"
```

### Index Correlation
- Index 0: sports, football, click, 1, header, premier-league
- Index 1: sports, tennis, na, 2, na, wimbledon
- Index 2: na, basketball, hover, 3, sidebar, na

## Output Examples (Sorting Enabled)

⚠️ WARNING: When sorting is enabled, each array is sorted independently, breaking the index correlation:

```
returnType = 'category_event'  → "na|sports|sports"
returnType = 'label_event'     → "basketball|football|tennis"
returnType = 'action_event'    → "click|hover|na"
returnType = 'position_event'  → "1|2|3"
returnType = 'location_event'  → "header|na|sidebar"
returnType = 'event_details'   → "na|premier-league|wimbledon"
```

## Use Cases

### Use Case 1: Correlated Data Analysis
When you need to maintain the relationship between fields (e.g., which event_details corresponds to which location_event):
- Keep sorting DISABLED
- Use the same index across different return types

### Use Case 2: Unique Value Lists
When you only need a sorted list of unique values without caring about relationships:
- Enable sorting
- Use for dropdown lists, filters, or aggregated reports

## Configuration

### Return Type Options
- `category_event` - Returns component.CategoryEvent values
- `label_event` - Returns component.LabelEvent values
- `action_event` - Returns component.ActionEvent values
- `position_event` - Returns component.PositionEvent values
- `location_event` - Returns component.LocationEvent values
- `event_details` - Returns component.EventDetails values

### Enable Sorting
- `false` (default) - Maintains original order and index correlation
- `true` - Sorts alphabetically, breaks index correlation

## Debugging

To enable logging, change in the code:
```javascript
const LOG_ENABLED = false;  // Change to true
```

This will output detailed logs showing:
- Raw datalayer
- Parsed data
- Extracted arrays
- Final output
