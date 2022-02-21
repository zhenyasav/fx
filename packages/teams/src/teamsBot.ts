import path from "path";
import {
  ResourceReference,
  ResourceDefinition,
  method,
  effect,
  isResourceReference,
  z,
} from "@fx/plugin";
import { TeamsAppManifest, IBot } from "@fx/teams-dev-portal";
import { JSONFile } from "@fx/templates";
import {  } from "@fx/bots";

export function teamsBot(): ResourceDefinition {
  return {
    type: "teams-bot",
    description: "an Azure Bot Service bot connected to Teams",
    methods: {
      create: method({
        inputShape: z.object({
          manifest: z
            .literal("before:manifest")
            .describe("a Teams manifest file"),
          botService: z
            .literal("azure-bot-service")
            .describe("an Azure Bot Service"),
        }),
        body({ input, config }) {
          // find a reference to the manifest resource
          const manifestRef = input.manifest as any as ResourceReference;
          const manifestResource = config.getResource(manifestRef);
          if (!manifestResource)
            throw new Error(`resource ${manifestRef?.$resource} not found`);

          const file = new JSONFile<TeamsAppManifest>({
            path: [
              path.dirname(config.configFilePath),
              manifestResource.instance.inputs?.create?.directory!,
              "manifest.json",
            ],
            transform(existing) {
              // create the tab:
              // figure out the url:
              if (isResourceReference(input.botService)) {
                const botref = config.getResource(input.botService);

              }
              // const botService = ;
                // ? void 0
                // : input.url;

              const bot: IBot = {
                botId: "",
                scopes: ["team", "personal", "groupchat"],
              };

              existing.bots = existing.bots || [];
              existing.bots.push(bot);

              return existing;
            }
          });
          return {
            manifest: effect({
              $effect: "file",
              description: "add bot definition to manifest",
              file,
            }),
          };
        },
      }),
    },
  };
}
