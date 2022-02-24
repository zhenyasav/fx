import { Config, packageScripts } from "@fx/core";
import { packageTemplate } from "./templates/package/template.t";
import { aadAppRegistration } from "@fx/teams";

const config: Config = {
  resourceDefinitions: [
    packageTemplate(),
    packageScripts(),
    aadAppRegistration(),
  ],
  plugins: [],
};

export default config;
