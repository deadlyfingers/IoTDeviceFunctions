// Some services do not return client friendly json results.
// For example arrays with mixed types means putting in extra work to parse on the client.
// If an array schema is provided then we can attempt to return these as key value pairs instead.

// ConvertJsonArrayToPropertiesUsingSchema
const JsonSchemaFormat = function(schemaPath, json, arrayPath, nestedValuesPath, outputArrayName = "", merge = false, copyProps = [], schemaKey = "name") {
  var schemaArray = GetPathValue(schemaPath, json);
  var results = JsonSchemaArrayFormat(schemaArray, json, arrayPath, nestedValuesPath, outputArrayName, merge, copyProps, schemaKey);
  return results;
}

// takes an input json and returns new json format using the schema array
const JsonSchemaArrayFormat = function(schemaArray, json, arrayPath, nestedValuesPath, outputArrayName = "", merge = false, copyProps = [], schemaKey = "name") {
  var arr = arrayPath ? GetPathValue(arrayPath, json) : json;
  if (!arr) return json;

  var keys = schemaArray.reduce((a, c) => {
    a.push(c[schemaKey]);
    return a;
  }, []);

  var outputArray = [];
  var values = [];
  var item, newItem, validProp;
  for (var i = 0; i < arr.length; i++) {
    item = arr[i];
    newItem = {};
    values = GetPathValue(nestedValuesPath, item);
    values.forEach((value, index) => {
      newItem[keys[index]] = value;
    });
    if (copyProps) {
      copyProps.forEach(prop => {
        validPropKey = ValidPropertyKey(prop);
        newItem[validPropKey] = item[prop];
      });
    }
    outputArray.push(newItem);
  }

  var output = outputArrayName ? {
    [outputArrayName]: outputArray
  } : outputArray;

  if (merge) {
    json[ValidPropertyKey(arrayPath)] = output;
    return json;
  }

  return output;
}

// returns value inside a nested object using path string
const GetPathValue = function(path, json) {
  var dotPath = path.replace(/\[([0-9])+\]/gm, '.$1'); // converts [0-9] array index into dot syntax for traversing json
  var components = dotPath.split('.');
  var value = json;
  var c;
  for (var i = 0; i < components.length; i++) {
    c = components[i];
    if (!value[c]) break;
    value = value[c]; // isNaN(c) ? value[c] : value[parseInt(c)];
  }
  return value;
}

// removes any $ prefixes or dashes etc... from a property key
const ValidPropertyKey = function(key) {
  return key.replace(/[^a-z_0-9]+/gmi, "");
}

module.exports = {
  JsonSchemaFormat,
  JsonSchemaArrayFormat,
  GetPathValue,
  ValidPropertyKey
}