// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// import { IBot, IComposeExtension, IConfigurableTab, IStaticTab } from "@microsoft/teamsfx-api";

export class Constants {
  public static readonly MANIFEST_FILE = "manifest.json";
  public static readonly PLUGIN_NAME = "AppStudioPlugin";
  public static readonly PUBLISH_PATH_QUESTION = "manifest-folder";
  public static readonly BUILD_OR_PUBLISH_QUESTION = "build-or-publish";
  public static readonly READ_MORE = "Read more";
  public static readonly LEARN_MORE = "Learn more";
  public static readonly ADMIN_PORTAL = "Admin portal";
  public static readonly PUBLISH_GUIDE = "https://aka.ms/teamsfx-publish";
  public static readonly TEAMS_ADMIN_PORTAL = "https://aka.ms/teamsfx-mtac";
  public static readonly TEAMS_MANAGE_APP_DOC =
    "https://aka.ms/teamsfx-mtac-doc";
  public static readonly TEAMS_APP_ID = "teamsAppId";
  public static readonly TEAMS_APP_UPDATED_AT = "teamsAppUpdatedAt";

  public static readonly PERMISSIONS = {
    name: "Teams App",
    noPermission: "No permission",
    admin: "Administrator",
    operative: "Operative",
    type: "M365",
  };

  public static readonly CORRELATION_ID = "X-Correlation-ID";
}

export class ErrorMessages {
  static readonly GetConfigError = (configName: string, plugin: string) =>
    `Failed to get configuration value "${configName}" for ${plugin}.`;
  static readonly ParseUserInfoError = "Failed to parse userInfo.";
  static readonly GrantPermissionFailed =
    "Response is empty or user is not added.";
  static readonly TeamsAppNotFound = (teamsAppId: string) =>
    `Cannot find Teams App with id: ${teamsAppId}. Maybe your current M365 account doesn't not have permission, or the Teams App has already been deleted.`;
}

/**
 * Config keys that are useful for generating remote teams app manifest
 */
export const REMOTE_MANIFEST = "manifest.source.json";
export const MANIFEST_TEMPLATE = "manifest.remote.template.json";
export const MANIFEST_LOCAL = "manifest.local.template.json";
export const FRONTEND_ENDPOINT = "endpoint";
export const FRONTEND_DOMAIN = "domain";
export const FRONTEND_INDEX_PATH = "indexPath";
export const BOT_ID = "botId";
export const LOCAL_BOT_ID = "localBotId";
export const COLOR_TEMPLATE = "plugins/resource/appstudio/defaultIcon.png";
export const OUTLINE_TEMPLATE = "plugins/resource/appstudio/defaultOutline.png";
export const DEFAULT_COLOR_PNG_FILENAME = "color.png";
export const DEFAULT_OUTLINE_PNG_FILENAME = "outline.png";
export const MANIFEST_RESOURCES = "resources";
export const APP_PACKAGE_FOLDER_FOR_MULTI_ENV = "templates/appPackage";
/**
 * Config Keys that are useful for remote collaboration
 */
export const SOLUTION = "solution";
export const SOLUTION_USERINFO = "userinfo";

export const TEAMS_APP_MANIFEST_TEMPLATE_V3 = `{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.11/MicrosoftTeams.schema.json",
  "manifestVersion": "1.11",
  "version": "1.0.0",
  "id": "{{state.fx-resource-appstudio.teamsAppId}}",
  "packageName": "com.microsoft.teams.extension",
  "developer": {
      "name": "Teams App, Inc.",
      "websiteUrl": "{{{state.fx-resource-frontend-hosting.endpoint}}}",
      "privacyUrl": "{{{state.fx-resource-frontend-hosting.endpoint}}}{{{state.fx-resource-frontend-hosting.indexPath}}}/privacy",
      "termsOfUseUrl": "{{{state.fx-resource-frontend-hosting.endpoint}}}{{{state.fx-resource-frontend-hosting.indexPath}}}/termsofuse"
  },
  "icons": {
      "color": "resources/color.png",
      "outline": "resources/outline.png"
  },
  "name": {
      "short": "{{config.manifest.appName.short}}",
      "full": "{{config.manifest.appName.full}}"
  },
  "description": {
      "short": "Short description of {{config.manifest.appName.short}}",
      "full": "Full description of {{config.manifest.appName.short}}"
  },
  "accentColor": "#FFFFFF",
  "bots": [],
  "composeExtensions": [],
  "configurableTabs": [],
  "staticTabs": [],
  "permissions": [
      "identity",
      "messageTeamMembers"
  ],
  "validDomains": []
}`;

