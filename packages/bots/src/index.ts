import path from "path";
import { z } from "zod";
import {
  File,
  Plugin,
  ResourceDefinition,
  JSONFile,
  method,
  effect,
  isResourceReference,
} from "@fx/plugin";
import { CreateTunnelInput } from "@fx/tunnel";

export const botServiceInput = z.object({
  resourceGroup: z.string().describe("resource group"),
  bicepTemplateFolder: z.string().describe("folder where to place bicep files"),
  botServiceName: z.string().describe("azure bot service name"),
  botDisplayName: z.string().describe("bot display name"),
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

export type BotServiceTemplateParameters = {
  botServiceName: string;
  botEndpoint: string;
  botDisplayName: string;
};

export function botService(): ResourceDefinition<BotServiceInput> {
  return {
    type: "azure-bot-service",
    description: "an Azure Bot Service bot registration",
    methods: {
      create: method({
        inputShape: botServiceInput,
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
            params: new JSONFile<BotServiceTemplateParameters>({
              path: [destinationFolder, "bot-service-params.json"],
              content: {
                botServiceName,
                botDisplayName,
                botEndpoint:
                  typeof messagingEndpoint == "string" ? messagingEndpoint : "",
              },
            }),
            bicep: new File({
              path: [destinationFolder, "bot-service.bicep"],
              copyFrom: bicepTemplatePath,
            }),
          };
        },
      }),
      dev: method({
        body({ config, resource }) {
          const { resourceGroup, bicepTemplateFolder, messagingEndpoint } =
            resource.instance.inputs?.create ?? {};
          let url = null;
          if (isResourceReference(messagingEndpoint)) {
            const tunnel =
              config.getResource<CreateTunnelInput>(messagingEndpoint);
            const baseUrl = tunnel?.instance.outputs?.url;
            url = `${baseUrl}/messages/bot`
          }
          const cwd = process.cwd();
          const destinationFolder = path.resolve(cwd, bicepTemplateFolder!);
          const templateFile = path.resolve(
            bicepTemplateFolder!,
            "bot-service.bicep"
          );
          const command = `az deployment group create --resource-group ${resourceGroup} --template-file ${templateFile}`;
          return {
            params: effect({
              $effect: "file",
              file: new JSONFile({
                path: [],
              }),
            }),
            az: effect({
              $effect: "shell",
              command,
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
