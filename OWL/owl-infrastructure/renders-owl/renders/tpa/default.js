$scope.sco = "SCO_TRS";
$scope.allowModify = false;
$scope.guaranteeIndex = 0;
$scope.metricsName = ["SCO_K00", "SCO_K80", "SCO_K81", "SCO_K06_current_penalty"];
$scope.operators = ["==", "=>", "<=", ">", "<"];
$scope.intervalResults = {
    logCount: "-",
    logsStatus: "-",
    reporterStatus: "-"
};

// Urls
var getLogsUrl = () => $scope.model.context.infrastructure.logs;
var getReporterUrl = () => $scope.model.context.infrastructure.reporter;
var getRegistryUrl = () => $scope.model.context.infrastructure.registry;

/**
 * GET request for https URLs
 * @param url 
 * @param callback 
 */
var getUrl = (url, callback) => {
    if (!url.startsWith("https") && url.startsWith("http")) {
        url = url.replace("http", "https");
    }
    $.get(url, function (data) {
        if (callback) {
            callback(null, data);
        }
    }).fail(function (err) {
        console.error(err);
        if (callback) {
            callback(err);
        }
    });
};

/**
 * POST request for https URLs
 * @param url 
 * @param callback 
 */
var postUrl = (url, data, callback) => {
    if (!callback && data) {
        callback = data;
    }
    if (!url.startsWith("https") && url.startsWith("http")) {
        url = url.replace("http", "https");
    }

    var body = {
        url: url,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: (data) => {
            if (callback) {
                callback(null, data);
            }
        }
    };

    if (data) {

        var rawContent = JSON.stringify(data);
        if (rawContent) {
            body["data"] = rawContent
                .replace(/&amp;/g, "&")
                .replace(/&gt;/g, ">")
                .replace(/&lt;/g, "<")
                .replace(/&quot;/g, '"');
        }
    }

    $.ajax(body).fail(function (err) {
        console.error(err);
        if (callback) {
            callback(err);
        }
    });
};

/**
 * DELETE request for https URLs
 * @param url 
 * @param callback 
 */
var deleteUrl = (url, data, callback) => {
    if (!callback && data) {
        callback = data;
    }
    if (!url.startsWith("https") && url.startsWith("http")) {
        url = url.replace("http", "https");
    }
    $.ajax({
        url: url,
        type: "DELETE",
        success: (data) => {
            if (callback) {
                callback(null, data);
            }
        }
    }).fail(function (err) {
        console.error(err);
        if (callback) {
            callback(err);
        }
    });
};

// Log and reporter interval loop
/* if (getLogsUrl() || getReporterUrl()) {
    var startInterval = () => {
        // Manage inspector binding request
        if ($scope.loopInterval) {
            clearInterval($scope.loopInterval);
            $scope.loopInterval = null;
        }
        $scope.loopInterval = setInterval(function () {


            // Reporter
            if (getReporterUrl()) {
                getUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/ctrl/status", (err, data) => {
                    if (err) {
                        console.error(err);
                        $scope.intervalResults.reporterStatus = "-";
                    } else {
                        console.info("Reporter status", data.message);
                        let status = data.message === "Active" ? true : false;
                        $scope.intervalResults.reporterStatus = status;
                    }
                    // Update "reporterStatus" on template
                    $scope.$apply();
                });
            }

        }, 2000);
    };
    startInterval();
} */

var cache = {
    agreementAlreadyCreated: false
};


