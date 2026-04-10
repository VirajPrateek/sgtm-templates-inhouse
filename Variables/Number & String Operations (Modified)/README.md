# Number & String Operations (Modified)

## What It Does

A Swiss-army-knife variable for performing arithmetic, math, string manipulation, and array operations. Select an operation type, pick the specific function, provide your parameters, and optionally transform the result.

## When to Use

- Arithmetic on datalayer values (add, subtract, multiply, divide)
- Boolean logic (AND, OR, NOT)
- Math functions (round, floor, ceil, abs, pow, sqrt, min, max)
- String manipulation (split, replace, replaceAll, toLowerCase, toUpperCase, indexOf, slice, substring, etc.)
- Hashing (SHA-256) or encoding (Base64)
- JSON parse/stringify
- Getting array length

## Template Fields

| Field | Description |
|-------|-------------|
| **Operation Type** | `Calculate`, `Math Methods`, `String Functions`, or `Array Functions` |
| **Operation / Method / Function** | The specific function within the selected type |
| **Parameter 1** | First operand (always required) |
| **Parameter 2** | Second operand (shown when needed) |
| **Parameter 3** | Third operand (shown for replace, replaceAll, slice, substring, splitSpecial, getParam) |
| **Ignore undefined/null** | For SHA-256 only — returns the input unchanged if it's `undefined` or `null` |
| **Result Transformation** | Post-processing: None, Round to Integer, Fixed (2 decimals), Truncate to Integer, Convert to String |

## Available Functions

### Calculate
`add (+)`, `subtract (-)`, `multiply (*)`, `divide (/)`, `AND (boolean)`, `OR (boolean)`, `NOT (boolean)`

### Math Methods
`abs`, `ceil`, `floor`, `max`, `min`, `round`, `trunc`, `pow`, `sqrt`

### String Functions
`indexOf`, `lastIndexOf`, `split`, `splitSpecial` (split + extract by index), `getParam` (extract value by key name from delimited string), `toLowerCase`, `toUpperCase`, `replace`, `replaceAll`, `slice`, `substr`, `substring`, `match`, `sha256`, `base64`, `toFixed`, `toNumber`, `JSON.stringify`, `JSON.parse`

### Array Functions
`length` (get array length)

## Examples

**Divide price by 100 (pence to pounds):**
- Operation Type: Calculate
- Operation: divide
- Param 1: `{{price}}` → `4500`
- Param 2: `100`
- Result Transformation: Fixed (2 decimals)
- → `45`

**Lowercase a string:**
- Operation Type: String Functions
- Function: toLowerCase
- Param 1: `{{Event Name}}` → `"Cart.BetAdded"`
- → `"cart.betadded"`

**SHA-256 hash an email:**
- Operation Type: String Functions
- Function: sha256
- Param 1: `{{user_email}}`
- → hashed string

**Split and extract:**
- Operation Type: String Functions
- Function: splitSpecial
- Param 1: `"football;premier league;man utd"`
- Param 2: `";"`
- Param 3: `1`
- → `"premier league"`

**Get a value by key name from a cookie/query string (getParam):**
- Operation Type: String Functions
- Function: getParam
- Param 1: `{{Cookie - OptanonConsent}}` → `"isGpcEnabled=0&landingPath=NotLandingPage&groups=C0001:1"`
- Param 2: `landingPath`
- Param 3: `&`
- → `"NotLandingPage"`

> `getParam` is position-independent — it finds the key by name regardless of where it appears in the string. This replaces the previous two-variable approach (splitSpecial → splitSpecial) which relied on key ordering and broke if the cookie structure changed.

## Testing

A local test harness is included to verify the template logic outside the sGTM container:

```bash
node test-local.js
```

This runs 16 tests covering `getParam` functionality including position independence, edge cases (empty values, missing keys, similar key names), and custom delimiters.
