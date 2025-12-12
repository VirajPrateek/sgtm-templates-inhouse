const logToConsole = require('logToConsole');
const makeString = require('makeString');

// 1. EVALUATE SINGLE CONDITION
function evaluate(variable, checkType, value) {
  // Safe string conversion
  var varStr = variable === undefined || variable === null ? '' : makeString(variable).trim();
  var valStr = value === undefined || value === null ? '' : makeString(value).trim();
  var actualCheckType = checkType ? makeString(checkType) : '=='; // Default to == if missing

  var result = false;

  switch (actualCheckType) {
    case '==':
      // Using loose equality for "2" == 2 scenarios, or strict if you prefer
      result = (varStr == valStr);
      break;
    case '!=':
      result = (varStr != valStr);
      break;
    case 'contains':
      result = varStr.indexOf(valStr) !== -1;
      break;
    case 'does_not_contain': // Useful to have
      result = varStr.indexOf(valStr) === -1;
      break;
    case 'starts_with': // Useful to have
      result = varStr.indexOf(valStr) === 0;
      break;
    case 'ends_with': // Useful to have
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
      logToConsole('WARNING: Unknown checkType "' + actualCheckType + '". Defaulting to false.');
      result = false;
  }

  // Detailed logging for debugging
  // logToConsole('CHECK: "' + varStr + '" ' + actualCheckType + ' "' + valStr + '" = ' + result);
  
  return result;
}

// 2. EVALUATE GROUP (The Fix is here)
function evaluateGroup(conditions, logic, groupName) {
  // Guard clause: If conditions is undefined or not an array
  if (!conditions || !conditions.length) {
    // logToConsole(groupName + ' → Skipped (No conditions defined)');
    return false;
  }

  var conditionCount = conditions.length;
  // logToConsole(groupName + ' - Logic: ' + logic + ', Count: ' + conditionCount);

  if (logic === 'OR') {
    for (var i = 0; i < conditionCount; i++) {
      // FIX: Access the row object, then the property
      var row = conditions[i]; 
      
      // Ensure row exists before accessing properties
      if (row) {
        var condResult = evaluate(row.variable, row.checkType, row.value);
        if (condResult) {
          logToConsole('✓ ' + groupName + ' matched on condition ' + (i + 1));
          return true;
        }
      }
    }
    return false; // All ORs failed
  } else { 
    // AND logic
    for (var i = 0; i < conditionCount; i++) {
      // FIX: Access the row object, then the property
      var row = conditions[i];
      
      if (row) {
        var condResult = evaluate(row.variable, row.checkType, row.value);
        if (!condResult) {
          // logToConsole(groupName + ' failed on condition ' + (i + 1));
          return false; // One AND failed, so the whole group fails
        }
      }
    }
    logToConsole('✓ ' + groupName + ' matched (all conditions passed)');
    return true; // All ANDs passed
  }
}

// 3. MAIN LOGIC FLOW
logToConsole('--- IF/ELSE Logic Start ---');

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
logToConsole('--- Default Return ---');
return data.defaultReturn;