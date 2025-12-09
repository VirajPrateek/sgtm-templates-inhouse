function evaluate(variable, operator, value) {
  if (!variable) return false;
  
  var varStr = '' + variable;
  var valStr = '' + value;
  
  if (operator === '==') {
    return varStr === valStr;
  } else if (operator === '!=') {
    return varStr !== valStr;
  } else if (operator === 'contains') {
    return varStr.indexOf(valStr) !== -1;
  }
  return false;
}

function evaluateGroup(conditions, logic) {
  if (conditions.length === 0) return false;
  
  if (logic === 'OR') {
    for (var i = 0; i < conditions.length; i++) {
      if (evaluate(conditions[i].variable, conditions[i].operator, conditions[i].value)) {
        return true;
      }
    }
    return false;
  } else {
    for (var i = 0; i < conditions.length; i++) {
      if (!evaluate(conditions[i].variable, conditions[i].operator, conditions[i].value)) {
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