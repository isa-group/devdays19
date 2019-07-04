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

return function (callback) {

    // Initialise dashbard
    var dashboard;

    // Save registry endpoint and agreementId from URL and then corresponding agreement is loaded
    // var registry = ARGS.registry;
    // var reporter = ARGS.reporter;
    // var agreementId = ARGS.agreementId;
    // var evolution = ARGS.evolution;

    // var urlRegistry = registry + agreementId;
    // var urlReporter;

    // if(evolution){
    //   urlReporter = reporter + "/api/v2/dashboards/evolution/"
    // }else{
    //   urlReporter = reporter + "/api/v2/dashboards/"
    // }

    // urlReporter += agreementId + "?registry=" + registry;

    var url = ARGS.dashboardURL;
    Element.prototype.remove = function () {
        this.parentElement.removeChild(this);
    }
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
        for (var i = this.length - 1; i >= 0; i--) {
            if (this[i] && this[i].parentElement) {
                this[i].parentElement.removeChild(this[i]);
            }
        }
    }

    function setTableColors() {
        if (Array.from(document.getElementsByClassName("react-grid-item")).length > 1) {

            //Javascript part to create link in dashboard canvas to evidences
            var canvasList = document.getElementsByClassName("flot-overlay")
            var flag = 0
            var startingPos = []
            for (var i = 0; i < canvasList.length; i++) {
                var element = canvasList[i];
                element.addEventListener("mousedown", function (evt) {
                    startingPos = [evt.pageX, evt.pageY];
                    flag = 0;
                }, false);
                element.addEventListener("mousemove", function (evt) {
                    if (!(evt.pageX === startingPos[0] && evt.pageY === startingPos[1])) {
                        flag = 1;
                    }
                }, false);

                var mouseupFunction = function (ind) {
                    return function (evt) {
                        if (flag === 0) {
                            var timeSplit = document.getElementsByClassName("graph-tooltip")[0].innerText.split(" ")
                            var time = timeSplit[0] + " " + timeSplit[1]
                            var timestamp = new Date(time).getTime()
                            var guarantee = document.getElementsByClassName("panel-title-text")[ind].innerText.split("-")[0].trim();
                            var tpaid = document.getElementsByClassName("navbar-page-btn")[0].innerText.split(" ")[1]
                            var scope;
                            if (timeSplit.length > 3){
                                scope = '%7B"member":"*"%7D' 
                                                       }
                            else{
                                scope = '%7B"project":"*"%7D' 
                            }
                            var url = 'http://localhost:5000/v2/evidences/#!/scope/' + scope +'/?agreement=' + tpaid + '&guarantee=' + guarantee + '&period=' + timestamp + ' &tz=Europe%2FMadrid' + '&at=' + timestamp
                            window.open(url)
                        }
                        else if (flag === 1) {
                            //Drag event
                        }
                    }
                }
                mouseupFunction.bind(i)
                element.addEventListener("mouseup", mouseupFunction(i), false);

            }

            //End javascript code for evidences
            
            //Remove side bar
            document.getElementsByClassName("sidemenu")[0].remove()
            //End remove sidebar
            var secondEl = false;
            Array.from(document.getElementsByClassName("panel-header grid-drag-handle")).forEach(function (el) {
                if (secondEl) {
                    el.remove()
                }
                secondEl = !secondEl
            })

            var tableItem = false;
            var currentColor = true;
            Array.from(document.getElementsByClassName("react-grid-item")).forEach(function (x) {
                if (currentColor) {
                    x.style["background-color"] = "#040404"
                } else {
                    x.style["background-color"] = "#1F1F1F"

                }
                if (tableItem) {
                    currentColor = !currentColor
                }
                tableItem = !tableItem;

                Array.from(document.getElementsByClassName("drop-content")).forEach(function (dp) {
                    dp.style["max-width"] = "600px"
                })

            })
        } else {

            window.setTimeout(function () {
                setTableColors();
            }, 1000);
        }
    }

    $.ajax({
        method: 'GET',
        url: url
    })
        .done(function (dashboard) {
            window.setTimeout(function () {
                setTableColors();
            }, 5000);

            // Return dashboard
            callback(dashboard);
        })
        .fail(function ($xhr) {
            console.log($xhr.responseText)

            // Return dashboard
            callback($xhr.responseText);
        });
}
