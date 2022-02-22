import os from "os";
import path from "path";
import open from "open";
import { cyan } from "chalk";
import { promises as fs } from "fs";
import ogfs from "fs";
import sample from "./fixtures/manifest.json";
import { template } from "@fx/templates";
import { ManifestInput, manifestInput } from "./inputs/manifest";
import {
  effect,
  LoadedResource,
  method,
  displayNameToMachineName,
} from "@fx/plugin";
import {
  AppStudioLogin,
  AppStudioClient,
  teamsAppLaunchUrl,
} from "@fx/teams-dev-portal";
import jszip from "jszip";
import mkdirp from "mkdirp";
import { IAppDefinition } from "@fx/teams-dev-portal/build/interfaces/IAppDefinition";

export type Manifest = typeof sample;

export function manifest() {
  return template({
    name: "teams-manifest",
    description: "a Teams application manifest bundle",
    templateDirectory: path.resolve(__dirname, "../templates/manifest"),
    input: manifestInput,
    defaults(answers, { config }) {
      const name = path.basename(process.cwd());
      const username = os.userInfo().username;
      return {
        name,
        description: answers?.name ? answers.name : name,
        packageName: `com.${username}.${displayNameToMachineName(
          answers.name ?? name
        )}`,
        ...answers,
      };
    },
    inputTransform: (input, context) => {
      const {
        config: { configFilePath },
      } = context;
      const projectRoot = path.dirname(configFilePath);
      const cwd = process.cwd();
      const { directory, buildDirectory, ...rest } = input;
      const norm = (p: string) =>
        path.relative(projectRoot, path.resolve(cwd, p));
      return {
        directory: norm(directory),
        buildDirectory: norm(buildDirectory),
        ...rest,
      };
    },
    outputDirectory(input) {
      return input.directory;
    },
    methods: {
      test: method({
        body({ resource, config }) {
          return {
            errors: effect({
              $effect: "function",
              description: "validate Teams manifest with Teams Dev Portal",
              async body() {
                const res = resource as LoadedResource<ManifestInput>;
                const root = path.dirname(config.configFilePath);
                const fileName = path.join(
                  root,
                  res.instance.inputs?.create?.directory!,
                  "manifest.json"
                );
                const manifest = (await fs.readFile(fileName)).toString();
                const tokenProvider = AppStudioLogin.getInstance();
                const token = await tokenProvider.getAccessToken();
                if (!token) throw new Error("unable to get AppStudio token");
                console.log("validating manifest");
                const result: string[] = await AppStudioClient.validateManifest(
                  manifest,
                  token
                );
                console.log(
                  result?.length
                    ? "errors:\n" + JSON.stringify(result, null, 2)
                    : "manifest ok"
                );
                return result ?? [];
              },
            }),
          };
        },
      }),
      dev: method({
        implies: ["build"],
        body({ resource, config }) {
          return {
            devPortal: effect({
              $effect: "function",
              description: "send Teams app to Teams Dev Portal",
              async body() {
                const res = resource as LoadedResource<ManifestInput>;
                const root = path.dirname(config.configFilePath);
                const fileName = path.join(
                  root,
                  res.instance.inputs?.create?.buildDirectory!,
                  "teams-app.zip"
                );
                const zip = await fs.readFile(fileName);
                const rawmanifest = await fs.readFile(
                  path.join(
                    root,
                    res.instance.inputs?.create?.directory!,
                    "manifest.json"
                  )
                );
                const manifest: Manifest = JSON.parse(rawmanifest.toString());
                const tokenProvider = AppStudioLogin.getInstance();
                const token = await tokenProvider.getAccessToken();
                if (!token) throw new Error("unable to get AppStudio token");
                console.log("ensuring app with TDP...");
                let existing: IAppDefinition | undefined;
                try {
                  existing = await AppStudioClient.getApp(manifest?.id, token);
                } catch (err: any) {
                  if (!/404/.test(err.toString())) {
                    console.error("TDP error:", err.toString());
                    throw err;
                  }
                }
                if (!existing) {
                  const result = await AppStudioClient.createApp(zip, token);
                  const { appId, teamsAppId, appName } = result;
                  console.log("created app:", { appName, appId, teamsAppId });
                  return { app: result };
                } else {
                  const { appId, teamsAppId, appName } = existing;
                  console.log("app exists:", { appName, appId, teamsAppId });
                  const urls: string[] = [];
                  // TODO: this normally shouldn't happen here
                  // if the API to work with TDP was == manifest schema (is it?)
                  // there would be no need to translate these
                  manifest.staticTabs?.forEach((mant) => {
                    const tab = existing?.staticTabs?.find(
                      (t) => t.entityId == mant.entityId
                    );
                    if (tab) {
                      tab.contentUrl = mant.contentUrl;
                      urls.push(tab.contentUrl);
                    }
                  });
                  console.log("updating app with tab urls:", urls.join(", "));
                  await AppStudioClient.updateApp(teamsAppId!, existing, token);
                  return { app: existing };
                }
              },
            }),
            browser: effect({
              $effect: "function",
              description: "open a browser window to your app",
              async body() {
                const res = resource as LoadedResource<ManifestInput>;
                const output = res.instance.outputs?.dev?.devPortal;
                if (!output)
                  throw new Error(
                    "cannot find app registration from Teams Dev Portal"
                  );
                const launchUrl = teamsAppLaunchUrl(output.app);
                console.log("open:", cyan(launchUrl));
                await open(launchUrl, {
                  app: {
                    name: open.apps.chrome,
                  },
                });
                return launchUrl;
              },
            }),
          };
        },
      }),
      build: method({
        body({ resource, config }) {
          const res = resource as LoadedResource<ManifestInput>;
          return {
            output: effect({
              $effect: "function",
              description: "zip manifest bundle",
              async body() {
                const { directory, buildDirectory } = {
                  ...res.instance.inputs?.create,
                };
                const root = path.dirname(config.configFilePath);
                const abs = (v: string) => path.resolve(root, v);
                const zip = new jszip();

                const manifest = await fs.readFile(
                  path.join(abs(directory!), "manifest.json")
                );

                const color = await fs.readFile(
                  path.join(abs(directory!), "resources/color.png")
                );

                const outline = await fs.readFile(
                  path.join(abs(directory!), "resources/outline.png")
                );

                zip.file("manifest.json", manifest);
                const resources = zip.folder("resources");
                resources?.file("outline.png", outline);
                resources?.file("color.png", color);

                const outFile = path.join(
                  abs(buildDirectory!),
                  "teams-app.zip"
                );

                await new Promise(async (resolve, reject) => {
                  await mkdirp(abs(buildDirectory!));
                  const outStream = ogfs.createWriteStream(outFile);
                  zip
                    .generateNodeStream({
                      type: "nodebuffer",
                      streamFiles: true,
                    })
                    .pipe(outStream)
                    .on("error", (err) => reject(err))
                    .on("finish", () => resolve(void 0));
                });

                return outFile;
              },
            }),
          };
        },
      }),
    },
  });
}
