const getEventData = require('getEventData');
const JSON = require('JSON');
const _logModule = require('logToConsole');
const LOG_ENABLED = false;
const log = (msg, type) => {
  if (LOG_ENABLED) {
    _logModule(msg, type);
  }
};

// Read datalayer directly
var rawData = getEventData('datalayer');
var eventName = getEventData('event_name');
var returnType = data.returnType;

log('Raw datalayer: ' + rawData, 'info');
log('Event name: ' + eventName, 'info');
log('Return type: ' + returnType, 'info');

if (!returnType) {
  return undefined;
}

// Determine list key based on event name
var listKey;
if (eventName === 'Event.betFilters') {
  listKey = 'betFilters';
} else if (eventName === 'Event.FeebackLoad') {
  listKey = 'FeedbackQuestions';
}

if (!listKey) {
  log('No list key found for event: ' + eventName, 'warn');
  return undefined;
}

// Handle both stringified and object data layers
var parsed;
if (typeof rawData === 'string') {
  try {
    parsed = JSON.parse(rawData);
    log('Parsed stringified datalayer: ' + JSON.stringify(parsed), 'info');
  } catch (e) {
    log('Error parsing datalayer: ' + e, 'error');
    return undefined;
  }
} else if (typeof rawData === 'object' && rawData !== null) {
  parsed = rawData;
  log('Using object datalayer: ' + JSON.stringify(parsed), 'info');
} else {
  log('Invalid datalayer type: ' + typeof rawData, 'error');
  return undefined;
}

var list = parsed[listKey];
log('List from key "' + listKey + '": ' + JSON.stringify(list), 'info');

if (!list || !list.length) {
  log('No list found or empty list', 'warn');
  return undefined;
}

var categoryArr = [];
var labelArr = [];
var actionArr = [];
var positionArr = [];
var locationArr = [];
var eventDetailsArr = [];

for (var i = 0; i < list.length; i++) {
  var item = list[i];

  var category = item['component.CategoryEvent'];
  var label = item['component.LabelEvent'];
  var action = item['component.ActionEvent'];
  var position = item['component.PositionEvent'];
  var location = item['component.LocationEvent'];
  var eventDetails = item['component.EventDetails'];

  if (category && categoryArr.indexOf(category) === -1) {
    categoryArr.push(category);
  }

  if (label && labelArr.indexOf(label) === -1) {
    labelArr.push(label);
  }
  
  if (action && actionArr.indexOf(action) === -1) {
    actionArr.push(action);
  }

  if (position && positionArr.indexOf(position) === -1) {
    positionArr.push(position);
  }
  
  if (location && locationArr.indexOf(location) === -1) {
    locationArr.push(location);
  }

  if (eventDetails && eventDetailsArr.indexOf(eventDetails) === -1) {
    eventDetailsArr.push(eventDetails);
  }
}

/*categoryArr.sort();
labelArr.sort();
actionArr.sort();
positionArr.sort();
locationArr.sort();
eventDetailsArr.sort();*/

if (!returnType) {
  return undefined;
}

if (returnType === 'category_event') {
  log('Returning category_event: ' + categoryArr.join('|'), 'info');
  return categoryArr.join('|');
}

if (returnType === 'label_event') {
  log('Returning label_event: ' + labelArr.join('|'), 'info');
  return labelArr.join('|');
}

if (returnType === 'action_event') {
  log('Returning action_event: ' + actionArr.join('|'), 'info');
  return actionArr.join('|');
}

if (returnType === 'position_event') {
  log('Returning position_event: ' + positionArr.join('|'), 'info');
  return positionArr.join('|');
}

if (returnType === 'location_event') {
  log('Returning location_event: ' + locationArr.join('|'), 'info');
  return locationArr.join('|');
}

if (returnType === 'event_details') {
  log('Returning event_details: ' + eventDetailsArr.join('|'), 'info');
  return eventDetailsArr.join('|');
}

log('No matching return type found: ' + returnType, 'warn');
return undefined;