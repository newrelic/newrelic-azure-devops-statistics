[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# Azure Devops statistics to New Relic

Automatically capture build and release information from Azure DevOps into New Relic. The project uses an Azure Function, and a Servicebus to pipe the messages from Azure DevOps into New Relic.

## Installation

You can find the guide to install this in your own Azure environment here: [Installation guide](./INSTALLATION.md)

## Troubleshooting

### Error in logs `Unable to translate bytes [9A] at index 61 from specified code page to Unicode.`

This usually happens when `Send as non-serialized string` is not enabled on the Azure Devops Select Action screen.

![Serialize string](./screenshots/devops-select-action.png)

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
