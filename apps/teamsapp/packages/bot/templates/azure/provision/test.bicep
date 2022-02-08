resource storage1 'Microsoft.Storage/storageAccounts@2021-06-01' = {
  name: 'storagetest${uniqueString(resourceGroup().id)}'
  location: resourceGroup().location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}
