import { TemplateFunction } from "@nice/fx";
import { Input } from "../src/input";

const template: TemplateFunction<Input> = async (context) => {
  const { input } = context;
  const { full } = input;
  console.log({ context });
  const required = {
    $schema:
      "https://developer.microsoft.com/json-schemas/teams/v1.11/MicrosoftTeams.schema.json",
    manifestVersion: "1.11",
    version: "1.0.0",
    id: "%APP_ID%",
    packageName: "com.example.myapp",
    developer: {
      name: "Publisher Name",
    },
    name: {
      short: "Name of your app (<=30 chars)",
      full: "Full name of app, if longer than 30 characters (<=100 chars)",
    },
    description: {
      short: "Short description of your app (<= 80 chars)",
      full: "Full description of your app (<= 4000 chars)",
    },
    icons: {
      outline: "A relative path to a transparent .png icon — 32px X 32px",
      color: "A relative path to a full color .png icon — 192px X 192px",
    },
  };

  const allfields = {
    ...required,
    localizationInfo: {
      defaultLanguageTag: "en-us",
      additionalLanguages: [
        {
          languageTag: "es-es",
          file: "en-us.json",
        },
      ],
    },
    developer: {
      name: "Publisher Name",
      websiteUrl: "https://website.com/",
      privacyUrl: "https://website.com/privacy",
      termsOfUseUrl: "https://website.com/app-tos",
      mpnId: "1234567890",
    },
    accentColor: "A valid HTML color code.",
    configurableTabs: [
      {
        configurationUrl: "https://contoso.com/teamstab/configure",
        scopes: ["team", "groupchat"],
        canUpdateConfiguration: true,
        context: [
          "channelTab",
          "privateChatTab",
          "meetingChatTab",
          "meetingDetailsTab",
          "meetingSidePanel",
          "meetingStage",
        ],
        sharePointPreviewImage:
          "Relative path to a tab preview image for use in SharePoint — 1024px X 768",
        supportedSharePointHosts: ["sharePointFullPage", "sharePointWebPart"],
      },
    ],
    staticTabs: [
      {
        entityId: "unique Id for the page entity",
        scopes: ["personal"],
        context: ["personalTab", "channelTab"],
        name: "Display name of tab",
        contentUrl: "https://contoso.com/content (displayed in Teams canvas)",
        websiteUrl: "https://contoso.com/content (displayed in web browser)",
        searchUrl: "https://contoso.com/content (displayed in web browser)",
      },
    ],
    bots: [
      {
        botId: "%MICROSOFT-APP-ID-REGISTERED-WITH-BOT-FRAMEWORK%",
        scopes: ["team", "personal", "groupchat"],
        needsChannelSelector: false,
        isNotificationOnly: false,
        supportsFiles: true,
        supportsCalling: false,
        supportsVideo: true,
        commandLists: [
          {
            scopes: ["team", "groupchat"],
            commands: [
              {
                title: "Command 1",
                description: "Description of Command 1",
              },
              {
                title: "Command 2",
                description: "Description of Command 2",
              },
            ],
          },
          {
            scopes: ["personal", "groupchat"],
            commands: [
              {
                title: "Personal command 1",
                description: "Description of Personal command 1",
              },
              {
                title: "Personal command N",
                description: "Description of Personal command N",
              },
            ],
          },
        ],
      },
    ],
    connectors: [
      {
        connectorId: "GUID-FROM-CONNECTOR-DEV-PORTAL%",
        scopes: ["team"],
        configurationUrl: "https://contoso.com/teamsconnector/configure",
      },
    ],
    composeExtensions: [
      {
        canUpdateConfiguration: true,
        botId: "%MICROSOFT-APP-ID-REGISTERED-WITH-BOT-FRAMEWORK%",
        commands: [
          {
            id: "exampleCmd1",
            title: "Example Command",
            type: "query",
            context: ["compose", "commandBox"],
            description: "Command Description; e.g., Search on the web",
            initialRun: true,
            fetchTask: false,
            parameters: [
              {
                name: "keyword",
                title: "Search keywords",
                inputType: "text",
                description: "Enter the keywords to search for",
                value: "Initial value for the parameter",
                choices: [
                  {
                    title: "Title of the choice",
                    value: "Value of the choice",
                  },
                ],
              },
            ],
          },
          {
            id: "exampleCmd2",
            title: "Example Command 2",
            type: "action",
            context: ["message"],
            description: "Command Description; e.g., Add a customer",
            initialRun: true,
            fetchTask: true,
            parameters: [
              {
                name: "custinfo",
                title: "Customer name",
                description: "Enter a customer name",
                inputType: "text",
              },
            ],
          },
          {
            id: "exampleCmd3",
            title: "Example Command 3",
            type: "action",
            context: ["compose", "commandBox", "message"],
            description: "Command Description; e.g., Add a customer",
            fetchTask: false,
            taskInfo: {
              title: "Initial dialog title",
              width: "Dialog width",
              height: "Dialog height",
              url: "Initial webview URL",
            },
          },
        ],
        messageHandlers: [
          {
            type: "link",
            value: {
              domains: ["mysite.someplace.com", "othersite.someplace.com"],
            },
          },
        ],
      },
    ],
    permissions: ["identity", "messageTeamMembers"],
    devicePermissions: [
      "geolocation",
      "media",
      "notifications",
      "midi",
      "openExternal",
    ],
    validDomains: [
      "contoso.com",
      "mysite.someplace.com",
      "othersite.someplace.com",
    ],
    webApplicationInfo: {
      id: "AAD App ID",
      resource: "Resource URL for acquiring auth token for SSO",
      applicationPermissions: [
        "TeamSettings.Read.Group",
        "ChannelSettings.Read.Group",
        "ChannelSettings.Edit.Group",
        "Channel.Create.Group",
        "Channel.Delete.Group",
        "ChannelMessage.Read.Group",
        "TeamsApp.Read.Group",
        "TeamsTab.Read.Group",
        "TeamsTab.Create.Group",
        "TeamsTab.Edit.Group",
        "TeamsTab.Delete.Group",
        "Member.Read.Group",
        "Owner.Read.Group",
        "Member.ReadWrite.Group",
        "Owner.ReadWrite.Group",
      ],
    },
    showLoadingIndicator: false,
    isFullScreen: false,
    activities: {
      activityTypes: [
        {
          type: "taskCreated",
          description: "Task created activity",
          templateText: "<team member> created task <taskId> for you",
        },
        {
          type: "userMention",
          description: "Personal mention activity",
          templateText: "<team member> mentioned you",
        },
      ],
    },
    defaultBlockUntilAdminAction: true,
    publisherDocsUrl: "https://website.com/app-info",
    defaultInstallScope: "meetings",
    defaultGroupCapability: {
      meetings: "tab",
      team: "bot",
      groupchat: "bot",
    },
    configurableProperties: [
      "name",
      "shortDescription",
      "longDescription",
      "smallImageUrl",
      "largeImageUrl",
      "accentColor",
      "developerUrl",
      "privacyUrl",
      "termsOfUseUrl",
    ],
    subscriptionOffer: {
      offerId: "publisherId.offerId",
    },
  };

  return JSON.stringify(full ? allfields : required, null, 2);
};

export default template;