export const TEAMS_APP_MANIFEST_TEMPLATE_FOR_MULTI_ENV = `{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.11/MicrosoftTeams.schema.json",
  "manifestVersion": "1.11",
  "version": "1.0.0",
  "id": "{{state.fx-resource-appstudio.teamsAppId}}",
  "packageName": "com.microsoft.teams.extension",
  "developer": {
      "name": "Teams App, Inc.",
      "websiteUrl": "{{{state.fx-resource-frontend-hosting.endpoint}}}",
      "privacyUrl": "{{{state.fx-resource-frontend-hosting.endpoint}}}{{{state.fx-resource-frontend-hosting.indexPath}}}/privacy",
      "termsOfUseUrl": "{{{state.fx-resource-frontend-hosting.endpoint}}}{{{state.fx-resource-frontend-hosting.indexPath}}}/termsofuse"
  },
  "icons": {
      "color": "resources/color.png",
      "outline": "resources/outline.png"
  },
  "name": {
      "short": "{{config.manifest.appName.short}}",
      "full": "{{config.manifest.appName.full}}"
  },
  "description": {
      "short": "Short description of {{config.manifest.appName.short}}",
      "full": "Full description of {{config.manifest.appName.short}}"
  },
  "accentColor": "#FFFFFF",
  "bots": [],
  "composeExtensions": [],
  "configurableTabs": [],
  "staticTabs": [],
  "permissions": [
      "identity",
      "messageTeamMembers"
  ],
  "validDomains": [],
  "webApplicationInfo": {
      "id": "{{state.fx-resource-aad-app-for-teams.clientId}}",
      "resource": "{{{state.fx-resource-aad-app-for-teams.applicationIdUris}}}"
  }
}`;

export const TEAMS_APP_MANIFEST_TEMPLATE_LOCAL_DEBUG_V3 = `{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.11/MicrosoftTeams.schema.json",
  "manifestVersion": "1.11",
  "version": "1.0.0",
  "id": "{{localSettings.teamsApp.teamsAppId}}",
  "packageName": "com.microsoft.teams.extension",
  "developer": {
      "name": "Teams App, Inc.",
      "websiteUrl": "{{{localSettings.frontend.tabEndpoint}}}",
      "privacyUrl": "{{{localSettings.frontend.tabEndpoint}}}{{{localSettings.frontend.tabIndexPath}}}/privacy",
      "termsOfUseUrl": "{{{localSettings.frontend.tabEndpoint}}}{{{localSettings.frontend.tabIndexPath}}}/termsofuse"
  },
  "icons": {
      "color": "resources/color.png",
      "outline": "resources/outline.png"
  },
  "name": {
      "short": "{appName}",
      "full": "{appName}"
  },
  "description": {
      "short": "Short description of {appName}",
      "full": "Full description of {appName}"
  },
  "accentColor": "#FFFFFF",
  "bots": [],
  "composeExtensions": [],
  "configurableTabs": [],
  "staticTabs": [],
  "permissions": [
      "identity",
      "messageTeamMembers"
  ],
  "validDomains": []
}`;

