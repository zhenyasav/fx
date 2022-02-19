import { Config } from "@fx/core";
import { packageTemplate } from "./templates/package/template.t";
import { teams } from "@fx/teams";

const config: Config = {
  plugins: [teams()],
  resources: [packageTemplate()],
};

export default config;
