import { Config, packageScripts } from "@fx/core";
import { packageTemplate } from "./templates/package/template.t";

const config: Config = {
  resourceDefinitions: [packageTemplate(), packageScripts()],
  plugins: [],
};

export default config;