export const TEAMS_APP_MANIFEST_TEMPLATE_LOCAL_DEBUG = `{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.11/MicrosoftTeams.schema.json",
  "manifestVersion": "1.11",
  "version": "1.0.0",
  "id": "{{localSettings.teamsApp.teamsAppId}}",
  "packageName": "com.microsoft.teams.extension",
  "developer": {
      "name": "Teams App, Inc.",
      "websiteUrl": "{{{localSettings.frontend.tabEndpoint}}}",
      "privacyUrl": "{{{localSettings.frontend.tabEndpoint}}}{{{localSettings.frontend.tabIndexPath}}}/privacy",
      "termsOfUseUrl": "{{{localSettings.frontend.tabEndpoint}}}{{{localSettings.frontend.tabIndexPath}}}/termsofuse"
  },
  "icons": {
      "color": "resources/color.png",
      "outline": "resources/outline.png"
  },
  "name": {
      "short": "{appName}",
      "full": "{appName}"
  },
  "description": {
      "short": "Short description of {appName}",
      "full": "Full description of {appName}"
  },
  "accentColor": "#FFFFFF",
  "bots": [],
  "composeExtensions": [],
  "configurableTabs": [],
  "staticTabs": [],
  "permissions": [
      "identity",
      "messageTeamMembers"
  ],
  "validDomains": [],
  "webApplicationInfo": {
      "id": "{{localSettings.auth.clientId}}",
      "resource": "{{{localSettings.auth.applicationIdUris}}}"
  }
}`;

// export const STATIC_TABS_TPL_FOR_MULTI_ENV: IStaticTab[] = [
//   {
//     entityId: "index",
//     name: "Personal Tab",
//     contentUrl:
//       "{{{state.fx-resource-frontend-hosting.endpoint}}}{{{state.fx-resource-frontend-hosting.indexPath}}}/tab",
//     websiteUrl:
//       "{{{state.fx-resource-frontend-hosting.endpoint}}}{{{state.fx-resource-frontend-hosting.indexPath}}}/tab",
//     scopes: ["personal"],
//   },
// ];

// export const CONFIGURABLE_TABS_TPL_FOR_MULTI_ENV: IConfigurableTab[] = [
//   {
//     configurationUrl:
//       "{{{state.fx-resource-frontend-hosting.endpoint}}}{{{state.fx-resource-frontend-hosting.indexPath}}}/config",
//     canUpdateConfiguration: true,
//     scopes: ["team", "groupchat"],
//   },
// ];

// export const COMPOSE_EXTENSIONS_TPL_FOR_MULTI_ENV: IComposeExtension[] = [
//   {
//     botId: "{{state.fx-resource-bot.botId}}",
//     commands: [
//       {
//         id: "createCard",
//         context: ["compose"],
//         description: "Command to run action to create a Card from Compose Box",
//         title: "Create Card",
//         type: "action",
//         parameters: [
//           {
//             name: "title",
//             title: "Card title",
//             description: "Title for the card",
//             inputType: "text",
//           },
//           {
//             name: "subTitle",
//             title: "Subtitle",
//             description: "Subtitle for the card",
//             inputType: "text",
//           },
//           {
//             name: "text",
//             title: "Text",
//             description: "Text for the card",
//             inputType: "textarea",
//           },
//         ],
//       },
//       {
//         id: "shareMessage",
//         context: ["message"],
//         description: "Test command to run action on message context (message sharing)",
//         title: "Share Message",
//         type: "action",
//         parameters: [
//           {
//             name: "includeImage",
//             title: "Include Image",
//             description: "Include image in Hero Card",
//             inputType: "toggle",
//           },
//         ],
//       },
//       {
//         id: "searchQuery",
//         context: ["compose", "commandBox"],
//         description: "Test command to run query",
//         title: "Search",
//         type: "query",
//         parameters: [
//           {
//             name: "searchQuery",
//             title: "Search Query",
//             description: "Your search query",
//             inputType: "text",
//           },
//         ],
//       },
//     ],
//     messageHandlers: [
//       {
//         type: "link",
//         value: {
//           domains: ["*.botframework.com"],
//         },
//       },
//     ],
//   },
// ];
// export const BOTS_TPL_FOR_MULTI_ENV: IBot[] = [
//   {
//     botId: "{{state.fx-resource-bot.botId}}",
//     scopes: ["personal", "team", "groupchat"],
//     supportsFiles: false,
//     isNotificationOnly: false,
//     commandLists: [
//       {
//         scopes: ["personal", "team", "groupchat"],
//         commands: [
//           {
//             title: "welcome",
//             description: "Resend welcome card of this Bot",
//           },
//           {
//             title: "learn",
//             description: "Learn about Adaptive Card and Bot Command",
//           },
//         ],
//       },
//     ],
//   },
// ];

