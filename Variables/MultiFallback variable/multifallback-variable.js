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

// ---- NUMERIC CHECK ----
function isNumeric(v) {
  if (v === null || v === undefined) return false;
  var n = makeNumber(v);
  return n !== undefined;
}

// ---- CUSTOMER ID CHECK ----
function isValidCustomerID(v) {
  // Reject null, undefined, false
  if (v === null || v === undefined || v === false) return false;
  
  // If number, accept it (numbers are valid by definition)
  if (typeof v === 'number') {
    return true;
  }
  
  // If string, must be digits only
  if (typeof v === 'string') {
    var trimmed = normalize(v);
    // Check if all characters are digits
    for (var i = 0; i < trimmed.length; i++) {
      var char = trimmed.charAt(i);
      if (char < '0' || char > '9') {
        return false;
      }
    }
    return trimmed.length > 0; // Must have at least 1 digit
  }
  
  return false;
}

// ---- GENERIC VALIDATION ROUTER ----
function isValid(value, rule) {
  var resolved = (typeof value === 'function') ? value() : value;
  
  if (rule === 'none') return true;
  if (rule === 'nullundefined') return !isNullUndefinedInvalid(resolved);
  if (rule === 'numeric') return isNumeric(resolved);
  if (rule === 'customerid') return isValidCustomerID(resolved);
  return !isDefaultInvalid(resolved); // default rule
}

// ---- MAIN EXECUTION ----
for (var i = 0; i < rows.length; i++) {
  var row = rows[i];
  var value = row.value1;
  var rule = row.validation1 || 'default';
  
  if (isValid(value, rule)) {
    return (typeof value === 'function') ? value() : value;
  }
}

return undefined;