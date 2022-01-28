// this has to be a template file because otherwise typescript thinks
// the nested templates in this folder should look at this tsconfig.json
// as their project file
import { TemplateFunction, text } from "@fx/templates";
import { PackageInput } from "./template.t";
const template: TemplateFunction<PackageInput> = ({
  input,
}) => text/*javascript*/ `{
  "extends": "${
    input.flattenScope || !/@/.test(input.name) ? `../../` : `../../../`
  }tsconfig.json",
  "include": ["./src/**/*.ts"],
  "exclude": ["build", "node_modules"],
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build"
  }
}
`;
export default template;
