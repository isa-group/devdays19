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

/*
 * Put here your dependencies
 */
const http = require("http"); // Use https if your app will not be behind a proxy.
const path = require('path');
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const moment = require("moment");
const basicAuth = require('basic-auth');


const config = require("./configurations");
const logger = require("./logger");


const app = express();

if (config.server.enableHTTPBasicAuth) {
  logger.info("Adding 'WWW-Authenticate:' header to every path. Check config/env for getting user and pass");
  app.use((req, res, next) => {
    let credentials = basicAuth(req);
    if (!credentials || !check(credentials.name, credentials.pass)) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Snapshot Management Login"');
      res.end('Unauthorized');
    } else {
      next();
    }
  });
}

function check(name, pass) {
  let nameOK = process.env.user || config.auth.user;
  let passOK = process.env.password || config.auth.password;

  let valid = true;
  valid = name === nameOK && valid;
  valid = pass === passOK && valid;
  return valid;
}

const routes = require("./routes.js");

app.use(compression());

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: "true"
  })
);

app.use(
  bodyParser.json({
    limit: "50mb",
    type: "application/json"
  })
);

const frontendPath = __dirname + '/../frontend';
logger.info("Serving '%s' as static folder", frontendPath);
app.use(express.static(frontendPath));

if (config.server.bypassCORS) {
  logger.info("Adding 'Access-Control-Allow-Origin: *' header to every path.");
  app.use(cors());
}
if (config.server.useHelmet) {
  logger.info("Adding Helmet related headers.");
  app.use(helmet());
}

// Bypassing 405 status put by swagger when no request handler is defined
app.options("/*", (req, res, next) => {
  return res.sendStatus(200);
});

const serverPort = config.server.port;

app.listen(serverPort, () => {
  logger.info("Your server is listening on port %d (http://localhost:%d)", serverPort, serverPort);
});

// For all GET requests, send back index.html
app.use("/", routes);

app.use('/', express.static(__dirname + '/public'));