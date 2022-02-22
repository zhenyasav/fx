param botServiceName string
param botEndpoint string
param botDisplayName string = botServiceName
param botServiceSku string = 'F0'

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: '${botServiceName}-msa'
  location: resourceGroup().location
}

resource botService 'Microsoft.BotService/botServices@2021-03-01' = {
  kind: 'azurebot'
  location: 'global'
  name: botServiceName
  properties: {
    displayName: botDisplayName
    endpoint: 'https://${botEndpoint}'
    msaAppId: managedIdentity.properties.clientId
  }
  sku: {
    name: botServiceSku // You can follow https://aka.ms/teamsfx-bicep-add-param-tutorial to add botServiceSku property to provisionParameters to override the default value "F0".
  }
}

resource botServiceMsTeamsChannel 'Microsoft.BotService/botServices/channels@2021-03-01' = {
  parent: botService
  location: 'global'
  name: 'MsTeamsChannel'
  properties: {
    channelName: 'MsTeamsChannel'
  }
}

output msaClientId string = managedIdentity.properties.clientId
output msaPrincipalId string = managedIdentity.properties.principalId
output msaTenantId string = managedIdentity.properties.tenantId
output msaAppId string = botService.properties.msaAppId
