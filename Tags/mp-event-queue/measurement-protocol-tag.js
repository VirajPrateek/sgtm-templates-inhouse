const logToConsole = require('logToConsole');
const getAllEventData = require('getAllEventData');
const encodeUriComponent = require('encodeUriComponent');
const JSON = require('JSON');
const sendHttpRequest = require('sendHttpRequest');
const Object = require('Object');
const makeNumber = require('makeNumber');
const getType = require('getType');
const createRegex = require('createRegex');
const testRegex = require('testRegex');

const ga4ParamRegex = createRegex('^[a-zA-Z][a-zA-Z0-9_]{0,39}$');

const excludedKeys = {
  client_id: true,
  ip_override: true,
  client_hints: true,
  datalayer: true,
  event_name: true,
  screen_resoluation: true,
  firebase_conversion: true,
  user_agent: true,
  language: true
};

const eventData = getAllEventData();
const eventName = data.eventName || eventData.event_name;

const endpoint = data.debugMode
  ? 'https://www.google-analytics.com/debug/mp/collect'
  : 'https://www.google-analytics.com/mp/collect';

const postUrl =
  endpoint +
  '?measurement_id=' + encodeUriComponent(data.measurementId) +
  '&api_secret=' + encodeUriComponent(data.apiSecret);

/* --------------------------------------------------------
   Validation
-------------------------------------------------------- */

if (!eventData.client_id && !eventData.user_id) {
  logToConsole('MP request missing client_id and user_id');
  data.gtmOnFailure();
  return;
}

if (!eventName) {
  logToConsole('MP request missing event name');
  data.gtmOnFailure();
  return;
}

/* --------------------------------------------------------
   Payload Construction
-------------------------------------------------------- */

let payload = {
  events: [getEvent()]
};

if (eventData.client_id) payload.client_id = eventData.client_id;
if (eventData.user_id) payload.user_id = eventData.user_id;

const userProperties = getUserProperties();
if (userProperties) payload.user_properties = userProperties;

if (eventData.ip_override) payload.ip_override = eventData.ip_override;
if (eventData.user_agent) payload.user_agent = eventData.user_agent;
if (eventData.consent) payload.consent = eventData.consent;

const requestBody = JSON.stringify(payload);

/* --------------------------------------------------------
   Send Request
-------------------------------------------------------- */

sendHttpRequest(
  postUrl,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  },
  requestBody
).then(
  (result) => {
    if (result.statusCode >= 200 && result.statusCode < 300) {
      data.gtmOnSuccess();
    } else {
      logToConsole('MP Endpoint Error: ' + result.statusCode);
      data.gtmOnFailure();
    }
  },
  () => {
    data.gtmOnFailure();
  }
);

/* --------------------------------------------------------
   Helpers
-------------------------------------------------------- */

function getUserProperties() {

  let userProperties = {};

  // Properties defined in tag
  if (data.userProperties && data.userProperties.length) {
    data.userProperties.forEach(function(property) {

      if (property.value !== undefined && property.value !== null && property.value !== '') {
        userProperties[property.fieldName] = {
          value: property.value
        };
      }

    });
  }

  // Properties from variable
  if (getType(data.userPropertiesVariable) === 'object') {

    Object.keys(data.userPropertiesVariable).forEach(function(key) {

      const value = data.userPropertiesVariable[key];

      if (value !== undefined && value !== null && value !== '') {
        userProperties[key] = { value: value };
      }

    });

  }

  return Object.keys(userProperties).length ? userProperties : undefined;
}

function isValidGA4ParamName(name) {

  if (!name) return false;
  if (name.length > 40) return false;

  return testRegex(ga4ParamRegex, name);
}

function shouldExclude(key, value) {

  if (excludedKeys[key]) return true;
  if (key.indexOf('x-') === 0) return true;
  if (value === undefined || value === null) return true;
  if (!isValidGA4ParamName(key)) return true;

  return false;
}

function getEvent() {

  let event = {
    name: eventName,
    params: {}
  };

  /* Copy valid eventData parameters */

  Object.keys(eventData).forEach(function(key) {

    const value = eventData[key];

    if (!shouldExclude(key, value)) {
      event.params[key] = value;
    }

  });

  /* Add parameters configured in tag */

  if (data.eventParameters && data.eventParameters.length) {

    data.eventParameters.forEach(function(property) {
      event.params[property.fieldName] = property.value;
    });

  }

  // Optional session logic
  // event.params.session_id = makeNumber(eventData.ga_session_id);

  return event;
}