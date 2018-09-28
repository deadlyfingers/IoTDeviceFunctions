const iothub = require('azure-iothub');
const IOTHUB_CONNECTION_STRING = process.env.IOTHUB_CONNECTION_STRING;

module.exports = function(context, req) {
  // check for env vars
  if (!IOTHUB_CONNECTION_STRING) {
    context.res = {
      body: "Environment vars not set",
      status: 500
    };
    context.done();
    return;
  }
  // optional params
  const pageSize = req.query.pageSize || (req.body && req.body.pageSize) || 100;

  const sqlQuery = "SELECT * FROM devices";
  const registry = iothub.Registry.fromConnectionString(IOTHUB_CONNECTION_STRING);
  const query = registry.createQuery(sqlQuery, pageSize);

  var devices = [];
  query.nextAsTwin(function(err, results) {
    if (err) {
      console.error('Failed to fetch the results: ' + err.message);
      context.res = {
        body: 'Failed to fetch the results: ' + err.message,
        status: 400
      };
      context.done();
    } else {
      devices = results.map(function(twin) {
        return {
          "deviceId": twin.deviceId,
          "status": twin.status
        }
      });
      context.res = {
        body: devices,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      context.done();
    }
  });
};