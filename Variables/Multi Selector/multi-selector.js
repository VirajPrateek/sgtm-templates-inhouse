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

// Build arrays maintaining position and adding 'na' for missing values
var categoryArr = [];
var labelArr = [];
var actionArr = [];
var positionArr = [];
var locationArr = [];
var eventDetailsArr = [];

for (var i = 0; i < list.length; i++) {
  var item = list[i];

  // Extract values or use 'na' as placeholder
  var category = item['component.CategoryEvent'] || 'na';
  var label = item['component.LabelEvent'] || 'na';
  var action = item['component.ActionEvent'] || 'na';
  var position = item['component.PositionEvent'] || 'na';
  var location = item['component.LocationEvent'] || 'na';
  var eventDetails = item['component.EventDetails'] || 'na';

  // Deduplicate category, label, action, position
  if (categoryArr.indexOf(category) === -1) categoryArr.push(category);
  if (labelArr.indexOf(label) === -1) labelArr.push(label);
  if (actionArr.indexOf(action) === -1) actionArr.push(action);
  if (positionArr.indexOf(position) === -1) positionArr.push(position);

  // Keep all values for location and event_details to preserve positional alignment
  locationArr.push(location);
  eventDetailsArr.push(eventDetails);
}

log('Category array: ' + JSON.stringify(categoryArr), 'info');
log('Label array: ' + JSON.stringify(labelArr), 'info');
log('Action array: ' + JSON.stringify(actionArr), 'info');
log('Position array: ' + JSON.stringify(positionArr), 'info');
log('Location array: ' + JSON.stringify(locationArr), 'info');
log('Event details array: ' + JSON.stringify(eventDetailsArr), 'info');

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