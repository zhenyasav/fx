import { IAppDefinition } from "./interfaces/IAppDefinition";

export function teamsAppLaunchUrl(app: IAppDefinition) {
  const { appId, userList } = app;
  const user = userList?.[0]?.userPrincipalName ?? "";
  return `https://teams.microsoft.com/l/app/${appId}?installAppPackage=true&webjoin=true&login_hint=${user}`;
}