$scope.monitoring = {

    /**
     * Set registry for resume execution
     */
    _setUpRegistry: (callback) => {
        getUrl(getRegistryUrl() + "/agreements/" + $scope.model.id, (err, data) => {
            if (!data) {
                // There is no agreement
                postUrl(getRegistryUrl() + "/agreements", $scope.model, (err, data) => {
                    if (err) {
                        console.error(err);
                    } else {
                        cache.agreementAlreadyCreated = true;
                        callback(err, data);
                    }
                });
            } else {
                // Agreement is already created
                cache.agreementAlreadyCreated = true;
                callback(err, data);
            }
        });
    },
    logs: {
        start: () => postUrl(getLogsUrl() + "/ctrl/start", {
            refreshRate: $scope.model.context.definitions.logs.naos.config.refreshRate,
            bundleSize: $scope.model.context.definitions.logs.naos.config.bundleSize
        }),
        stop: () => postUrl(getLogsUrl() + "/ctrl/stop")
    },
    reporter: {
        start: () => {
            if (!cache.agreementAlreadyCreated) {
                $scope.monitoring._setUpRegistry((err, data) => postUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/ctrl/start"));
            } else {
                postUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/ctrl/start");
            }
        },
        stop: (callback) => postUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/ctrl/stop", callback),
        reset: (callback) => postUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/ctrl/reset", callback),
        resetAgreement: (callback) => postUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/ctrl/reset", callback),
        resetState: (callback) => postUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/ctrl/reset", callback),
        resetInflux: (callback) => deleteUrl(getRegistryUrl() + "/bills/" + $scope.model.id, callback),

    },
    registry: {
        delete: {
            agreements: (callback) => {
                cache.agreementAlreadyCreated = false;
                deleteUrl(getRegistryUrl() + "/agreements/" + $scope.model.id, callback);
            },
            states: (callback) => {
                cache.agreementAlreadyCreated = false;
                deleteUrl(getRegistryUrl() + "/states/" + $scope.model.id, callback);
            },
            overrides: (callback) => {
                cache.agreementAlreadyCreated = false;
                deleteUrl(getRegistryUrl() + "/states/" + $scope.model.id + "/overrides", callback);
            },
            bills: (callback) => {
                cache.agreementAlreadyCreated = false;
                deleteUrl(getRegistryUrl() + "/bills/" + $scope.model.id, callback);
            }
        },
        update: {
            agreement: (callback) => {
                deleteUrl(getRegistryUrl() + "/agreements/" + $scope.model.id, (err, data) => {
                    if (!err) { // Agreement deleted successfully => Create the new agreement
                        postUrl(getRegistryUrl() + "/agreements", $scope.model, (err, data) => {
                            if (err) {
                                console.error(err);
                                alert('There was an error while updating the TPA');
                            } else {
                                cache.agreementAlreadyCreated = true;
                                alert('The TPA was successfully updated');
                                callback(err, data);
                            }
                        });
                    }
                });

            }
        }
    },

    // /**
    //  * Resume logs
    //  */
    // resume: (callback) => {
    //     this._setUpRegistry(agreement => {
    //         getUrl(getLogsUrl() + "/start", (err) => {
    //             getUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/services", (err) => {
    //                 console.info("Logs and reporter initialized");
    //                 if (callback) {
    //                     callback();
    //                 }
    //             });
    //         });
    //     });
    // },
    // /**
    //  * Pause logs
    //  */
    // pause: (callback) => {
    //     getUrl(getLogsUrl() + "/stop", (err) => {
    //         getUrl(getReporterUrl() + "/stop", (err) => {
    //             console.info("Logs and reporter stopped")
    //             if (callback) {
    //                 callback();
    //             }
    //         });
    //     });
    // },

    /**
     * Reset reporter and logs
     */
    reset: () => {
        var r = confirm("Todo el estado del acuerdo será borrado (esta acción no puede deshacerse). ¿Está usted seguro?");
        if (r == true) {
            // Delete influx data metrics
            $scope.monitoring.reporter.reset((err, data) => {
                if (!err) {
                    // Delete agreement states in registry
                    $scope.monitoring.registry.delete.states((err) => {
                        if (!err) {
                            // Delete agreement in registry
                            $scope.monitoring.registry.delete.agreements((err) => {
                                if (!err) {
                                    console.log("Reset done");
                                } else {
                                    console.error(err);
                                }
                            });
                        } else {
                            console.error(err);
                        }
                    });
                } else {
                    console.error(err);
                }
            });
        } else {
            alert("Acción de reset cancelada");
        }
    }
};

var masks = {
    "SCO_K06_current_penalty": "SCO_K06_C"
};

var unmasks = {
    "SCO_K06_C": "SCO_K06_current_penalty"
};

$scope.setGuaranteeIndex = function (sco, guarantees) {
    if ($scope.isGuarantee()) {
        var i = $scope.guaranteeIndex;
        for (var gi = 0; gi < guarantees.length; gi++) {
            if (sco === guarantees[gi]["id"]) {
                $scope.guaranteeIndex = gi;
                break;
            }
        }
    } else {
        $scope.guaranteeIndex = -1;
    }
};

$scope.getPriority = function (obj) {
    var p = ('priority' in obj) ? obj.priority : '';
    return p;
};

$scope.getPriorityTextFromScope = function (obj) {
    var p = ('priority' in obj) ? obj.priority : '';
    var ret = '';

    if (p !== '') {
        if (p === "P1") {
            ret += 'Prioridad Crítica';
        } else if (p === "P2") {
            ret += 'Prioridad Alta';
        } else if (p === "P3") {
            ret += 'Prioridad Normal';
        } else if (p === "P4") {
            ret += 'Prioridad Baja';
        }
    }

    return ret;
};

$scope.isGuarantee = function () {
    return $scope.metricsName.indexOf($scope.sco) === -1;
};

$scope.getMetricNameMask = function (metricName) {
    return (metricName in masks) ? masks[metricName] : metricName;
};

$scope.getMetricNameUnMask = function (metricName) {
    return (metricName in unmasks) ? unmasks[metricName] : metricName;
};

$scope.updateSpuAndGuaranteeIndex = function (sco, guarantees) {
    $scope.sco = sco;
    $scope.setGuaranteeIndex(sco, guarantees);
};

$scope.getScheduleRef = (schRefObj) => {
    let ref = Object.values(schRefObj)[0];
    let index = ref.lastIndexOf('/');
    let scheduleName = ref.substring(index + 1);
    return scheduleName;
};

$scope.isScheduleCombined = (schedule) => {
    var combined = false;
    try {
        var dummy = JSON.parse(schedule);
        combined = true;
    } catch (err) {
        // nothing
    }
    return combined;
};

$scope.getScheduleNames = () => {
    return Object.keys($scope.model.context.definitions.computers.pivotaltracker.config.schedules);
};

$scope.updateScheduleRef = (gId, ofId, sco, name) => {
    let aux = $scope.model.terms.guarantees[gId].of[ofId].with[sco].schedule;
    let prev = aux["$ref"];
    let index = prev.lastIndexOf('/');
    aux["$ref"] = prev.substring(0, index) + "/" + name;
    delete $scope.model.terms.guarantees[gId].of[ofId].with[sco].schedule;
    setTimeout(function () {
        $scope.$apply();
        $scope.model.terms.guarantees[gId].of[ofId].with[sco].schedule = aux;
        // $scope.model.terms.guarantees[gId].of[ofId].with[sco].schedule["$ref"] = prev.substring(0, index) + "/" + name;
        setTimeout(function () {
            $scope.$apply();
        }, 150);
    }, 150);
};

setTimeout(function () {
    $("#mapCompensations").hide();
    $("#opGrouperContainer").hide();
}, 150);

//Get existing agreement from mongo
getUrl(
    getRegistryUrl() + "/agreements/" + $scope.model.id,
    (err, data) => {
        if (data) {
            console.info("Loaded agreement from mongo.")
            $scope.model = data;
        }
        else {
            console.info("No agreement found in mongo, loaded default.");
        }
        $scope.modelLoaded = true;
        $scope.$apply();
    }
);

$scope.urlReporterHttps = getReporterUrl();
if (!$scope.urlReporterHttps.startsWith("https") && $scope.urlReporterHttps.startsWith("http")) {
    $scope.urlReporterHttps = $scope.urlReporterHttps.replace("http", "https");
}

$scope.urlRegistryHttps = getRegistryUrl();
if (!$scope.urlRegistryHttps.startsWith("https") && $scope.urlRegistryHttps.startsWith("http")) {
    $scope.urlRegistryHttps = $scope.urlRegistryHttps.replace("http", "https");
}

$scope.isObject = function (element) {
    return typeof (element) === 'object';
}


setInterval(function () {
    getUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/createPointsFromList", (err, data) => {
        if (data) {
            $scope.fullSt = Math.floor(data["current"] / data["total"] * 100)
            document.getElementById("progressFullStory").style.width = $scope.fullSt + "%"

        }
        else {
            $scope.fullSt = false;
        }
        $scope.$apply();
    })

}, 3000)
