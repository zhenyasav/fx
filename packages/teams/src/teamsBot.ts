import path from "path";
import {
  ResourceReference,
  ResourceDefinition,
  method,
  effect,
  isResourceReference,
  z,
  resourceId,
} from "@fx/plugin";
import { TeamsAppManifest, IBot } from "@fx/teams-dev-portal";
import { JSONFile } from "@fx/templates";
// import { BotServiceInput } from "@fx/bots";

export const teamsBotInput = z.object({
  manifest: z
    .literal("before:teams-manifest")
    .describe("a Teams manifest file"),
  botService: z.literal("azure-bot-service").describe("an Azure Bot Service"),
});

export type TeamsBotInput = z.infer<typeof teamsBotInput>;

export function teamsBot(): ResourceDefinition<TeamsBotInput> {
  return {
    type: "teams-bot",
    description: "an Azure Bot Service bot connected to Teams",
    methods: {
      create: method({
        inputShape: teamsBotInput,
        body({ input, config, resource }) {
          // find a reference to the manifest resource
          const manifestRef = input.manifest as any as ResourceReference;
          const manifestResource = config.getResource(manifestRef);
          if (!manifestResource)
            throw new Error(`resource ${manifestRef?.$resource} not found`);
          const p = [
            path.dirname(config.configFilePath),
            manifestResource.instance.inputs?.create?.directory!,
            "manifest.json",
          ];
          const file = new JSONFile<TeamsAppManifest>({
            path: p,
            transform(existing) {
              // create the tab:
              // figure out the url:
              if (!isResourceReference(input.botService)) {
                console.warn(
                  "bot manifest action: bot service reference not found"
                );
                return existing;
              }

              const bot: IBot = {
                botId: resourceId(resource.instance), // will do during dev
                scopes: ["team", "personal", "groupchat"],
                supportsFiles: false,
                isNotificationOnly: false,

                // commandLists ?
              };

              existing.bots = existing.bots || [];
              existing.bots.push(bot);

              return existing;
            },
          });
          return {
            manifest: effect({
              $effect: "file",
              description: "create bot entry in manifest.bots",
              file,
            }),
          };
        },
      }),
      dev: method({
        body({ resource, config }) {
          const manifestRef = resource.instance.inputs?.create
            ?.manifest as any as ResourceReference;
          const manifestResource = config.getResource(manifestRef);
          if (!manifestResource)
            throw new Error(`resource ${manifestRef?.$resource} not found`);
          const p = [
            path.dirname(config.configFilePath),
            manifestResource.instance.inputs?.create?.directory!,
            "manifest.json",
          ];
          return {
            manifest: effect({
              $effect: "file",
              description: "update botId from azure deploy in manifest",
              file: new JSONFile<TeamsAppManifest>({
                path: p,
                transform(existing) {
                  const botServiceRef =
                    resource.instance.inputs?.create?.botService;
                  if (!isResourceReference(botServiceRef)) {
                    console.warn("unable to find bot service reference");
                    return existing;
                  }
                  const botService = config.getResource(botServiceRef);
                  const azStdout =
                    botService?.instance?.outputs?.dev?.az?.stdout;
                  const azResult = JSON.parse(azStdout);
                  const { outputs } = azResult.properties;
                  console.log('bot service outputs', outputs);
                  const botId = outputs?.msaAppId?.value;

                  const bot = existing?.bots?.find((b) => {
                    return b.botId == resourceId(resource.instance);
                  }); // TODO: do this better
                  if (bot) {
                    bot.botId = botId;
                    console.log('amended teams manifest bot declaration:', bot);
                  }
                  return existing;
                },
              }),
            }),
          };
        },
      }),
    },
  };
}
