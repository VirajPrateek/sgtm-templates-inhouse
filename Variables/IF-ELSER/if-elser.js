const logToConsole = require('logToConsole');
const makeString = require('makeString');
const makeNumber = require('makeNumber');

// Wrapped logging function
function log(msg) {
  if (data.enableLog) {
    logToConsole(msg);
  }
}

// 1. EVALUATE SINGLE CONDITION
function evaluate(variable, checkType, value) {
  // Safe string conversion
  var varStr = variable === undefined || variable === null ? '' : makeString(variable).trim();
  var valStr = value === undefined || value === null ? '' : makeString(value).trim();

  // No default fallback logic to avoid confusion
  var actualCheckType = checkType ? makeString(checkType) : '';

  var result = false;

  // Helpers for numeric comparison
  var varNum, valNum;

  switch (actualCheckType) {
    case '==':
      // Loose equality matches standard JS/GTM expectation for fields that might be string vs number
      result = (varStr == valStr);
      break;
    case '!=':
      result = (varStr != valStr);
      break;
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      // Numeric handling using GTM safe API
      varNum = makeNumber(varStr);
      valNum = makeNumber(valStr);

      // Check for valid numbers. 
      // In sandbox, we avoid global isNaN. We can check type or self-inequality (x !== x is true for NaN).
      // makeNumber returns undefined if it can't convert, or possibly NaN.
      if (typeof varNum !== 'number' || typeof valNum !== 'number' || varNum !== varNum || valNum !== valNum) {
        result = false;
      } else {
        if (actualCheckType === 'gt') result = varNum > valNum;
        if (actualCheckType === 'gte') result = varNum >= valNum;
        if (actualCheckType === 'lt') result = varNum < valNum;
        if (actualCheckType === 'lte') result = varNum <= valNum;
      }
      break;
    case 'contains':
      result = varStr.indexOf(valStr) !== -1;
      break;
    case 'does_not_contain':
      result = varStr.indexOf(valStr) === -1;
      break;
    case 'starts_with':
      result = varStr.indexOf(valStr) === 0;
      break;
    case 'ends_with':
      var lenDiff = varStr.length - valStr.length;
      result = lenDiff >= 0 && varStr.lastIndexOf(valStr) === lenDiff;
      break;
    case 'truthy':
      // GTM specific truthy check: "false" string, "0" string, empty string are often considered falsy in tags
      result = (varStr !== '' && varStr !== 'false' && varStr !== '0' && varStr !== 'null' && varStr !== 'undefined');
      break;
    case 'falsy':
      result = (varStr === '' || varStr === 'false' || varStr === '0' || varStr === 'null' || varStr === 'undefined');
      break;
    default:
      log('WARNING: Unknown or missing checkType "' + actualCheckType + '". Defaulting to false.');
      result = false;
  }

  return result;
}

// 2. EVALUATE GROUP (Simplified and DRY)
function evaluateGroup(conditions, logic, groupName) {
  if (!conditions || !conditions.length) {
    return false;
  }

  var isAnd = (logic === 'AND');
  // If AND, we start 'true' and look for a failure.
  // If OR, we start 'false' and look for a success.
  var finalResult = isAnd ? true : false;

  for (var i = 0; i < conditions.length; i++) {
    var row = conditions[i];
    if (row) {
      var condResult = evaluate(row.variable, row.checkType, row.value);

      if (isAnd && !condResult) {
        // AND logic: one false ruins everything
        // log(groupName + ' failed on condition ' + (i + 1));
        return false;
      }

      if (!isAnd && condResult) {
        // OR logic: one true finds the match
        log('✓ ' + groupName + ' matched on condition ' + (i + 1));
        return true;
      }
    }
  }

  // If we exit the loop:
  // For AND: we never found a false, so return true.
  // For OR: we never found a true, so return false.
  if (finalResult) {
    log('✓ ' + groupName + ' matched (all conditions passed)');
  }
  return finalResult;
}

// 3. MAIN LOGIC FLOW
log('--- IF/ELSE Logic Start ---');

// Check IF
if (evaluateGroup(data.conditions1, data.logic1, 'IF')) {
  return data.return1;
}

// Check ELSE IF 1
if (evaluateGroup(data.conditions2, data.logic2, 'ELSE IF 1')) {
  return data.return2;
}

// Check ELSE IF 2
if (evaluateGroup(data.conditions3, data.logic3, 'ELSE IF 2')) {
  return data.return3;
}

// Default
log('--- Default Return ---');
return data.defaultReturn;