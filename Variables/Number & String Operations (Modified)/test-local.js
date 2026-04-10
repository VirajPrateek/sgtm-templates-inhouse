/**
 * Local test harness for Number & String Operations (Modified)
 * Focused on the new getParam function, with edge cases.
 * 
 * Run with: node test-local.js
 * 
 * Mocks the SGTM sandboxed APIs so the template logic can run outside the container.
 */

// ---- SGTM API Mocks ----
const _Math = Math;
const _makeNumber = (v) => Number(v);
const _makeString = (v) => String(v == null ? '' : v);
const _sha256Sync = (v) => '[sha256-mock]';
const _JSON = JSON;
const _toBase64 = (v) => Buffer.from(String(v)).toString('base64');

// ---- Template logic wrapped as a function ----
function runCode(data) {
  const Math = _Math;
  const makeNumber = _makeNumber;
  const makeString = _makeString;
  const sha256Sync = _sha256Sync;
  const JSON = _JSON;
  const toBase64 = _toBase64;

  var rs;
  const tp = data.functionType;
  var op1 = makeNumber(data.op1);
  var op2 = makeNumber(data.op2);
  var op3 = makeNumber(data.op3);

  const replaceAll = function(str, oldstr, newstr) {
    if (!str) return "";
    if (oldstr === newstr) return str;
    return str.split(oldstr).join(newstr);
  };

  switch(tp) {
    case "strings":
      op1 = makeString(data.op1);
      var op2s = makeString(data.op2 || "");
      var op3s = makeString(data.op3 || "");
      const sf = data.stringMethodName;
      switch(sf) {
        case "indexOf": rs = op1.indexOf(op2s); break;
        case "lastIndexOf": rs = op1.lastIndexOf(op2s); break;
        case "split": rs = op1.split(op2s); break;
        case "splitSpecial":
          rs = op1.split(op2s);
          rs = (rs.length >= op3) ? rs[op3s] : undefined;
          break;
        case "toLowerCase": rs = op1.toLowerCase(); break;
        case "toUpperCase": rs = op1.toUpperCase(); break;
        case "replace": rs = op1.replace(op2s, op3s); break;
        case "replaceAll": rs = replaceAll(op1, op2s, op3s); break;
        case "slice": rs = op1.slice(op2, op3); break;
        case "substr": rs = op1.substring(op2, op3+op2); break;
        case "substring": rs = op1.substring(op2, op3); break;
        case "toFixed": var mul = Math.pow(10, op2); rs = makeNumber(Math.round(op1*mul) / mul); break;
        case "toNumber":
          var idxComma = op1.indexOf(",");
          var idxDot = op1.indexOf(".");
          if ((idxComma > 0) && (idxDot > 0)) {
            if (idxComma > idxDot)
              rs = replaceAll(replaceAll(op1, ".", ""), ",", ".");
            else
              rs = replaceAll(op1, ",", "");
          } else if (idxComma > 0)
            rs = replaceAll(op1, ",", ".");
          rs = makeNumber(rs);
          break;
        case "match": var fnd = op1.match(op2s);
          if (fnd) { rs = fnd[0]; }
          break;
        case "sha256": rs = sha256Sync(op1); break;
        case "base64": rs = toBase64(op1); break;
        case "jstringify": rs = JSON.stringify(data.op1); break;
        case "jparse": rs = JSON.parse(data.op1); break;
        case "getParam":
          var pairs = op1.split(op3s || "&");
          for (var i = 0; i < pairs.length; i++) {
            var kv = pairs[i].split("=");
            if (kv[0] === op2s) {
              rs = kv.length > 1 ? kv[1] : "";
              break;
            }
          }
          break;
      }
      break;
  }

  // Result transformation (simplified for test — only relevant for numeric ops)
  const rt = data.resultTransformation || "none";
  if (rt === 'none') return rs;
  if (rt === 'round') return Math.round(makeNumber(rs));
  if (rt === 'string') return makeString(makeNumber(rs));
  if (rt === 'floor') return Math.floor(makeNumber(rs));
  if (rt === 'fixed') return makeNumber(Math.round(makeNumber(rs)*100) / 100);
  return rs;
}

// ---- Test runner ----
let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log('  \u2705 ' + name);
    passed++;
  } else {
    console.log('  \u274C ' + name);
    console.log('     Expected: ' + e);
    console.log('     Got:      ' + a);
    failed++;
  }
}

// ---- Real OptanonConsent cookie string ----
const COOKIE_ORIGINAL = 'isGpcEnabled=0&datestamp=Fri+Apr+10+2026+10%3A32%3A19+GMT%2B0530+(India+Standard+Time)&version=202511.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=1fb7cf71-1132-42bc-8701-be7adbbdb667&interactionCount=2&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0004%3A1%2CC0002%3A1%2CC0003%3A1&intType=1&geolocation=IN%3BTG&AwaitingReconsent=false';

// landingPath moved to the FIRST position
const COOKIE_FIRST = 'landingPath=NotLandingPage&isGpcEnabled=0&datestamp=Fri+Apr+10+2026&version=202511.1.0&groups=C0001%3A1';

