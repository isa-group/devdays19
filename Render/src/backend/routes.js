/*!
governify-render 1.0.0, built on: 2018-05-09
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-render#readme

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

'use strict';

const express = require("express");
const http = require('http');
const app = express();
const router = express.Router();
const path = require('path');
const fs = require('fs');
const request = require('request');
const jsyaml = require('js-yaml')

const logger = require("./logger");

module.exports = router;

router.get('/', function (req, res) {
    var viewPath = '/index/view.html';
    var ctrlPath = '/index/controller.js';
    if (fs.existsSync('./src/frontend/index/model.json')) {
        var modelPath = '/index/model.json';
    } else if (fs.existsSync('./src/frontend/index/model.yaml')) {
        var modelPath = '/index/model.yaml';
    } else {
        logger.warning(modelPath + " don't exists, sending 404...");
        return res.sendStatus(404);
    }
    if (!fs.existsSync('./src/frontend' + viewPath)) {
        logger.warning(viewPath + " don't exists, sending 404...");
        return res.sendStatus(404);
    } else if (!fs.existsSync('./src/frontend' + ctrlPath)) {
        logger.warning(ctrlPath + " don't exists, sending 404...");
        return res.sendStatus(404);
    } else {
        logger.info("Redirecting to /render?model=" + modelPath + "&view=" + viewPath + "&ctrl=" + ctrlPath);
        res.redirect('/render?model=' + modelPath + '&view=' + viewPath + '&ctrl=' + ctrlPath);
    }
});

router.get('/dynamicModel', function (req, res) {
    var model = req.query.model;
    var yaml;
    if (model.includes('.yaml')) {
        yaml = '.yaml';
    } else {
        yaml = '.json';
    }
    var location;
    if (model.includes('/index')) {
        location = '/index';
    } else if (model.includes('/renders')) {
        location = '/renders';
    }
    switch (yaml) {
        case '.yaml':
            //model.yaml
            switch (location) {
                case '/renders':
                    //internal path renders
                    logger.info("Model extension: " + yaml + ", path: " + location);
                    var json = jsyaml.load(fs.readFileSync('./src/frontend/' + model, {
                        encoding: 'utf-8'
                    }));
                    res.send(json);
                    break;
                case '/index':
                    //internal path index
                    logger.info("Model extension: " + yaml + ", path: " + location);
                    var json = jsyaml.load(fs.readFileSync('./src/frontend/' + model, {
                        encoding: 'utf-8'
                    }));
                    res.send(json);
                    break;
                default:
                    //external path
                    logger.info("Model extension: " + yaml + ", path: " + location);

                    function getYaml(callback) {
                        request.get(model, function (err, response, body) {
                            callback(err, body);
                        });
                    }
                    getYaml(function (err, body) {
                        var json = jsyaml.safeLoad(body);
                        res.send(json);
                    });
                    break;
            }
            break;
        case '.json':
            //model.json
            switch (location) {
                case '/renders':
                    //internal path
                    logger.info("Model extension: " + yaml + ", path: " + location);
                    var json = fs.readFileSync('./src/frontend/' + model, {
                        encoding: 'utf-8'
                    });
                    res.send(json);
                    break;
                case '/index':
                    //internal path
                    logger.info("Model extension: " + yaml + ", path: " + location);
                    var json = fs.readFileSync('./src/frontend/' + model, {
                        encoding: 'utf-8'
                    });
                    res.send(json);
                    break;
                default:
                    //external path
                    logger.info("Model extension: " + yaml + ", path: " + location);

                    function getYaml(callback) {
                        request.get(model, function (err, response, body) {
                            callback(err, body);
                        });
                    }
                    getYaml(function (err, body) {
                        var json = body;
                        res.send(json);
                    });
                    break;
            }
            break;
    }
});

router.get("/render", function (req, res) {
    var ctrl = req.query.ctrl;
    var model = req.query.model;
    var view = req.query.view;

    if (!ctrl || !view || !model) {
        logger.warning("No params");
        res.sendStatus(404);
    } else {

        function getData(callback) {
            if ((model.includes('/renders') || model.includes('/index')) && !fs.existsSync('./src/frontend' + model)) {
                logger.warning(model + " don't exist, sending 404...");
                return res.sendStatus(404);
            } else if ((view.includes('/renders') || view.includes('/index')) && !fs.existsSync('./src/frontend' + view)) {
                logger.warning(view + " don't exist, sending 404...");
                return res.sendStatus(404);
            } else if ((ctrl.includes('/renders') || ctrl.includes('/index')) && !fs.existsSync('./src/frontend' + ctrl)) {
                logger.warning(ctrl + " don't exist, sending 404...");
                return res.sendStatus(404);
            } else if (ctrl.includes('/renders') || ctrl.includes('/index')) {
                //internal path
                logger.info("Checking /renders or /index");
                fs.readFile('./src/frontend' + ctrl, "utf8", (err, data) => {
                    callback(err, data);
                });
            } else {
                //external path
                logger.info("External path");
                request.get(ctrl, function (err, response, body) {
                    callback(err, body);
                });
            }
        }
        getData(function (err, body) {
            if (err || !body) {
                logger.warning("Error in getData: " + err);
                logger.warning("Error body in getData: " + body);
                res.sendStatus(404);
            } else if (!err && body) {
                logger.info("Displaying /render?model=" + model + "&view=" + view + "&ctrl=" + ctrl);
                res.send("<html ng-app='renderApp'>\n" +
                    "<head>\n" +
                    "<title>Renderizer</title>\n" +
                    "<link rel='shortcut icon' href='./utils/img/favicon.ico'>\n" +
                    "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' integrity='sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u' crossorigin='anonymous'>\n" +
                    "<script type='text/javascript' src='./utils/js/jquery/dist/jquery.min.js'></script>\n" +
                    "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js' integrity='sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa' crossorigin='anonymous'></script>\n" +
                    "<script type='text/javascript' src='./utils/js/angular/angular.js'></script>\n" +
                    "<script type='text/javascript' src='./utils/js/angular-route/angular-route.js'></script>\n" +
                    "<script type='text/javascript' src='./utils/js/angular-ui-router/release/angular-ui-router.js'></script>\n" +
                    "<script type='text/javascript' src='./utils/js/angular-route/angular-route.min.js'></script>\n" +
                    "<script type='text/javascript' src='./utils/js/angular-sanitize/angular-sanitize.min.js'></script>\n" +
                    "<script>\n" +
                    "document.addEventListener('DOMContentLoaded', function () {\n\r" +
                    "   console.log('preloader working');\n\r" +
                    "   setTimeout(function () {\n" +
                    "       $('#preloader').fadeOut();\n" +
                    "       $('.preloader_img').delay(500).fadeOut('slow');\n" +
                    "   }, 1000);\n" +
                    "});\n" +
                    "</script>\n" +
                    "<style>\n" +
                    ".preloader_img { position: fixed; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 9999; background-image: url(./utils/img/loading1_big_lgbg.gif); background-repeat: no-repeat; background-color: #fff; background-position: center; background-size: 40px 40px; }\n" +
                    "</style>\n" +
                    "</head>\n" +
                    "<body class='container' ng-controller='renderController'>\n\r" +
                    "<div id='preloader'>\n" +
                    "   <div class='preloader_img'></div>\n\r" +
                    "</div>\n\r" +
                    "<div id='my-element'></div>\n\r" +
                    "<script type='text/javascript'>" +
                    "'use strict';\n\r" +
                    "angular\n" +
                    "   .module('renderApp', [\n" +
                    "       'ui.router',\n" +
                    "       'ngSanitize'\n" +
                    "   ]);\n\r " +
                    "angular\n" +
                    "   .module('renderApp')\n" +
                    "   .config(['$sceDelegateProvider', function ($sceDelegateProvider) {\n\r" +
                    "       $sceDelegateProvider.resourceUrlWhitelist(['**']);\n\r" +
                    "       console.log('App Initialized');\n\r" +
                    "   }\n" +
                    "]);\n\r" +
                    "angular\n" +
                    "   .module('renderApp')\n" +
                    "       .directive('contenteditable', function () {\n\r" +
                    "           return {\n" +
                    "               require: 'ngModel',\n" +
                    "               link: function (scope, element, attrs, ctrl) {\n" +
                    "                   element.bind('blur', function () {\n" +
                    "                       scope.$apply(function () {\n" +
                    "                           ctrl.$setViewValue(element.html());\n" +
                    "                       });\n" +
                    "                   });\n\r" +
                    "                   ctrl.$render = function () {\n" +
                    "                       element.html(ctrl.$viewValue);\n" +
                    "                   };\n\r" +
                    "                   ctrl.$render();\n" +
                    "               }\n" +
                    "           };\n" +
                    "       });\n\r" +
                    "angular\n" +
                    "   .module('renderApp')\n" +
                    "       .controller('renderController', function($scope, $http, $state, $stateParams, $templateRequest, $sce, $compile, $q){\n\r" +
                    "           console.log('Render Controller Initialized');\n\r" +
                    "           var templateUrl = $sce.getTrustedResourceUrl('" + view + "');\n\r" +
                    "           $templateRequest(templateUrl).then(function (template) {\n" +
                    "               $compile($('#my-element').html(template).contents())($scope);\n" +
                    "           }, function () {\n\r" +
                    "           });\n\r" +
                    "           $http.get('/dynamicModel?model=" + model + "')\n" +
                    "               .then(data => {\n" +
                    "                   $scope.model = data.data;\n" +
                    body +
                    "\n\r" +
                    "                   });\n" +
                    "       });\n" +
                    "</script>\n" +
                    "</body>\n" +
                    "</html>");
            }
        });
    }
});