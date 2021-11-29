import path from "path";
import { fileURLToPath } from 'url';
import { templateResource } from "@nice/fx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: [
    templateResource({
      name: "package",
      description: "creates a new typescript package in ./packages/",
      templatePath: path.resolve(__dirname, "templates/package"),
      outputPath: path.resolve(__dirname, "packages")
    }),
  ],
};
