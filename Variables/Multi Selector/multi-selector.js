const getEventData = require('getEventData');
const JSON = require('JSON');
const _log = require('logToConsole');
const LOG_ENABLED = false;
const log = (msg) => { if (LOG_ENABLED) _log(msg); };

var rawData = getEventData('datalayer');
var eventName = getEventData('event_name');
var returnType = data.returnType;

if (!returnType) return undefined;

// Determine list key based on event name
var listKey;
if (eventName === 'Event.betFilters') {
  listKey = 'betFilters';
} else if (eventName === 'Event.FeebackLoad') {
  listKey = 'FeedbackQuestions';
}

if (!listKey) return undefined;

// Handle both stringified and object data layers
var parsed;
if (typeof rawData === 'string' && rawData.charAt(0) === '{') {
  parsed = JSON.parse(rawData);
  if (!parsed) return undefined;
} else if (typeof rawData === 'object' && rawData !== null) {
  parsed = rawData;
} else {
  return undefined;
}

var list = parsed[listKey];
if (!list || !list.length) return undefined;

var categoryArr = [];
var labelArr = [];
var actionArr = [];
var positionArr = [];
var locationArr = [];
var eventDetailsArr = [];

for (var i = 0; i < list.length; i++) {
  var item = list[i];

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

log('Multi Selector: ' + returnType + ' for ' + eventName);

if (returnType === 'category_event') return categoryArr.join('|');
if (returnType === 'label_event') return labelArr.join('|');
if (returnType === 'action_event') return actionArr.join('|');
if (returnType === 'position_event') return positionArr.join('|');
if (returnType === 'location_event') return locationArr.join('|');
if (returnType === 'event_details') return eventDetailsArr.join('|');

return undefined;
