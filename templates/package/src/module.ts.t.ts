// demonstration of a template that can emit multiple files
import * as path from "path";
import { TemplateFunction, File } from "@nice/fx";

const template: TemplateFunction<{ name: string }> = async ({
  input,
  outputDirectory,
}) => {
  return [
    new File({
      path: path.join(outputDirectory, "src/one.ts"),
      content: `// comment for file one in package ${input?.name}`,
    }),
    new File({
      path: path.join(outputDirectory, "src/two.ts"),
      content: `// comment for file two in package ${input?.name}`,
    }),
  ];
};

export default template;
