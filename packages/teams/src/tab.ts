import path from "path";
import { z } from "zod";
import {
  method,
  effect,
  ResourceDefinition,
  ResourceReference,
  isResourceReference,
  displayNameToMachineName,
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
  name: z.string().describe("enter the friendly tab name"),
  id: z.string().describe("enter a new short machine identifier for the tab"),
  hostname: z
    .union([
      z.literal("tunnel").describe("use hostname of a tunnel resource"),
      z.string().describe("enter the https hostname of the tab (without path)"),
    ])
    .describe("identify the tab hostname"),
  path: z
    .string()
    .describe("enter a url path for the tab (without the hostname):"),
});

export type TabInput = z.infer<typeof tabInput>;

export function tab(): ResourceDefinition<TabInput> {
  return {
    type: "teams-tab",
    description: "a Teams custom tab",
    methods: {
      create: method({
        inputShape: tabInput,
        defaults(answers) {
          return {
            id: answers?.name ? displayNameToMachineName(answers?.name) : "",
            ...answers,
          };
        },
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
              const contentUrl = isResourceReference(input.hostname)
                ? void 0
                : new URL(input.path, input.hostname).href;

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
          const hostname = resource.instance.inputs?.create?.hostname;
          const manifest = resource.instance.inputs?.create?.manifest;
          if (isResourceReference(hostname) && isResourceReference(manifest)) {
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
                    const tunnel =
                      config.getResource<CreateTunnelInput>(hostname);
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
                      const pname =
                        resource.instance.inputs?.create?.path ?? "";
                      tab.contentUrl = new URL(pname, tunnelUrl).href;
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
