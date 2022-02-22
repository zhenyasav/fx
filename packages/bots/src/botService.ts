import path from "path";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import {
  File,
  Plugin,
  ResourceDefinition,
  JSONFile,
  method,
  effect,
  isResourceReference,
  resourceId,
  displayNameToMachineName,
  azureResourceGroupName,
  z,
} from "@fx/plugin";
import { CreateTunnelInput } from "@fx/tunnel";

const exec = promisify(execCallback);

export const botServiceInput = z.object({
  botDisplayName: z.string().describe("bot display name"),
  botServiceName: z.string().describe("azure bot service name"),
  subscriptionId: z.string().describe("azure subscription id"),
  resourceGroup: z.string().describe("resource group name"),
  bicepTemplateFolder: z
    .string()
    .describe("folder where to place bicep files")
    .default("./azure"),
  messagingEndpoint: z
    .union([
      z.string().describe("Enter a static URL"),
      z.literal("tunnel").describe("Dynamic URL from a tunneling service"),
    ])
    .describe("Enter your bot's messaging endpoint URL"),
});

export type BotServiceInput = z.infer<typeof botServiceInput>;

export type BotServiceOutput = {
  msaClientId: string;
  msaPrincipalId: string;
  msaTenantId: string;
};

export type BicepParameterFile<T extends object> = {
  $schema: "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#";
  contentVersion: "1.0.0.0";
  parameters: {
    [key in keyof T]: {
      value: T[key];
    };
  };
};

export type BotServiceParams = {
  botServiceName: string;
  botEndpoint: string;
  botDisplayName: string;
};

export const BOT_SERVICE_TEMPLATE_FILE = "bot-service.bicep";
export const BOT_SERVICE_PARAMS_FILE = "bot-service-parameters.json";

export function botService(): ResourceDefinition<BotServiceInput> {
  return {
    type: "azure-bot-service",
    description: "an Azure Bot Service bot registration",
    methods: {
      create: method({
        inputShape: botServiceInput,
        defaults(answers, { resource }) {
          const { instance } = resource;
          const { id } = instance;
          const rid = resourceId(instance);
          const { botDisplayName, botServiceName } = answers;
          const sensibleDefaults: Partial<BotServiceInput> = {
            botDisplayName: rid,
            botServiceName:
              botDisplayName && botServiceName != rid
                ? displayNameToMachineName(botDisplayName) +
                  (botDisplayName.includes(id) ? "" : `-${id}`)
                : rid,
            resourceGroup: azureResourceGroupName(
              botServiceName && botServiceName != rid
                ? displayNameToMachineName(botServiceName) +
                    (botServiceName.includes(id) ? "" : `-${id}`)
                : rid
            ),
            ...answers,
          };
          return sensibleDefaults;
        },
        body({ input }) {
          const {
            bicepTemplateFolder,
            botServiceName,
            botDisplayName,
            messagingEndpoint,
          } = input;
          const cwd = process.cwd();
          const bicepTemplatePath = path.resolve(
            __dirname,
            "../templates/azure/bot/bot-service.bicep"
          );
          const destinationFolder = path.resolve(cwd, bicepTemplateFolder);
          return {
            params: effect({
              $effect: "file",
              file: new JSONFile<BicepParameterFile<BotServiceParams>>({
                path: [destinationFolder, BOT_SERVICE_PARAMS_FILE],
                content: {
                  $schema:
                    "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
                  contentVersion: "1.0.0.0",
                  parameters: {
                    botDisplayName: {
                      value: botDisplayName,
                    },
                    botEndpoint: {
                      value:
                        typeof messagingEndpoint == "string"
                          ? messagingEndpoint
                          : "",
                    },
                    botServiceName: {
                      value: botServiceName,
                    },
                  },
                },
              }),
            }),
            bicep: effect({
              $effect: "file",
              file: new File({
                path: [destinationFolder, BOT_SERVICE_TEMPLATE_FILE],
                copyFrom: bicepTemplatePath,
              }),
            }),
          };
        },
      }),
      dev: method({
        body({ config, resource }) {
          const {
            resourceGroup,
            bicepTemplateFolder,
            messagingEndpoint,
            subscriptionId,
          } = resource.instance.inputs?.create ?? {};
          let urlIsDynamic: boolean = isResourceReference(messagingEndpoint);
          const cwd = process.cwd();
          const destinationFolder = path.resolve(cwd, bicepTemplateFolder!);
          const templateFile = path.resolve(
            bicepTemplateFolder!,
            BOT_SERVICE_TEMPLATE_FILE
          );
          const paramsFile = path.resolve(
            bicepTemplateFolder!,
            BOT_SERVICE_PARAMS_FILE
          );
          return {
            ...(urlIsDynamic
              ? {
                  params: effect({
                    $effect: "file",
                    description: "write bot parameters file",
                    file: new JSONFile<BicepParameterFile<BotServiceParams>>({
                      path: [destinationFolder, BOT_SERVICE_PARAMS_FILE],
                      transform(existing) {
                        let url: string | null = null;
                        if (isResourceReference(messagingEndpoint)) {
                          const tunnel =
                            config.getResource<CreateTunnelInput>(
                              messagingEndpoint
                            );
                          const baseUrl = tunnel?.instance.outputs?.dev?.url;
                          url = `${baseUrl}/api/messages`;
                        }
                        existing.parameters.botEndpoint.value = url!;
                        return existing;
                      },
                    }),
                  }),
                }
              : {}),
            rg: effect({
              $effect: "function",
              description: `ensure resource group ${resourceGroup} exists`,
              async body() {
                const { stdout, stderr } = await exec(
                  `az group exists --name ${resourceGroup}`
                );
                if (stdout.trim().toLocaleLowerCase().includes("false")) {
                  const result = await exec(
                    `az group create --name ${resourceGroup} --location westus --subscription ${subscriptionId}`
                  );
                  return { exists: { stdout, stderr }, create: result };
                } else {
                  return { exists: { stdout, stderr } };
                }
              },
            }),
            az: effect({
              $effect: "shell",
              command: `az deployment group create --resource-group ${resourceGroup} --template-file ${templateFile} --parameters ${paramsFile}`,
            }),
          };
        },
      }),
    },
  };
}

export function bots(): Plugin {
  return {
    name: "Azure Bot Service bots",
    resourceDefinitions() {
      return [botService()];
    },
  };
}