// export const STATIC_TABS_TPL_LOCAL_DEBUG: IStaticTab[] = [
//   {
//     entityId: "index",
//     name: "Personal Tab",
//     contentUrl:
//       "{{{localSettings.frontend.tabEndpoint}}}{{{localSettings.frontend.tabIndexPath}}}/tab",
//     websiteUrl:
//       "{{{localSettings.frontend.tabEndpoint}}}{{{localSettings.frontend.tabIndexPath}}}/tab",
//     scopes: ["personal"],
//   },
// ];

// export const CONFIGURABLE_TABS_TPL_LOCAL_DEBUG: IConfigurableTab[] = [
//   {
//     configurationUrl:
//       "{{{localSettings.frontend.tabEndpoint}}}{{{localSettings.frontend.tabIndexPath}}}/config",
//     canUpdateConfiguration: true,
//     scopes: ["team", "groupchat"],
//   },
// ];

// export const COMPOSE_EXTENSIONS_TPL_LOCAL_DEBUG: IComposeExtension[] = [
//   {
//     botId: "{{localSettings.bot.botId}}",
//     commands: [
//       {
//         id: "createCard",
//         context: ["compose"],
//         description: "Command to run action to create a Card from Compose Box",
//         title: "Create Card",
//         type: "action",
//         parameters: [
//           {
//             name: "title",
//             title: "Card title",
//             description: "Title for the card",
//             inputType: "text",
//           },
//           {
//             name: "subTitle",
//             title: "Subtitle",
//             description: "Subtitle for the card",
//             inputType: "text",
//           },
//           {
//             name: "text",
//             title: "Text",
//             description: "Text for the card",
//             inputType: "textarea",
//           },
//         ],
//       },
//       {
//         id: "shareMessage",
//         context: ["message"],
//         description: "Test command to run action on message context (message sharing)",
//         title: "Share Message",
//         type: "action",
//         parameters: [
//           {
//             name: "includeImage",
//             title: "Include Image",
//             description: "Include image in Hero Card",
//             inputType: "toggle",
//           },
//         ],
//       },
//       {
//         id: "searchQuery",
//         context: ["compose", "commandBox"],
//         description: "Test command to run query",
//         title: "Search",
//         type: "query",
//         parameters: [
//           {
//             name: "searchQuery",
//             title: "Search Query",
//             description: "Your search query",
//             inputType: "text",
//           },
//         ],
//       },
//     ],
//     messageHandlers: [
//       {
//         type: "link",
//         value: {
//           domains: ["*.botframework.com"],
//         },
//       },
//     ],
//   },
// ];
// export const BOTS_TPL_LOCAL_DEBUG: IBot[] = [
//   {
//     botId: "{{localSettings.bot.botId}}",
//     scopes: ["personal", "team", "groupchat"],
//     supportsFiles: false,
//     isNotificationOnly: false,
//     commandLists: [
//       {
//         scopes: ["personal", "team", "groupchat"],
//         commands: [
//           {
//             title: "welcome",
//             description: "Resend welcome card of this Bot",
//           },
//           {
//             title: "learn",
//             description: "Learn about Adaptive Card and Bot Command",
//           },
//         ],
//       },
//     ],
//   },
// ];

// Default values for the developer fields in manifest.
export const DEFAULT_DEVELOPER_WEBSITE_URL = "https://www.example.com";
export const DEFAULT_DEVELOPER_TERM_OF_USE_URL =
  "https://www.example.com/termofuse";
export const DEFAULT_DEVELOPER_PRIVACY_URL = "https://www.example.com/privacy";

export const TEAMS_APP_SHORT_NAME_MAX_LENGTH = 30;
export const STATIC_TABS_MAX_ITEMS = 16;
