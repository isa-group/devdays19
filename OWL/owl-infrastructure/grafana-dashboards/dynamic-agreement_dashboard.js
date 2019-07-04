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

var url = registry + agreementId;


$.ajax({
  method: 'GET',
  url: url
})
.done(function(agreement) {


// var agreement = JSON.parse(result);

// Setup basic dashboard configuration

var dashboard = {
        "__inputs": [
          {
            "name": "DS_INFLUXDB",
            "label": "influxDB",
            "description": "",
            "type": "datasource",
            "pluginId": "influxdb",
            "pluginName": "InfluxDB"
          }
        ],
        "__requires": [
          {
            "type": "grafana",
            "id": "grafana",
            "name": "Grafana",
            "version": "4.6.3"
          },
          {
            "type": "panel",
            "id": "graph",
            "name": "Graph",
            "version": ""
          },
          {
            "type": "datasource",
            "id": "influxdb",
            "name": "InfluxDB",
            "version": "1.0.0"
          },
          {
            "type": "panel",
            "id": "table",
            "name": "Table",
            "version": ""
          }
        ],
        "annotations": {
          "list": [
            {
              "builtIn": 1,
              "datasource": "-- Grafana --",
              "enable": true,
              "hide": true,
              "iconColor": "rgba(0, 211, 255, 1)",
              "name": "Annotations & Alerts",
              "type": "dashboard"
            }
          ]
        },
        "editable": true,
        "gnetId": null,
        "graphTooltip": 0,
        "hideControls": false,
        "id": null,
        "links": [],
        "refresh": "5s",
        "rows": [],
        "schemaVersion": 14,
        "style": "dark",
        "time": {
          "from": "now-5y",
          "to": "now"
        },
        "timepicker": {
          "refresh_intervals": [
            "5s",
            "10s",
            "30s",
            "1m",
            "5m",
            "15m",
            "30m",
            "1h",
            "2h",
            "1d"
          ],
          "time_options": [
            "5m",
            "15m",
            "1h",
            "6h",
            "12h",
            "24h",
            "2d",
            "7d",
            "30d"
          ]
        },
        "timezone": "",
        "title": "GAUSS " + agreementId,
        "uid": null,
        "version": 12
}

// Set non-static fiels from agreement into variables
var timezone = agreement.context.validity.timeZone;

var metrics = [];
var guaranteesData = {};
for(var i = 0; i < agreement.terms.guarantees.length; i++){

    var guarantee = agreement.terms.guarantees[i];

    // Save metrics
    metrics.push(guarantee.id);

    // Set guarantees for every metric
    guaranteesData[guarantee.id] = guarantee;
}

// Set dashboard rows
// There are so many rows as metrics

for(var i = 0; i < metrics.length; i++){

  // Initialise row
  var row;

  // Set basic row information
  row = {
     "collapse": false,
      "height": "300",
      "panels" : [],
      "repeat": null,
      "repeatIteration": null,
      "repeatRowId": null,
      "showTitle": false,
      "title": "Gráficas",
      "titleSize": "h6"
  }


  // Set row panels
  // By default we're setting two panels per row: a table and a graph

  // First we set table panel
  var table;

  table = {
          "columns": [],
          "datasource": "InfluxDB",
          "fontSize": "100%",
          "height": "",
          "hideTimeOverride": false,
          "id": i,
          "links": [
            {
              "dashUri": "db/gauss-sco-evolucion",
              "dashboard": "GAUSS SCO evolución",
              "includeVars": true,
              "keepTime": true,
              "targetBlank": true,
              "title": "GAUSS SCO evolución",
              "type": "dashboard"
            }
          ],
          "pageSize": null,
          "scroll": true,
          "showHeader": true,
          "sort": {
            "col": 0,
            "desc": true
          },
          "span": 6,
          "styles": [
            {
              "alias": "Fecha",
              "dateFormat": "MMMM D, YYYY LT",
              "pattern": "Time",
              "preserveFormat": false,
              "sanitize": false,
              "type": "date",
              "unit": "dateTimeAsUS"
            }
          ],
          "targets": [],
          "timeFrom": null,
          "timeShift": null,
          "title": metrics[i],
          "transform": "timeseries_to_columns",
          "transparent": true,
          "type": "table"
  }

  // Next we set graph panel
  var graph;

  graph = {
    "alert": {
      "conditions": [
        {
          "evaluator": {
            "params": [
              90
            ],
            "type": "lt"
          },
          "operator": {
            "type": "and"
          },
          "query": {
            "params": [
              "A",
              "740h",
              "now"
            ]
          },
          "reducer": {
            "params": [],
            "type": "avg"
          },
          "type": "query"
        },
        {
          "evaluator": {
            "params": [
              90
            ],
            "type": "lt"
          },
          "operator": {
            "type": "or"
          },
          "query": {
            "params": [
              "B",
              "740h",
              "now"
            ]
          },
          "reducer": {
            "params": [],
            "type": "avg"
          },
          "type": "query"
        },
        {
          "evaluator": {
            "params": [
              90
            ],
            "type": "lt"
          },
          "operator": {
            "type": "or"
          },
          "query": {
            "params": [
              "C",
              "740h",
              "now"
            ]
          },
          "reducer": {
            "params": [],
            "type": "avg"
          },
          "type": "query"
        },
        {
          "evaluator": {
            "params": [
              90
            ],
            "type": "lt"
          },
          "operator": {
            "type": "or"
          },
          "query": {
            "params": [
              "D",
              "740h",
              "now"
            ]
          },
          "reducer": {
            "params": [],
            "type": "avg"
          },
          "type": "query"
        }
      ]
    },
    "aliasColors": {
      "P1": "#bf1b00",
      "P4": "#d683ce"
    },
    "bars": false,
    "dashLength": 10,
    "dashes": false,
    "datasource": "InfluxDB",
    "fill": 1,
    "height": "",
    "id": i+4,
    "legend": {
      "avg": false,
      "current": false,
      "max": false,
      "min": false,
      "show": true,
      "total": false,
      "values": false
    },
    "lines": true,
    "linewidth": 1,
    "links": [
      {
        "dashUri": "db/gauss-sco-evolucion",
        "dashboard": "GAUSS SCO evolución",
        "includeVars": true,
        "keepTime": true,
        "targetBlank": true,
        "title": "GAUSS SCO evolución",
        "type": "dashboard"
      }
    ],
    "nullPointMode": "null",
    "percentage": false,
    "pointradius": 5,
    "points": false,
    "renderer": "flot",
    "seriesOverrides": [],
    "spaceLength": 10,
    "span": 6,
    "stack": false,
    "steppedLine": false,
    "targets": [],
    "thresholds": [
      {
        "colorMode": "critical",
        "fill": true,
        "line": true,
        "op": "lt",
        "value": 90
      }
    ],
    "timeFrom": null,
    "timeShift": null,
    "title": metrics[i],
    "tooltip": {
      "shared": true,
      "sort": 0,
      "value_type": "individual"
    },
    "transparent": true,
    "type": "graph",
    "xaxis": {
      "buckets": null,
      "mode": "time",
      "name": null,
      "show": true,
      "values": []
    },
    "yaxes": [
      {
        "format": "short",
        "label": null,
        "logBase": 1,
        "max": null,
        "min": null,
        "show": true
      },
      {
        "format": "short",
        "label": null,
        "logBase": 1,
        "max": null,
        "min": null,
        "show": true
      }
    ]
  }

  for(var j = 0; j < guaranteesData[metrics[i]].of.length; j++){
      var style = {
        "alias": "",
        "colorMode": "cell",
        "colors": [
          "#e24d42",
          "#508642",
          "rgba(63, 104, 51, 0)"
        ],
        "dateFormat": "YYYY-MM-DD HH:mm:ss",
        "decimals": 2,
        "link": true,
        "linkTargetBlank": true,
        "linkTooltip": "Ver evidencias",
        "linkUrl": reporter + "/evidences/#!/?agreement=" + agreementId + "&guarantee=" + metrics[i] + "&priority=" + guaranteesData[metrics[i]].of[j].scope.priority  + "&period=$__cell_0&value=$__cell&tz=" + timezone,
        "pattern": guaranteesData[metrics[i]].of[j].scope.priority,
        "thresholds": evolution ? 90 : [guaranteesData[metrics[i]].of[j].objective.split("=")[1].trim()],
        "type": "number",
        "unit": "short"
      }

      var target =  {
        "alias": guaranteesData[metrics[i]].of[j].scope.priority,
        "dsType": "influxdb",
        "groupBy": [],
        "measurement": evolution ? "metric_values_historical" : "metrics_values",
        "orderByTime": "ASC",
        "policy": "default",
        "refId": guaranteesData[metrics[i]].of[j].scope.priority,
        "resultFormat": "time_series",
        "select": [
          [
            {
              "params": [
                "value"
              ],
              "type": "field"
            }
          ]
        ],
        "tags": [
          {
            "key": "id",
            "operator": "=",
            "value": metrics[i]
          },
          {
            "condition": "AND",
            "key": "priority",
            "operator": "=",
            "value": guaranteesData[metrics[i]].of[j].scope.priority
          },
          {
            "condition": "AND",
            "key": "agreement",
            "operator": "=",
            "value": agreementId
          }
        ]
      }

      table.styles.push(style);
      table.targets.push(target);
      graph.targets.push(target);
  }

  row.panels.push(table);
  row.panels.push(graph);
  dashboard.rows.push(row)
}

// return dashboard;
callback(dashboard);
});
}