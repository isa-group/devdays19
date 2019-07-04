/* global _ */

/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (int ARGS variable)
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function as argument,
 * call this callback function with the dashboard object (look at scripted_async.js for an example)
 */

'use strict';

// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

return function(callback) {

// Initialise dashbard
var dashboard;

// Save registry endpoint and agreementId from URL and then corresponding agreement is loaded
var registry = ARGS.registry;
var reporter = ARGS.reporter;
var agreementId = ARGS.agreementId;
var evolution = ARGS.evolution;

var urlRegistry = registry + agreementId;
var urlReporter;

if(evolution){
  urlReporter = reporter + "/api/v2/dashboards/evolution/"
}else{
  urlReporter = reporter + "/api/v2/dashboards/"
}

urlReporter += agreementId + "?registry=" + registry;

$.ajax({
  method: 'GET',
  url: urlReporter
})
.done(function(dashboard) {

  // Return dashboard
  callback(dashboard);
  })
.fail(function($xhr) {
console.log($xhr.responseText)

  // Return dashboard
  callback($xhr.responseText);
  });
}