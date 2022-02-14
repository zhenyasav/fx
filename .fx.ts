import { Config, Plugin } from "@fx/core";
import { packageTemplate } from "./templates/package/template.t";
// import { teams } from "@fx/teams";

const localTemplates: Plugin = {
  name: "templates",
  resources() {
    return [packageTemplate()];
  },
};

const config: Config = {
  plugins: [localTemplates],
};

export default config;
