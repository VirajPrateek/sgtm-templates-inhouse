// Template functions
function evaluate(variable, checkType, value) {
  if (variable === null || variable === undefined) {
    return checkType === 'falsy';
  }
  
  var varStr = '' + variable;
  
  if (checkType === '==') {
    return varStr === value || variable === true || variable === 1;
  } else if (checkType === '!=') {
    return varStr !== value;
  } else if (checkType === 'contains') {
    return varStr.indexOf(value) !== -1;
  } else if (checkType === 'truthy') {
    // Truthy: true, "true", 1, or non-empty string
    return variable === true || variable === "true" || variable === 1 || (typeof variable === 'string' && varStr.trim() !== '');
  } else if (checkType === 'falsy') {
    // Falsy: false, "false", 0, empty string, null, undefined
    return variable === false || variable === "false" || variable === 0 || varStr.trim() === '' || variable === null || variable === undefined;
  }
  return false;
}

function evaluateGroup(conditions, logic) {
  if (conditions.length === 0) return false;
  
  if (logic === 'OR') {
    for (var i = 0; i < conditions.length; i++) {
      if (evaluate(conditions[i].variable, conditions[i].checkType, conditions[i].value)) {
        return true;
      }
    }
    return false;
  } else {
    for (var i = 0; i < conditions.length; i++) {
      if (!evaluate(conditions[i].variable, conditions[i].checkType, conditions[i].value)) {
        return false;
      }
    }
    return true;
  }
}

// IF / ELSE IF / ELSE IF / ELSE
if (evaluateGroup(data.conditions1 || [], data.logic1)) {
  return data.return1;
} else if (evaluateGroup(data.conditions2 || [], data.logic2)) {
  return data.return2;
} else if (evaluateGroup(data.conditions3 || [], data.logic3)) {
  return data.return3;
} else {
  return data.defaultReturn;
}