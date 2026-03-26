# IF-ELSER

## What It Does

A conditional logic variable that evaluates up to 3 condition groups (IF / ELSE IF / ELSE IF) and returns a different value depending on which group matches first. If none match, it returns a default value. Think of it as a mini if/else chain you can configure entirely in the GTM UI.

## When to Use

- Returning different values based on event data (e.g. different category names per brand)
- Mapping one value to another with multiple conditions
- Any scenario where you'd normally write `if/else if/else` logic in a custom variable

## Template Fields

| Field | Description |
|-------|-------------|
| **Enable Debug Logging** | Checkbox to turn on console logging for troubleshooting |
| **IF** | First condition group — conditions table, logic (AND/OR), and return value |
| **ELSE IF** (×2) | Second and third condition groups, same structure |
| **ELSE - Default Return Value** | Value returned if no condition group matches |

### Condition Table Columns

| Column | Description |
|--------|-------------|
| **Variable** | The GTM variable to evaluate (e.g. `{{Event Name}}`) |
| **Operator** | The comparison operator |
| **Value** | The value to compare against |

## Supported Operators

| Operator | Description |
|----------|-------------|
| `==` | Equals (loose, string comparison) |
| `!=` | Does not equal |
| `gt` | Greater than (numeric) |
| `gte` | Greater than or equal (numeric) |
| `lt` | Less than (numeric) |
| `lte` | Less than or equal (numeric) |
| `contains` | String contains substring |
| `does_not_contain` | String does not contain substring |
| `starts_with` | String starts with value |
| `ends_with` | String ends with value |
| `truthy` | Value is truthy (not empty, not `"false"`, not `"0"`, not `"null"`, not `"undefined"`) |
| `falsy` | Value is falsy (empty, `"false"`, `"0"`, `"null"`, or `"undefined"`) |

## Logic Between Conditions

Each condition group can use either:
- **OR** — any single condition passing is enough
- **AND** — all conditions must pass

## Evaluation Order

1. Evaluate the **IF** group → if it matches, return its value
2. Evaluate **ELSE IF 1** → if it matches, return its value
3. Evaluate **ELSE IF 2** → if it matches, return its value
4. Return the **Default** value

The first matching group wins. Later groups are not evaluated once a match is found.

## Example

**Scenario:** Return a different `item_list_name` based on the event name.

| Group | Conditions | Logic | Return |
|-------|-----------|-------|--------|
| IF | `{{Event Name}}` equals `showmodule` | — | `Sports Module` |
| ELSE IF 1 | `{{Event Name}}` equals `showmarquee` | — | `Marquees` |
| ELSE IF 2 | `{{Event Name}}` starts_with `Cart.` | — | `Sports Betting` |
| Default | — | — | `Other` |
