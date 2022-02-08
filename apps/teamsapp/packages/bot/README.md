# How to use this Teams Bot HelloWorld app
Read about bots here (aka.ms/...)

This is a sample bot application demonstrating how to create commands and build adaptive cards that best for automation and notification scenario using `botbuilder` and `adaptivecards-templating`.

If you are looking for a sample that implements Single Sign On, see [here](https://github.com/OfficeDev/TeamsFx-Samples/tree/dev/bot-sso).

## Prerequisites

- [NodeJS](https://nodejs.org/en/)
- An M365 account. If you do not have M365 account, apply one from [M365 developer program](https://developer.microsoft.com/en-us/microsoft-365/dev-program)

Optional:
- [Teams Toolkit Visual Studio Code Extension](https://aka.ms/teams-toolkit) version after 1.55 or [TeamsFx CLI](https://aka.ms/teamsfx-cli)

## Run and Debug
This is a monorepo with individual projects located in `/packages`. 
- The bot is located in `/packages/bot`
```sh
cd ./packages/bot
npm run dev
# npm run dev:inspect to attach an inspector
```

### Using the vscode extension
- Start debugging the project by hitting the `F5` key in Visual Studio Code. 
- Alternatively use the `Run and Debug Activity Panel` in Visual Studio Code and click the `Run and Debug` green arrow button.


## Edit the manifest

You can find the Teams app manifest in `/templates/m365/manifest` folder. The folder contains two manifest files:
* `manifest.local.template.json`: Manifest file for Teams app running locally.
* `manifest.remote.template.json`: Manifest file for Teams app running remotely (After deployed to Azure).

Both files contain template arguments with `{...}` statements which will be replaced at build time. You may add any extra properties or permissions you require to this file. See the [schema reference](https://docs.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema) for more information.

## Deploy to Azure
Deploy your project to Azure by following these steps (after npm install):
```sh
# teamsfx account login azure
# teamsfx account set --subscription <your sub id> 
teamsfx provision
teamsfx deploy
```

### Using Visual Studio Code

- Open Teams Toolkit, and sign into Azure by clicking the `Sign in to Azure` under the `ACCOUNTS` section from sidebar.
- select a subscription under your account
- Open the command palette `[Ctrl/Cmd] + Shift + P` and select `Teams: Provision in the cloud`.
- Open the command palette and select `Teams: deploy`

> Note: Provisioning and deployment may incur charges to your Azure Subscription.

## Preview

Once the provisioning and deployment steps are finished, you can preview your app:

- From Visual Studio Code

  1. Open the `Run and Debug Activity Panel`.
  1. Select `Launch Remote (Edge)` or `Launch Remote (Chrome)` from the launch configuration drop-down.
  1. Press the Play (green arrow) button to launch your app - now running remotely from Azure.

- From TeamsFx CLI: execute `teamsfx preview --remote` in your project directory to launch your application.

## Validate manifest file

To check that your manifest file is valid:

- From Visual Studio Code: open the command palette and select: `Teams: Validate manifest file`.
- From TeamsFx CLI: run command `teamsfx validate` in your project directory.

## Package

- From Visual Studio Code: open the Teams Toolkit and click `Zip Teams metadata package` or open the command palette and select `Teams: Zip Teams metadata package`.
- Alternatively, from the command line run `teamsfx package` in the project directory.

## Publish to Teams

Once deployed, you may want to distribute your application to your organization's internal app store in Teams. Your app will be submitted for admin approval.

- From Visual Studio Code: open the Teams Toolkit and click `Publish to Teams` or open the command palette and select: `Teams: Publish to Teams`.
- From TeamsFx CLI: run command `teamsfx publish` in your project directory.

## Further reading

- [Bot Basics](https://docs.microsoft.com/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0)
- [Bot Framework Documentation](https://docs.botframework.com/)
- [Azure Bot Service Introduction](https://docs.microsoft.com/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
