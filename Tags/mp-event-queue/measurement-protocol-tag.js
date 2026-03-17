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


const eventData = getAllEventData();

const eventName = data.eventName ? data.eventName : eventData.event_name;

const debug = data.debugMode ?  logToConsole('Debug Mode') : logToConsole('Normal Mode');

const endpoint = data.debugMode ? 'https://sst-kafka-bridge.int.itsfogo.com' :
'https://sst-kafka-bridge.int.itsfogo.com';

const postUrl = endpoint;
//+ '?measurement_id=' + encodeUriComponent(data.measurementId) + '&api_secret=' + encodeUriComponent(data.apiSecret);


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




sendHttpRequest(postUrl, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  //timeout: 2000
}, requestBody).then((result) => {
  if (result.statusCode >= 200 && result.statusCode < 300) {
    data.gtmOnSuccess();
  } else {
    logToConsole('MP Endpoint Error: ' + result.statusCode);
    data.gtmOnFailure();
  }
}, () => {
  data.gtmOnFailure();
});

function getUserProperties() {
  let userProperties = {};

  if (data.userProperties && data.userProperties.length) {
    data.userProperties.forEach((property) => {

      if (property.value !== undefined && property.value !== null && property.value !== '') {
        userProperties[property.fieldName] = {
          value: property.value
        };
      }

    });
  }
  
  if (getType(data.userPropertiesVariable) === 'object') {
     Object.keys(data.userPropertiesVariable).forEach(function(key) {

    const value = data.userPropertiesVariable[key];

    if (value !== undefined && value !== null && value !== '') {
      userProperties[key] = {
        value: value
      };
    }

  });
    
    
  }

  return Object.keys(userProperties).length ? userProperties : undefined;
}



function isValidGA4ParamName(name) {

  if (!name)  return false;
  if (name.length > 40) return false;
  return  testRegex(ga4ParamRegex, name);

}

function shouldExclude(key, value) {
  
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
  
 if (excludedKeys[key])
 { 
   //logToConsole('excludedKeys');
   return true;
 }
 if (key.indexOf('x-') === 0)  { 
   //logToConsole('x-');
   return true;
 }
 if (value === undefined || value === null)  { 
   //logToConsole('null check');
   return true;
 }
 if (!isValidGA4ParamName(key))  { 
   //logToConsole('validParamName');
   return true;
 }
  
  return false;
  
}

function getEvent() {
  
  let event = {  
    name: eventName,
    params: {}
  };
  // loop through eventData
  
  
Object.keys(eventData).forEach(function(key) {
  const value = eventData[key];
  //logToConsole('Checking: ',key, value); 
 if (!shouldExclude(key, value)) {
   //logToConsole('Adding: ',key, value); 
 event.params[key] = value;
  }
});
  
  //  loop through event params added in tag
  if (data.eventParameters && data.eventParameters.length) {
    data.eventParameters.forEach((property) => {
     
      event.params[property.fieldName] = property.value;

    });
  }
    
  //event.params.session_id = makeNumber(eventData.ga_session_id);
  //logToConsole('Event Params: ' , event.params);
  //logToConsole('N Event Params: ',Object.keys(event.params).length);
  return event;
}