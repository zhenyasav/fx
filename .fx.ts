import { Config, packageScripts } from "@fx/core";
import { packageTemplate } from "./templates/package/template.t";
import { teams } from "@fx/teams";

const config: Config = {
  resourceDefinitions: [
    packageTemplate(),
    packageScripts(),
  ],
  plugins: [teams()],
};

export default config;
