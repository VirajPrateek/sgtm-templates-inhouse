const getEventData = require('getEventData');
const JSON = require('JSON');
const logToConsole = require('logToConsole');

// Read datalayer directly
var rawData = getEventData('datalayer');
//logToConsole('Raw datalayer:', rawData);
var eventName = getEventData('event_name');
//logToConsole('event_name:', eventName);
var returnType = data.returnType;
//logToConsole('data:', data);
var listKey;

if (eventName === 'Event.betFilters') {
  listKey = 'betFilters';
}
else if (eventName === 'Event.FeebackLoad') {
 listKey = 'FeedbackQuestions';
}
if (typeof rawData !== 'string' || rawData.charAt(0) !== '{' || !listKey) {
  return undefined;
}

// Parse stringified object
var parsed = JSON.parse(rawData);
logToConsole('Parsed datalayer:', parsed);

var list = parsed[listKey];
logToConsole('Products list:', list);

if (!list || !list.length) return undefined;

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
  return categoryArr.join('|');
}

if (returnType === 'label_event') {
  return labelArr.join('|');
}

if (returnType === 'action_event') {
  return actionArr.join('|');
}

if (returnType === 'position_event') {
  return positionArr.join('|');
}

if (returnType === 'location_event') {
  return locationArr.join('|');
}

if (returnType === 'event_details') {
  return eventDetailsArr.join('|');
}

return undefined;