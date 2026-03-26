# String Manipulator

## What It Does

Performs common string operations — split, concatenate, or find-and-replace — on input strings. Designed for simple, focused string transformations that don't need the full power of the Number & String Operations template.

## When to Use

- Splitting a delimited string and extracting a specific segment (e.g. get the sport name from `"football;premier league;man utd"`)
- Concatenating multiple variables into a single string with a separator
- Replacing substrings (single or all occurrences)

## Template Fields

| Field | Description |
|-------|-------------|
| **Operation** | `Split`, `Concatenate`, or `Replace` |

### Split Fields
| Field | Description |
|-------|-------------|
| **Input String** | The string to split |
| **Delimiter** | Character(s) to split on |
| **Start Index** | Index of the first segment to return (0-based) |
| **End Index** | (Optional) If provided, returns segments from Start to End (inclusive), re-joined with the delimiter |

### Concatenate Fields
| Field | Description |
|-------|-------------|
| **Separator** | String placed between concatenated values |
| **Concatenation Items** | Table of values to join. Empty/null/undefined values are skipped. |

### Replace Fields
| Field | Description |
|-------|-------------|
| **Input String** | The string to search in |
| **Find (substring)** | The substring to find. Use `\s` to represent a space character. |
| **Replace with** | The replacement string. Use `\s` to represent a space character. |
| **Replace All Occurrences** | Checkbox — when checked, replaces every occurrence instead of just the first |

## Examples

**Split — extract single segment:**
```
Input:     "football;premier league;man utd"
Delimiter: ";"
Start:     1
→ "premier league"
```

**Split — extract range:**
```
Input:     "a-b-c-d-e"
Delimiter: "-"
Start:     1
End:       3
→ "b-c-d"
```

**Concatenate:**
```
Items:     ["sports", "football", "premier league"]
Separator: " | "
→ "sports | football | premier league"
```

**Concatenate — single value gets separator appended:**
```
Items:     ["sports"]
Separator: " | "
→ "sports | "
```

**Replace:**
```
Input:       "hello world world"
Find:        "world"
Replace:     "earth"
Replace All: checked
→ "hello earth earth"
```

## Notes

- If the input string is empty or not a string type, the template returns `""`
- The `\s` escape sequence in Find/Replace fields is converted to a literal space before processing
- Concatenation skips `undefined`, `null`, and empty string values automatically
