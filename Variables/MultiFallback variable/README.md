# MultiFallback Variable

## What It Does

Evaluates a list of variables in order and returns the first one that passes its validation rule. It's a prioritised fallback chain — if variable A is invalid, try B, then C, and so on.

## When to Use

- Setting a parameter that could come from multiple sources (e.g. try the SGTM event data first, then fall back to a datalayer field, then a hardcoded default)
- Handling fields where `undefined`, `null`, empty string, or `"na"` should be skipped in favour of the next option
- Customer ID resolution where you need to validate the value is actually numeric

## Template Fields

The template uses a simple table with two columns per row:

| Column | Description |
|--------|-------------|
| **Variable to test** | The GTM variable to evaluate (e.g. `{{My Variable}}`) |
| **Validate against** | The validation rule to apply |

## Validation Rules

| Rule | Passes when... | Fails when... |
|------|----------------|---------------|
| **Default** | Value is not `null`, `undefined`, empty string, `"not applicable"`, or `"na"` | Any of those values |
| **Basic** | Value is not `null`, `undefined`, empty string, or `"na"` | Any of those (but `"not applicable"` passes) |
| **Only null or undefined** | Value is not `null` or `undefined` | `null` or `undefined` only |
| **Number Only** | Value can be converted to a number | Non-numeric values |
| **Valid Customer ID** | Value is a number or a string of digits only | Non-numeric strings, `null`, `undefined`, `false` |
| **None (Always valid)** | Always | Never |

## How It Works

1. Iterates through the table rows top to bottom
2. For each row, applies the selected validation rule to the variable
3. Returns the first variable that passes validation
4. If no variable passes, returns `undefined`

## Example

| Row | Variable | Rule | Value at runtime | Result |
|-----|----------|------|-----------------|--------|
| 1 | `{{SGTM - user_id}}` | Default | `""` (empty) | ❌ Skip |
| 2 | `{{DL - customerID}}` | Valid Customer ID | `"abc123"` | ❌ Skip (not numeric) |
| 3 | `{{DL - customerID}}` | Default | `"abc123"` | ✅ Return `"abc123"` |

Row 3 wins because `"abc123"` passes the Default rule (it's not null/empty/na).
