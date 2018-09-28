# Azure Functions for IoT Hub devices

Azure Functions for getting IoT Hub device info and telemetry from Azure Time Series Insights environment.

## Prerequistes
- [Node 8.5.0 or better](https://nodejs.org/en/)

## How to run Azure Functions on localhost
1. To run Azure Functions locally you will the [Azure Functions Core Tools v2](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#v2) CLI installed.  
`func host start --debug VSCode`

2. Then **add the following environment variables** to your *local.settings.json* file. If your local settings are encrypted then be sure to add them using the CLI's `func settings add` command.
    ```
    func settings add "IOTHUB_CONNECTION_STRING" "HostName=*.azure-devices.net;SharedAccessKeyName=*;SharedAccessKey=*"
    func settings add "TSI_FQDN" "YOUR_TIME_SERIES_INSIGHTS_FQDN.env.timeseries.azure.com"
    func settings add "AD_APP_ID" "YOUR_ACTIVE_DIRECTORY_APP_ID"
    func settings add "AD_APP_KEY" "YOUR_ACTIVE_DIRECTORY_APP_KEY"
    func settings add "AD_TENANT_DOMAIN" "YOUR_TENTANT.onmicrosoft.com"
    ```

## API
These REST APIs are to help client side developers get IoT Hub device info and device telemetry from Time Series Insights. 

### GetDevices
Gets a list of devices from IoT Hub

| Param | Description | Default | 
| --- | --- | --- |
| pageSize | The desired no. of results per page | 100

### GetDevice
Gets the device details from IoT Hub using the device Id

| Param | Description | Default | 
| --- | --- | --- |
| **deviceId** | The device Id | *required*


### GetDeviceTelemetry
Gets telemetry of device from Time Series Insights using the device Id

| Param | Description | Default | 
| --- | --- | --- |
| **deviceId** | The device Id | *required*
| seconds | The number of seconds ago from now to search | 60
| count | No. of Results limit | 1000
| msFrom | Sample time from in MS | now - {seconds}
| msTo | Sample time to in MS | now

## Deployment
1. Fork this repo
2. Sign in to [Azure portal](https://portal.azure.com)
2. Create new **Azure Function**
    - Once your **Azure Function** is provisioned ensure your **Function app settings** is using **version 2**
3. Back in your **Azure Function** add the following environment variables using your connection details:
    - **IOTHUB_CONNECTION_STRING**
    - **TSI_FQDN**
    - **AD_APP_ID**
    - **AD_APP_KEY**
    - **AD_TENANT_DOMAIN**
4. To deploy your Function app select  
  **Platform Features > Deployment Options > Setup > GitHub**  
  and choose your forked repo.