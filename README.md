[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# Azure Devops statistics to New Relic

Automatically capture build and release information from Azure DevOps into New Relic. The project uses an Azure Function, and a Servicebus to pipe the messages from Azure DevOps into New Relic.

## Installation

0) Install Requirements

* [Install Git](https://github.com/git-guides/install-git)
* NodeJS + NPM
    * [Windows & Linux](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
    * [Mac](https://nodejs.dev/learn/how-to-install-nodejs)
* [Install the Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
* [Install the Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=macos%2Ccsharp%2Cbash#install-the-azure-functions-core-tools)

1) Install the Azure CLI for your local operating system: [Install the Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

Make sure you are logged into the right Azure Subscription by running `az account show`

2) Decide if you want to use an existing resource group or create a new one to host this function and it's components.

If you want to create a new Resource Group, use the following command. Make sure to replace the location with the one closest to you.

`az group create --name newrelic-devops --location westeurope`

For the instructions we are going to use the Resource Group name `newrelic-devops` as an example. If you chose a different name, make sure to replace that in the future commands.

3) Create an Azure Service Bus Namespace for use with the New Relic DevOps Function

`az servicebus namespace create --resource-group newrelic-devops --name newrelicservicebus --location westeurope`

4) Create a Queue within our Azure Service Bus Namespace

`az servicebus queue create --resource-group newrelic-devops --namespace-name newrelicservicebus --name devopsqueue`

5) Create a primary connection string for the namespace. **Make sure to save this value, as we will use it in next steps.**

`az servicebus namespace authorization-rule keys list --resource-group newrelic-devops --namespace-name newrelicservicebus --name RootManageSharedAccessKey --query primaryConnectionString`

6) Set-up Azure DevOps Service Hook with the primary connection string.

Open your Azure Devops Web UI and click on `Project Settings` in the bottom left:

![Project settings](./screenshots/devops-project-settings.png)

In your Project settings, click on Service Hooks:

![Service hooks](./screenshots/devops-service-hooks.png)

In Service hooks, click on the green + button: ![+](./screenshots/devops-add-service-hook.png)

Choose the Service you want to connect to, in our case this is `Azure Service Bus` and click `Next`:

![Select service](./screenshots/devops-select-service.png)

In the Trigger screen, select the type of events you want to retrieve. New Relic currently supports `Build completed`, `Release created` and `Release deployment completed`. Click `Next`.

![Project settings](./screenshots/devops-select-trigger.png)

On the `Action` screen, change `Perform this action` to `Send a message to a Service Bus Queue`.

Also add your `primary connection string` from step 5 to the `SAS connection string` field without the `"`. When done succesfully you should be able to select the queue we created from the `Queue name` dropdown. Enable `Send as non-serialized string`. Leave everything else as is. Now click on `Test` to test the connection.

![Project settings](./screenshots/devops-select-action.png)

If everything is done succesfully, you should see this screen:

![Project settings](./screenshots/devops-success.png)

This means you have configured everything currectly. Please redo all these steps for any other event you want to configure, and for every project you want to monitor.

7) Optional: Check if Service Bus Queue has items:

`az servicebus queue show --resource-group newrelic-devops --namespace-name newrelicservicebus --name devopsqueue`

You should see `activeMessageCount` with a number above 0. If not, check your steps from above.

8) Create an Azure storage account for the Azure Function App

`az storage account create --name newrelicdevops1234 --location westeurope --resource-group newrelic-devops --sku Standard_LRS`

If you get a message that the storage account already exists, change the numbers after `--name newrelicdevops` to something else, for example `--name newrelicdevops5678`. Remember the name of your storage account as we will need it in the next step.

9) Configure Azure Function App

`az functionapp create --name newrelic-devops-functions --storage-account newrelicdevops1234 --consumption-plan-location westeurope --runtime node --resource-group newrelic-devops --functions-version 3`

10) Install Azure functions CLI

