const logToConsole = require('logToConsole');

// Template functions
function evaluate(variable, checkType, value) {
  if (variable === null || variable === undefined) {
    var result = checkType === 'falsy';
    logToConsole('evaluate - variable: ' + variable + ', checkType: ' + checkType + ', result: ' + result);
    return result;
  }
  
  var varStr = '' + variable;
  var result = false;
  
  if (checkType === '==') {
    result = varStr === value || variable === true || variable === 1;
    logToConsole('evaluate - "' + varStr + '" == "' + value + '" → ' + result);
  } else if (checkType === '!=') {
    result = varStr !== value;
    logToConsole('evaluate - "' + varStr + '" != "' + value + '" → ' + result);
  } else if (checkType === 'contains') {
    result = varStr.indexOf(value) !== -1;
    logToConsole('evaluate - "' + varStr + '" contains "' + value + '" → ' + result);
  } else if (checkType === 'truthy') {
    result = variable === true || variable === "true" || variable === 1 || (typeof variable === 'string' && varStr.trim() !== '');
    logToConsole('evaluate - is truthy? ' + variable + ' → ' + result);
  } else if (checkType === 'falsy') {
    result = variable === false || variable === "false" || variable === 0 || varStr.trim() === '' || variable === null || variable === undefined;
    logToConsole('evaluate - is falsy? ' + variable + ' → ' + result);
  }
  
  return result;
}

function evaluateGroup(conditions, logic, groupName) {
  logToConsole(groupName + ' - logic: ' + logic + ', conditions count: ' + conditions.length);
  
  if (conditions.length === 0) {
    logToConsole(groupName + ' → false (no conditions)');
    return false;
  }
  
  if (logic === 'OR') {
    for (var i = 0; i < conditions.length; i++) {
      var condResult = evaluate(conditions[i].variable, conditions[i].checkType, conditions[i].value);
      if (condResult) {
        logToConsole(groupName + ' → TRUE (condition ' + (i + 1) + ' passed, OR short-circuit)');
        return true;
      }
    }
    logToConsole(groupName + ' → FALSE (all conditions failed)');
    return false;
  } else {
    for (var i = 0; i < conditions.length; i++) {
      var condResult = evaluate(conditions[i].variable, conditions[i].checkType, conditions[i].value);
      if (!condResult) {
        logToConsole(groupName + ' → FALSE (condition ' + (i + 1) + ' failed, AND stops)');
        return false;
      }
    }
    logToConsole(groupName + ' → TRUE (all conditions passed)');
    return true;
  }
}

// IF / ELSE IF / ELSE IF / ELSE
logToConsole('========== IF-ELSE EVALUATION START ==========');

if (evaluateGroup(data.conditions1 || [], data.logic1, 'IF')) {
  logToConsole('✓ MATCHED: IF → return "' + data.return1 + '"');
  return data.return1;
}

if (evaluateGroup(data.conditions2 || [], data.logic2, 'ELSE IF 2')) {
  logToConsole('✓ MATCHED: ELSE IF 2 → return "' + data.return2 + '"');
  return data.return2;
}

if (evaluateGroup(data.conditions3 || [], data.logic3, 'ELSE IF 3')) {
  logToConsole('✓ MATCHED: ELSE IF 3 → return "' + data.return3 + '"');
  return data.return3;
}

logToConsole('✓ MATCHED: ELSE (default) → return "' + data.defaultReturn + '"');
return data.defaultReturn;