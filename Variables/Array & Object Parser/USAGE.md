# Array & Object Parser — Usage Guide

## Key Separator Behaviour

| Character | What it does |
|-----------|-------------|
| `.` (dot) | Treated as a **literal string**. The template looks for a single flat key like `"component.CategoryEvent"` on the object. It does NOT walk into nested objects. |
| `>` (greater than) | Acts as the **path separator**. The template splits on `>` and walks into nested objects step by step: `component > CategoryEvent` → `obj.component.CategoryEvent`. |

## Flat Key Fallback Checkbox

When **enabled**, if the nested `>` walk returns `undefined`, the template joins the path parts back with `.` and tries a direct flat key lookup on the input object (e.g. `input["component.CategoryEvent"]`).

When **disabled**, only the primary lookup runs (flat key for `.`, nested walk for `>`).

## When to Use What

| Scenario | Key format | Flat fallback | Example |
|----------|-----------|---------------|---------|
| Datalayer is **always nested** | `component>CategoryEvent` | Off or On (doesn't matter) | `{ component: { CategoryEvent: "slots" } }` |
| Datalayer is **always flat** (dot-notation keys) | `component.CategoryEvent` | Off or On (doesn't matter) | `{ "component.CategoryEvent": "slots" }` |
| Datalayer **could be either** nested or flat | `component>CategoryEvent` | **On** | Works for both shapes |

### Summary

- **Sure it's nested** → use `>`, fallback doesn't matter
- **Sure it's flat** → use `.`, fallback doesn't matter
- **Not sure / want both** → use `>` with fallback **on**

## Full Behaviour Matrix

### Key with `.` (dot): `component.CategoryEvent`

| Datalayer shape | Fallback OFF | Fallback ON |
|----------------|-------------|------------|
| `{ "component.CategoryEvent": "slots" }` | ✅ `"slots"` | ✅ `"slots"` |
| `{ component: { CategoryEvent: "slots" } }` | ❌ `undefined` | ❌ `undefined` |

> Dot never walks into nested objects regardless of fallback setting.

### Key with `>`: `component>CategoryEvent`

| Datalayer shape | Fallback OFF | Fallback ON |
|----------------|-------------|------------|
| `{ component: { CategoryEvent: "slots" } }` | ✅ `"slots"` | ✅ `"slots"` |
| `{ "component.CategoryEvent": "slots" }` | ❌ `undefined` | ✅ `"slots"` |

> With `>` and fallback on, both datalayer shapes are covered.

## Tests

These tests use the SGTM template testing API (`runCode`). Paste them into the "Tests" tab of the template editor.

### Test 1: Nested object with `>` separator — returns value

```js
// Nested object, using > separator, fallback OFF
const result = runCode({
  input: { component: { CategoryEvent: 'slots' } },
  dotkeys: 'component>CategoryEvent',
  enableFlatKeyFallback: false
});
assertThat(result).isEqualTo('slots');
```

### Test 2: Flat dot-notation key with `.` separator — returns value

```js
// Flat key, using dot separator, fallback OFF
const result = runCode({
  input: { 'component.CategoryEvent': 'slots' },
  dotkeys: 'component.CategoryEvent',
  enableFlatKeyFallback: false
});
assertThat(result).isEqualTo('slots');
```

### Test 3: Flat key with `>` separator, fallback OFF — returns undefined

```js
// Flat key but using > separator without fallback — can't find it
const result = runCode({
  input: { 'component.CategoryEvent': 'slots' },
  dotkeys: 'component>CategoryEvent',
  enableFlatKeyFallback: false
});
assertThat(result).isEqualTo(undefined);
```

### Test 4: Flat key with `>` separator, fallback ON — returns value

```js
// Flat key, using > separator, fallback ON — finds it via fallback
const result = runCode({
  input: { 'component.CategoryEvent': 'slots' },
  dotkeys: 'component>CategoryEvent',
  enableFlatKeyFallback: true
});
assertThat(result).isEqualTo('slots');
```

### Test 5: Nested object with `.` separator — returns undefined

```js
// Nested object but using dot separator — dot is literal, can't walk
const result = runCode({
  input: { component: { CategoryEvent: 'slots' } },
  dotkeys: 'component.CategoryEvent',
  enableFlatKeyFallback: false
});
assertThat(result).isEqualTo(undefined);
```

### Test 6: Nested object with `>` and fallback ON — nested wins first

```js
// Nested object, > separator, fallback ON — nested walk succeeds, fallback not needed
const result = runCode({
  input: { component: { CategoryEvent: 'slots' } },
  dotkeys: 'component>CategoryEvent',
  enableFlatKeyFallback: true
});
assertThat(result).isEqualTo('slots');
```

### Test 7: Deep nested path with `>`

```js
// Three levels deep
const result = runCode({
  input: { ecommerce: { items: [{ item_name: 'Bonus Spins' }] } },
  dotkeys: 'ecommerce>items>0>item_name',
  enableFlatKeyFallback: false
});
assertThat(result).isEqualTo('Bonus Spins');
```

### Test 8: Stringified JSON input

```js
// Input is a JSON string — should auto-parse
const result = runCode({
  input: '{"component":{"CategoryEvent":"slots"}}',
  dotkeys: 'component>CategoryEvent',
  enableFlatKeyFallback: false
});
assertThat(result).isEqualTo('slots');
```

### Test 9: No keys provided — returns full object

```js
// Empty dotkeys — returns the entire input object
const result = runCode({
  input: { component: { CategoryEvent: 'slots' } },
  dotkeys: '',
  enableFlatKeyFallback: false
});
assertThat(result).isEqualTo({ component: { CategoryEvent: 'slots' } });
```

### Test 10: Non-existent key — returns undefined

```js
const result = runCode({
  input: { component: { CategoryEvent: 'slots' } },
  dotkeys: 'component>NonExistent',
  enableFlatKeyFallback: false
});
assertThat(result).isEqualTo(undefined);
```