You can find the instructions on Microsoft docs: [Install the Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=macos%2Ccsharp%2Cbash#install-the-azure-functions-core-tools)

11) Set-up the environment

Please run the following commands, but don't forget to replace the `{{  }}` fields with your own values.

`az functionapp config appsettings set --name newrelic-devops-functions --resource-group newrelic-devops --settings "NEWRELIC_ACCOUNT_ID={{REPLACE_ME_WITH_NEWRELIC_ACCOUNT_ID}}"`

`az functionapp config appsettings set --name newrelic-devops-functions --resource-group newrelic-devops --settings "NEWRELIC_INSERT_KEY={{REPLACE_ME_WITH_NEWRELIC_INSERT_KEY}}"`

`az functionapp config appsettings set --name newrelic-devops-functions --resource-group newrelic-devops --settings "AzureWebJobsServiceBus={{REPLACE_ME_WITH_PRIMARY_CONNECTION_STRING}}"`

12) Deploy the Azure function

`func azure functionapp publish newrelic-devops-functions`

13) Done

## Getting Started

Once everything is set-up you should see data similar to below in your New Relic environment. You can now use this to create dashboards and set alerts on your Azure DevOps data.

```
{
    "buildId": 19,
    "definition": "zicht - CI",
    "definitionUrl": "https://samuelv.visualstudio.com/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/_apis/build/Definitions/1",
    "detailedMessage": "Build 20200810.7 failed\r\n\r\n- Bash exited with code '1'.\r\n",
    "duration": 37206,
    "finishTime": 1597051458614,
    "message": "Build 20200810.7 failed",
    "nr.customEventSource": "customEventInserter",
    "reason": "manual",
    "startTime": 1597051421408,
    "status": "failed",
    "timestamp": 1597051472807,
    "type": "build.complete",
    "uri": "vstfs:///Build/Build/19",
    "url": "https://samuelv.visualstudio.com/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/_apis/build/Builds/19"
},
{
    "detailedMessage": "Deployment of release Release-5 on stage dev rejected. Time to deploy: 00:00:30.",
    "environmentId": 5,
    "environmentName": "dev",
    "environmentOwner": "Samuel Vandamme",
    "environmentReleaseId": 5,
    "environmentStatus": "rejected",
    "message": "Deployment of release Release-5 on stage dev rejected.",
    "nr.customEventSource": "customEventInserter",
    "project": "zicht",
    "projectId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "releaseDefinitionId": 1,
    "releaseDefinitionName": "zicht - CD",
    "releaseDefinitionUrl": "https://samuelv.vsrm.visualstudio.com/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/_apis/Release/definitions/1",
    "releaseId": 5,
    "releaseName": "Release-5",
    "timeToDeploy": 0.5165666666666667,
    "timestamp": 1597051130868,
    "triggerReason": "ReleaseStarted",
    "type": "ms.vss-release.deployment-completed-event"
},
{
    "buildId": 18,
    "definition": "zicht - CI",
    "definitionUrl": "https://samuelv.visualstudio.com/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/_apis/build/Definitions/1",
    "detailedMessage": "Build 20200810.6 succeeded",
    "duration": 35819,
    "finishTime": 1597051085641,
    "message": "Build 20200810.6 succeeded",
    "nr.customEventSource": "customEventInserter",
    "reason": "manual",
    "startTime": 1597051049822,
    "status": "succeeded",
    "timestamp": 1597051099203,
    "type": "build.complete",
    "uri": "vstfs:///Build/Build/18",
    "url": "https://samuelv.visualstudio.com/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/_apis/build/Builds/18"
}
```

## Contributing
We encourage your contributions to improve Azure Devops statistics for New Relic! Keep in mind when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.
If you have any questions, or to execute our corporate CLA, required if your contribution is on behalf of a company,  please drop us an email at opensource@newrelic.com.

## License
Azure Devops statistics for New relic is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
