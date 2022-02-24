import { ResourceDefinition, method, z, effect } from "@fx/plugin";
import { detect } from "detect-package-manager";

export const packageScriptsInput = z.object({
  packageManager: z.string().describe("specify your package manager"),
});

export type PackageScriptsInput = z.infer<typeof packageScriptsInput>;

export function packageScripts(): ResourceDefinition<PackageScriptsInput> {
  return {
    type: "package-scripts",
    description: "runs scripts in the npm package",
    methods: {
      create: method({
        inputShape: packageScriptsInput,
        async defaults(answers) {
          const pm = (await detect()) ?? "npm";
          return {
            packageManager: pm,
            ...answers,
          };
        },
      }),
      "*": method({
        body({ resource, methodName }) {
          const { packageManager } = resource.instance.inputs?.create ?? {};
          return {
            script: effect({
              $effect: "shell",
              description: `invoke script '${methodName}' using ${packageManager}`,
              command: `${packageManager} run ${methodName}`,
            }),
          };
        },
      }),
    },
  };
}
