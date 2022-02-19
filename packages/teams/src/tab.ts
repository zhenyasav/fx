import path from "path";
import { z } from "zod";
import {
  method,
  effect,
  ResourceDefinition,
  ResourceReference,
  isResourceReference,
} from "@fx/plugin";
import { JSONFile } from "@fx/templates";
import { IStaticTab, TeamsAppManifest } from "@fx/teams-dev-portal";
import { CreateTunnelInput } from "@fx/tunnel";
import { ManifestInput } from "./inputs/manifest";
import { Manifest } from ".";

export const tabInput = z.object({
  manifest: z
    .literal("before:teams-manifest")
    .describe("specify teams manifest"),
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

export function tab(): ResourceDefinition<TabInput> {
  return {
    type: "teams-tab",
    description: "A Teams Tab",
    methods: {
      create: method({
        inputShape: tabInput,
        async body({ input, config }) {
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
              const contentUrl = isResourceReference(input.url)
                ? void 0
                : input.url;

              const tab: IStaticTab = {
                name: input.name,
                scopes: ["personal"],
                entityId: input.id,
                ...(contentUrl ? { contentUrl } : {}),
              };

              existing.staticTabs = existing.staticTabs || [];
              existing.staticTabs.push(tab);

              return existing;
            },
          });
          return {
            manifest: effect({
              $effect: "file",
              description: "add tab definition to manifest.staticTabs",
              file,
            }),
          };
        },
      }),
      dev: method({
        body({ resource, config }) {
          const url = resource.instance.inputs?.create?.url;
          const manifest = resource.instance.inputs?.create?.manifest;
          if (isResourceReference(url) && isResourceReference(manifest)) {
            const manifestResource =
              config.getResource<ManifestInput>(manifest);
            const dir =
              manifestResource?.instance.inputs?.create?.directory ?? "";
            return {
              contentUrl: effect({
                $effect: "file",
                description: "amend contentUrl from ngrok tunnel",
                file: new JSONFile<Manifest>({
                  path: [dir, "manifest.json"],
                  transform(manifestDoc) {
                    // get the tunnel referenced resource
                    const tunnel = config.getResource<CreateTunnelInput>(url);
                    // extract the url from it's last output
                    const tunnelUrl = tunnel?.instance.outputs?.dev?.url;
                    // get the identifier of this tab
                    const id = resource.instance.inputs?.create?.id;
                    // locate this tab in the manifest
                    const tab = manifestDoc.staticTabs.find(
                      (t) => t.entityId == id
                    );
                    // set the content url
                    if (tab) {
                      tab.contentUrl = tunnelUrl;
                    }
                    // return the manifest to write to disk
                    return manifestDoc;
                  },
                }),
              }),
            };
          }
        },
      }),
    },
  };
}
