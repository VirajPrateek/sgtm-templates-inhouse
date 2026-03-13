const JSON = require('JSON');
const type = require('getType');
const createRegex = require('createRegex');
const testRegex = require('testRegex');
let isArrayRgx = createRegex('^\\[.*\\]$');
let isObjectRgx = createRegex('^\\{.*\\}$');

let input = data.input;

if ('string' == type(input) && testRegex(isArrayRgx, input)) input = JSON.parse(input);
if ('string' == type(input) && testRegex(isObjectRgx, input)) input = JSON.parse(input);

if (!testRegex(createRegex('(array|object)'), type(input))) return undefined;

let keys = data.dotkeys || '';
keys = keys.split('>');

// Original nested object walk
let result = parse(input, keys);

// NEW: If nested walk returned undefined and flat key fallback is enabled,
// try the dot-notation flat key lookup on the input object.
// This handles datalayers where "component.EventDetails" is a flat key
// rather than a nested component > EventDetails structure.
if ('undefined' == type(result) && data.enableFlatKeyFallback) {
  let flatKey = keys.join('.');
  if (flatKey !== '') {
    // Try as a direct property on the input object (flat dot-notation key)
    result = input[flatKey];
  }
}

return result;

/* helpers */
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
