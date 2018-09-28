const request = require('request');
const { AuthenticationContext } = require('adal-node');

const { JsonSchemaFormat } = require("../shared/json-schema-format");

// Azure Active Directory Tentant Domain Name
const AD_TENANT_DOMAIN = process.env.AD_TENANT_DOMAIN; // "*.onmicrosoft.com"
// App ID and key of the application that's registered in Azure Active Directory 
const AD_APP_ID = process.env.AD_APP_ID;
const AD_APP_KEY = process.env.AD_APP_KEY;
// Time Series Insights Full Qualified Domain Name for data access 
const TSI_FQDN = process.env.TSI_FQDN; // "*.env.timeseries.azure.com"

module.exports = function(context, req) {
  // check for env vars
  if (!AD_TENANT_DOMAIN || !AD_APP_ID || !AD_APP_KEY || !TSI_FQDN) {
    context.res = {
      body: "Environment vars not set",
      status: 500
    };
    context.done();
    return;
  }
  // check for mandatory params
  if (!(req.query.deviceId || (req.body && req.body.deviceId))) {
    context.res = {
      body: "Please pass a 'deviceId' on the query string or in the request body",
      status: 400
    };
    context.done();
    return;
  }
  const deviceId = req.query.deviceId || req.body.deviceId;
  // optional params
  const seconds = req.query.seconds || (req.body && req.body.seconds) || 60;
  const count = req.query.count || (req.body && req.body.count) || 1000;
  const msFrom = req.query.msFrom || (req.body && req.body.msFrom) || Date.now() - (1000 * seconds);
  const msTo = req.query.msTo || (req.body && req.body.msTo) || Date.now();

  // Auth token
  const authorityUrl = `https://login.microsoftonline.com/${AD_TENANT_DOMAIN}`;
  const resource = "https://api.timeseries.azure.com/";

  var authenticationContext = new AuthenticationContext(authorityUrl);
  authenticationContext.acquireTokenWithClientCredentials(resource, AD_APP_ID, AD_APP_KEY, function(err, response) {
    if (err) {
      var error = err.message || "Bad Request";
      context.res = {
        body: error,
        status: 500
      };
      context.done();
      return;
    } else {
      getTelemetry(context, TSI_FQDN, response.accessToken, deviceId, msFrom, msTo, count);
    }
  });
};

const getTelemetry = function(context, fqdn, accessToken, deviceId, msFrom, msTo, count, apiVersion = "2016-12-12") {
  // Time Series Insights environment
  const uri = `https://${fqdn}/events?api-version=${apiVersion}`;
  const bearer = "Bearer " + accessToken;
  console.log("get telementry for deviceId:", deviceId, " from:", msFrom, "to:", msTo, " uri:", uri);
  // Matches deviceId
  const predicateObject = {
    "eq": {
      "left": {
        "property": "deviceId",
        "type": "String"
      },
      "right": deviceId
    }
  };
  const searchSpan = { from: new Date(msFrom).toISOString(), to: new Date(msTo).toISOString() };
  const topObject = { sort: [{ input: { builtInProperty: '$ts' }, order: 'Asc' }], count: count }; // $ts is timestamp
  const payload = { searchSpan: searchSpan, top: topObject, predicate: predicateObject };

  const options = {
    method: "POST",
    body: payload,
    json: true,
    headers: {
      "Authorization": bearer
    }
  };

  request(uri, options, (err, res, body) => {
    if (err) {
      var error = err || "Telemetry request error";
      console.log(error);
      context.res = {
        body: error,
        status: 500
      };
      context.done();
      return;
    }
    console.log("Telemetry request success status:", res.statusCode);
    var jsonSchemaFormat = JsonSchemaFormat("events[0].schema.properties", body, "events", "values", "", true, ["$ts"]);
    context.res = {
      body: jsonSchemaFormat,
      headers: {
        'Content-Type': 'application/json'
      },
      status: res.statusCode
    };
    context.done();
  });
};