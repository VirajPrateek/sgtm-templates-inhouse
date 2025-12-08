const rows = data.simpleTable1 || [];

const makeNumber = require('makeNumber');

// ---- UTILITIES ----
function normalize(v) {
  return (typeof v === 'string') ? v.trim() : v;
}

function isDefaultInvalid(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string' && normalize(v) === '') return true;
  if (normalize(v) === 'not applicable') return true;
  if (normalize(v) === 'na') return true;
  return false;
}

function isNullUndefinedInvalid(v) {
  return v === null || v === undefined;
}

// ---- NUMERIC CHECK (makeNumber only) ----
function isNumeric(v) {
  if (v === null || v === undefined) return false;
  var n = makeNumber(v);
  return n !== undefined;
}

// ---- GENERIC VALIDATION ROUTER ----
function isValid(value, rule) {
  const resolved = (typeof value === 'function') ? value() : value;

  if (rule === 'none') return true;
  if (rule === 'nullundefined') return !isNullUndefinedInvalid(resolved);
  if (rule === 'numeric') return isNumeric(resolved);

  return !isDefaultInvalid(resolved); // default rule
}

// ---- MAIN EXECUTION ----
for (const row of rows) {
  const value = row.value1;
  const rule = row.validation1 || 'default';

  if (isValid(value, rule)) {
    return (typeof value === 'function') ? value() : value;
  }
}

return undefined;