// landingPath moved to the LAST position
const COOKIE_LAST = 'isGpcEnabled=0&datestamp=Fri+Apr+10+2026&version=202511.1.0&groups=C0001%3A1&landingPath=NotLandingPage';

// landingPath with empty value
const COOKIE_EMPTY_VALUE = 'isGpcEnabled=0&landingPath=&groups=C0001%3A1';

// landingPath with no value (key only, no =)
const COOKIE_KEY_ONLY = 'isGpcEnabled=0&landingPath&groups=C0001%3A1';

// No landingPath at all
const COOKIE_MISSING = 'isGpcEnabled=0&datestamp=Fri+Apr+10+2026&version=202511.1.0&groups=C0001%3A1';

// Similar key name (should NOT match)
const COOKIE_SIMILAR_KEY = 'isGpcEnabled=0&landingPathExtra=ShouldNotMatch&landingPath=CorrectValue&groups=C0001';

// Value containing encoded characters
const COOKIE_ENCODED = 'isGpcEnabled=0&landingPath=Some%20Page%20Name&groups=C0001';

// Single key-value pair
const COOKIE_SINGLE = 'landingPath=OnlyOne';

// Custom delimiter (semicolon)
const COOKIE_SEMICOLON = 'isGpcEnabled=0;landingPath=NotLandingPage;groups=C0001';

// ---- Tests ----
console.log('\n--- getParam Tests ---\n');

console.log('Basic functionality:');
assert(
  '1. Original cookie — landingPath in middle',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_ORIGINAL, op2: 'landingPath', op3: '&' }),
  'NotLandingPage'
);

assert(
  '2. landingPath at FIRST position',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_FIRST, op2: 'landingPath', op3: '&' }),
  'NotLandingPage'
);

assert(
  '3. landingPath at LAST position',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_LAST, op2: 'landingPath', op3: '&' }),
  'NotLandingPage'
);

assert(
  '4. Get a different key (consentId)',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_ORIGINAL, op2: 'consentId', op3: '&' }),
  '1fb7cf71-1132-42bc-8701-be7adbbdb667'
);

assert(
  '5. Get first key (isGpcEnabled)',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_ORIGINAL, op2: 'isGpcEnabled', op3: '&' }),
  '0'
);

assert(
  '6. Get last key (AwaitingReconsent)',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_ORIGINAL, op2: 'AwaitingReconsent', op3: '&' }),
  'false'
);

console.log('\nEdge cases:');
assert(
  '7. Empty value — returns empty string',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_EMPTY_VALUE, op2: 'landingPath', op3: '&' }),
  ''
);

assert(
  '8. Key with no = sign — returns empty string',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_KEY_ONLY, op2: 'landingPath', op3: '&' }),
  ''
);

assert(
  '9. Key not present — returns undefined',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_MISSING, op2: 'landingPath', op3: '&' }),
  undefined
);

assert(
  '10. Similar key name — matches exact key only',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_SIMILAR_KEY, op2: 'landingPath', op3: '&' }),
  'CorrectValue'
);

assert(
  '11. Value with encoded characters — returns raw encoded value',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_ENCODED, op2: 'landingPath', op3: '&' }),
  'Some%20Page%20Name'
);

assert(
  '12. Single key-value pair string',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_SINGLE, op2: 'landingPath', op3: '&' }),
  'OnlyOne'
);

console.log('\nCustom delimiters:');
assert(
  '13. Semicolon delimiter',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_SEMICOLON, op2: 'landingPath', op3: ';' }),
  'NotLandingPage'
);

assert(
  '14. Default delimiter (omit Param 3) — falls back to &',
  runCode({ functionType: 'strings', stringMethodName: 'getParam', op1: COOKIE_ORIGINAL, op2: 'landingPath', op3: '' }),
  'NotLandingPage'
);

console.log('\nComparison with splitSpecial (old approach):');
assert(
  '15. splitSpecial step 1 — split by "landingPath=" get index 1',
  runCode({ functionType: 'strings', stringMethodName: 'splitSpecial', op1: COOKIE_ORIGINAL, op2: 'landingPath=', op3: '1' }),
  'NotLandingPage&groups=C0001%3A1%2CC0004%3A1%2CC0002%3A1%2CC0003%3A1&intType=1&geolocation=IN%3BTG&AwaitingReconsent=false'
);

// The old approach needs a second variable to trim — getParam does it in one shot
const step1Result = runCode({ functionType: 'strings', stringMethodName: 'splitSpecial', op1: COOKIE_ORIGINAL, op2: 'landingPath=', op3: '1' });
assert(
  '16. splitSpecial step 2 — split step1 by "&" get index 0 (simulating 2nd variable)',
  runCode({ functionType: 'strings', stringMethodName: 'splitSpecial', op1: step1Result, op2: '&', op3: '0' }),
  'NotLandingPage'
);

console.log('\n--- Results: ' + passed + ' passed, ' + failed + ' failed ---\n');
