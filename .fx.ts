import { Config } from "@fx/core";
import { teams } from "@fx/teams";
import { packageTemplate } from "./templates/package/template.t";

const config: Config = {
  plugins: [
    teams(),
    {
      name: "templates",
      resources() {
        return [
          packageTemplate(),
        ];
      },
    },
  ],
};

export default config;
