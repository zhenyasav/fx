import path from "path";
import { z } from "zod";
import {
  method,
  effect,
  ResourceDefinition,
  LoadedResource,
  ResourceReference,
  isResourceReference,
} from "@fx/plugin";
import { ManifestInput } from "./inputs/manifest";
import { JSONFile } from "@fx/templates";
import { IStaticTab, TeamsAppManifest } from "@fx/teams-dev-portal";

export const tabInput = z.object({
  manifest: z.literal("teams-manifest").describe("specify teams manifest"),
  id: z.string().describe("enter a new short machine identifier for the tab"),
  name: z.string().describe("enter the friendly tab name"),
  url: z
    .union([
      z.string().describe("enter the https url of the tab"),
      z.literal("tunnel").describe("use a tunnel resource"),
    ])
    .describe("identify the tab URL"),
});

export type TabInput = z.infer<typeof tabInput>;

export function tab(): ResourceDefinition {
  return {
    type: "teams-tab",
    description: "A Teams Tab",
    methods: {
      create: method({
        inputShape: tabInput,
        async body({ input, config }) {
          // const res = resource as LoadedResource<TabInput>;
          // find a reference to the manifest resource
          const manifestRef = input.manifest as any as ResourceReference;
          const manifestResource = config.getResource(
            manifestRef
          ) as LoadedResource<ManifestInput>;
          // load the existing manifest
          const file = new JSONFile<TeamsAppManifest>({
            path: [
              path.dirname(config.configFilePath),
              manifestResource.instance.inputs?.create?.directory!,
              "manifest.json",
            ],
          });
          await file.load();
          // create the tab:
          // figure out the url:
          const contentUrl = isResourceReference(input.url)
            ? void 0
            : input.url;

          const tab: IStaticTab = {
            name: input.name,
            scopes: ["personal"],
            entityId: input.id,
            ...(contentUrl ? { contentUrl } : {}),
          };
          // add the tab
          const manifest = file.parsed!;
          manifest.staticTabs = manifest?.staticTabs ?? [];
          manifest.staticTabs.push(tab as any);
          return {
            manifest: effect({
              $effect: "file",
              file,
            }),
          };
        },
      }),
    },
  };
}
