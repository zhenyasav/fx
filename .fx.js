import path from "path";
import { fileURLToPath } from 'url';
import { templateResources } from "@fx/templates";
import { teams } from "@fx/teams";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: [
    teams(),
    templateResources({
      typeName: "package",
      description: "creates a new typescript package in ./packages/",
      templateDir: path.resolve(__dirname, "templates/package"),
      outputDir: path.resolve(__dirname, "packages")
    }),
  ],
};
