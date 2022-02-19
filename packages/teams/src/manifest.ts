import path from "path";
import open from "open";
import { cyan } from "chalk";
import { promises as fs } from "fs";
import ogfs from "fs";
import sample from "./fixtures/manifest.json";
import { template } from "@fx/templates";
import { ManifestInput, manifestInput } from "./inputs/manifest";
import { effect, LoadedResource, method } from "@fx/plugin";
import {
  AppStudioLogin,
  AppStudioClient,
  teamsAppLaunchUrl,
} from "@fx/teams-dev-portal";
import jszip from "jszip";
import mkdirp from "mkdirp";

export type Manifest = typeof sample;

export function manifest() {
  return template({
    name: "teams-manifest",
    description: "Create a Teams manifest template and build scripts",
    templateDirectory: path.resolve(__dirname, "../templates/manifest"),
    input: manifestInput,
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
        implies: ['build'],
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
                const existing = await AppStudioClient.getApp(
                  manifest?.id,
                  token
                );
                if (!existing) {
                  const result = await AppStudioClient.createApp(zip, token);
                  console.log("created app:", result);
                  return { app: result };
                } else {
                  console.log("app exists", existing);
                  return { app: existing };
                }
              },
            }),
            browser: effect({
              $effect: "function",
              description: "open a browser window to your app",
              async body() {
                const res = resource as LoadedResource<ManifestInput>;
                const output = res.instance.outputs?.dev?.find(
                  (o: any) => !!o.app
                );
                if (!output) throw new Error("cannot find app registration");
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
