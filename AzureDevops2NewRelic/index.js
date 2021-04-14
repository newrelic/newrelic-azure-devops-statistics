module.exports = async function(context, item) {
    context.log({
        action: 'Message received',
        enqueuedTimeUtc: context.bindingData.enqueuedTimeUtc,
        deliveryCount: context.bindingData.deliveryCount,
        messageId: context.bindingData.messageId,
        item: JSON.stringify(item)
    });

    switch(item.eventType) {
        case 'build.complete':
            let startTime = +(new Date(item.resource.startTime));
            let finishTime = +(new Date(item.resource.finishTime));
            sendToNewRelic({
                type: item.eventType,
                message: item.message.text,
                detailedMessage: item.detailedMessage.text,
                uri: item.resource.uri,
                url: item.resource.url,
                buildId: item.resource.id,
                startTime: startTime,
                finishTime: finishTime,
                duration: finishTime - startTime,
                reason: item.resource.reason,
                status: item.resource.status,
                definition: item.resource.definition.name,
                definitionUrl: item.resource.definition.url,
            });
        break;
        case 'ms.vss-release.release-created-event':
            sendToNewRelic({
                type: item.eventType,
                message: item.message.text,
                project: item.resource.project.name,
                projectId: item.resource.project.id,
                url: item.resource.url,
                detailedMessage: item.detailedMessage.text,
                releaseId: item.resource.release.id,
                releaseName: item.resource.release.name,
                releaseStatus: item.resource.release.status,
                modifiedBy: item.resource.release.modifiedBy.displayName,
                createdBy: item.resource.release.createdBy.displayName,
                releaseDefinitionId: 'releaseDefinition' in item.resource ? item.resource.releaseDefinition.id : '',
                releaseDefinitionName: 'releaseDefinition' in item.resource ? item.resource.releaseDefinition.name : '',
                releaseDefinitionUrl: 'releaseDefinition' in item.resource ? item.resource.releaseDefinition.url : '',
                releaseDefinitionRevision: 'releaseDefinition' in item.resource ? item.resource.releaseDefinitionRevision : '',
                reason: item.resource.reason,
            });
        break;
        case 'ms.vss-release.deployment-completed-event':
            sendToNewRelic({
                type: item.eventType,
                message: item.message.text,
                project: item.resource.project.name,
                projectId: item.resource.project.id,
                detailedMessage: item.detailedMessage.text,
                environmentId: item.resource.environment.id,
                environmentReleaseId: item.resource.environment.releaseId,
                environmentName: item.resource.environment.name,
                environmentStatus: item.resource.environment.status,
                environmentOwner: item.resource.environment.owner.displayName,
                releaseId: item.resource.environment.release.id,
                releaseName: item.resource.environment.release.name,
                releaseDefinitionId: item.resource.environment.releaseDefinition.id,
                releaseDefinitionName: item.resource.environment.releaseDefinition.name,
                releaseDefinitionUrl: item.resource.environment.releaseDefinition.url,
                releaseDefinitionRevision: item.resource.environment.releaseDefinitionRevision,
                releaseCreatedBy: item.resource.environment.releaseCreatedBy,
                triggerReason: item.resource.environment.triggerReason,
                timeToDeploy: item.resource.environment.timeToDeploy,
                timeToDeploySec: item.resource.environment.timeToDeploy * 60 // Convert from minutes to seconds for use in New Relic dashboards
            });
        break;
        default:
            context.log.error({
                'Message': 'Unknown eventType',
                'EventType': item.eventType,
            });
        break;
    }

    context.done();
};

function sendToNewRelic(data) {
    const fetch = require("node-fetch");
    // Add the eventType for New Relic and package as array
    data.eventType = 'AzureDevOps';
    let payload = [data]

    // Send event to New Relic
    let endpoint = 'https://insights-collector.newrelic.com/';
    if (process.env["NEWRELIC_DATACENTER"] == 'EU') {
        endpoint = 'https://insights-collector.eu01.nr-data.net/';
    }
    fetch(endpoint + 'v1/accounts/' + process.env["NEWRELIC_ACCOUNT_ID"] + '/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Insert-Key': process.env["NEWRELIC_INSERT_KEY"],
        },
        body: JSON.stringify(payload)
    });
}
