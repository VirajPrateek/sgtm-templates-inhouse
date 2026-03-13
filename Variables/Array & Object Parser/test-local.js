/**
 * Local test harness for Array & Object Parser
 * 
 * Run with: node test-local.js
 * Or paste into browser console.
 * 
 * Mocks the SGTM sandboxed APIs so the template logic can run outside the container.
 */

// ---- SGTM API Mocks ----
const _JSON = JSON;
const _type = (v) => {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (Array.isArray(v)) return 'array';
  return typeof v;
};
const _createRegex = (pattern) => new RegExp(pattern);
const _testRegex = (regex, str) => regex.test(str);

// ---- Template logic wrapped as a function ----
function runCode(data) {
  const JSON = _JSON;
  const type = _type;
  const createRegex = _createRegex;
  const testRegex = _testRegex;

  let isArrayRgx = createRegex('^\\[.*\\]$');
  let isObjectRgx = createRegex('^\\{.*\\}$');

  let input = data.input;

  if ('string' == type(input) && testRegex(isArrayRgx, input)) input = JSON.parse(input);
  if ('string' == type(input) && testRegex(isObjectRgx, input)) input = JSON.parse(input);

  if (!testRegex(createRegex('(array|object)'), type(input))) return undefined;

  let keys = data.dotkeys || '';
  keys = keys.split('>');

  let result = parse(input, keys);

  if ('undefined' == type(result) && data.enableFlatKeyFallback) {
    let flatKey = keys.join('.');
    if (flatKey !== '') {
      result = input[flatKey];
    }
  }

  return result;

  function parse(obj, keyArr, index) {
    if (!keyArr.length || '' == keyArr[0]) return obj;
    index = index || 0;
    let key = keyArr[index];
    if (index < keyArr.length) {
      let parsed = obj[key];
      if ('undefined' == type(parsed)) return undefined;
      return parse(parsed, keyArr, (index + 1));
    }
    return obj;
  }
}

// ---- Test runner ----
let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log('  ✅ ' + name);
    passed++;
  } else {
    console.log('  ❌ ' + name);
    console.log('     Expected: ' + e);
    console.log('     Got:      ' + a);
    failed++;
  }
}

// ---- Tests ----
console.log('\n--- Array & Object Parser Tests ---\n');

assert(
  '1. Nested object + > separator → returns value',
  runCode({ input: { component: { CategoryEvent: 'slots' } }, dotkeys: 'component>CategoryEvent', enableFlatKeyFallback: false }),
  'slots'
);

assert(
  '2. Flat key + dot separator → returns value',
  runCode({ input: { 'component.CategoryEvent': 'slots' }, dotkeys: 'component.CategoryEvent', enableFlatKeyFallback: false }),
  'slots'
);

assert(
  '3. Flat key + > separator + fallback OFF → undefined',
  runCode({ input: { 'component.CategoryEvent': 'slots' }, dotkeys: 'component>CategoryEvent', enableFlatKeyFallback: false }),
  undefined
);

assert(
  '4. Flat key + > separator + fallback ON → returns value',
  runCode({ input: { 'component.CategoryEvent': 'slots' }, dotkeys: 'component>CategoryEvent', enableFlatKeyFallback: true }),
  'slots'
);

assert(
  '5. Nested object + dot separator → undefined (dot is literal)',
  runCode({ input: { component: { CategoryEvent: 'slots' } }, dotkeys: 'component.CategoryEvent', enableFlatKeyFallback: false }),
  undefined
);

assert(
  '6. Nested object + > + fallback ON → nested wins first',
  runCode({ input: { component: { CategoryEvent: 'slots' } }, dotkeys: 'component>CategoryEvent', enableFlatKeyFallback: true }),
  'slots'
);

assert(
  '7. Deep nested path with >',
  runCode({ input: { ecommerce: { items: [{ item_name: 'Bonus Spins' }] } }, dotkeys: 'ecommerce>items>0>item_name', enableFlatKeyFallback: false }),
  'Bonus Spins'
);

assert(
  '8. Stringified JSON input → auto-parses',
  runCode({ input: '{"component":{"CategoryEvent":"slots"}}', dotkeys: 'component>CategoryEvent', enableFlatKeyFallback: false }),
  'slots'
);

assert(
  '9. Empty dotkeys → returns full object',
  runCode({ input: { component: { CategoryEvent: 'slots' } }, dotkeys: '', enableFlatKeyFallback: false }),
  { component: { CategoryEvent: 'slots' } }
);

assert(
  '10. Non-existent key → undefined',
  runCode({ input: { component: { CategoryEvent: 'slots' } }, dotkeys: 'component>NonExistent', enableFlatKeyFallback: false }),
  undefined
);

console.log('\n--- Results: ' + passed + ' passed, ' + failed + ' failed ---\n');
