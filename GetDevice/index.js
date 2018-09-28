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

  const registry = iothub.Registry.fromConnectionString(IOTHUB_CONNECTION_STRING);
  registry.getTwin(deviceId, function(err, twin) {
    if (err) {
      console.error('Failed to fetch the results: ' + err.message);
      context.res = {
        body: 'Failed to fetch the results: ' + err.message,
        status: 500
      };
      context.done();
    } else {
      context.res = {
        body: twin,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      context.done();
    }
  });
};