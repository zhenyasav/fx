import os from "os";
import path from "path";
import {
  Plugin,
  ResourceDefinition,
  effect,
  method,
  z,
  File,
} from "@fx/plugin";
import {
  AppStudioClient,
  AppStudioLogin,
  IAADDefinition,
} from "@fx/teams-dev-portal";

export const aadAppRegistrationInput = z.object({
  displayName: z.string().describe("enter the AAD application name"),
  dotEnvFile: z.string().describe("path to your dotenv file").default('.env'),
  dotEnvAppIdName: z
    .string()
    .describe("specify the .env variable to hold the AAD App ID")
    .default("MICROSOFT_APP_ID"),
  dotEnvAppSecretName: z
    .string()
    .describe("specify the .env variable to hold the AAD App Secret")
    .default("MICROSOFT_APP_PASSWORD"),
});

export type AADAppRegistrationInput = z.infer<typeof aadAppRegistrationInput>;

export function aadAppRegistration(): ResourceDefinition<AADAppRegistrationInput> {
  return {
    type: "aad-app",
    description: "AAD App Registration",
    methods: {
      create: method({
        inputShape: aadAppRegistrationInput,
        inputTransform({ dotEnvFile, ...rest }, { config }) {
          const absoluteEntered = path.join(process.cwd(), dotEnvFile);
          const relToProject = path.relative(
            path.dirname(config.configFilePath),
            absoluteEntered
          );
          return { dotEnvFile: relToProject, ...rest };
        },
      }),
      dev: method({
        implies: ["provision"],
      }),
      provision: method({
        body({ resource, config }) {
          const { dotEnvFile } = resource?.instance?.inputs?.create ?? {};
          const { displayName } = resource?.instance?.inputs?.create ?? {};
          const { aad } = resource?.instance?.outputs?.provision ?? {};
          const projectRoot = path.dirname(config.configFilePath);
          return !!aad?.app?.id
            ? { aad }
            : {
                aad: effect({
                  $effect: "function",
                  description: `ensure AAD app registration for app '${displayName}'`,
                  async body() {
                    const tokenProvider = AppStudioLogin.getInstance();
                    const token = await tokenProvider.getAccessToken();
                    if (!token)
                      throw new Error("unable to get AppStudio token");
                    const app: IAADDefinition = {
                      displayName,
                      signInAudience: "AzureADMultipleOrgs",
                    };
                    const result = await AppStudioClient.createAADAppV2(
                      token,
                      app
                    );
                    console.log("aad definition", result);
                    const objectId = result.id!;
                    const password = await AppStudioClient.createAADAppPassword(
                      token,
                      objectId
                    );
                    console.log({ password });
                    return {
                      app: result,
                      password,
                    };
                  },
                }),
                ...(dotEnvFile
                  ? {
                      env: effect({
                        $effect: "file",
                        description: `write AAD app values dotenv file`,
                        file: new File({
                          path: [projectRoot, dotEnvFile],
                          transform(existing: string | null) {
                            const updated = config.getResource(
                              resource.instance
                            );
                            const appId =
                              updated?.instance?.outputs?.provision?.aad?.app
                                ?.appId;
                            const appSecret =
                              updated?.instance?.outputs?.provision?.aad
                                ?.password?.value;
                            const { dotEnvAppIdName, dotEnvAppSecretName } =
                              resource.instance.inputs?.create ?? {};
                            const insertions = [
                              {
                                name: dotEnvAppIdName,
                                value: appId,
                              },
                              {
                                name: dotEnvAppSecretName,
                                value: appSecret,
                              },
                            ];
                            const lines = (existing ?? "").split(os.EOL);
                            for (let insertion of insertions) {
                              if (insertion.name && insertion.value) {
                                const existingLineIndex = lines?.findIndex(
                                  (line) => line.includes(insertion.name!)
                                );
                                const outputLine = `${insertion.name}=${insertion.value}`;
                                if (existingLineIndex >= 0) {
                                  lines.splice(
                                    existingLineIndex,
                                    1,
                                    outputLine
                                  );
                                } else {
                                  lines.push(outputLine);
                                }
                              }
                            }
                            return lines.join(os.EOL);
                          },
                        }),
                      }),
                    }
                  : {}),
              };
        },
      }),
    },
  };
}

export function aad(): Plugin {
  return {
    name: "Azure Active Directory",
    async resourceDefinitions() {
      return [aadAppRegistration()];
    },
  };
}
