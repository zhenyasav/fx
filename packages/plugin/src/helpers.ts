export function azureResourceGroupName(s: string) {
  const clean = s.replace(/[^a-z0-9A-Z_\(\)\-\.]/g, "-");
  return clean;
}

export function displayNameToMachineName(s: string) {
  const clean = s.replace(/\s|[^a-zA-Z0-9]/g, "-").toLowerCase();
  return clean;
}