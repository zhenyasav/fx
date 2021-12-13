import _ from "lodash";
import * as path from "path";
import { File } from "@nice/file";
import {
  executeFileTemplate,
  TemplateContext,
  TemplatingResult,
  isTemplate,
} from "./executeFileTemplate";
import readDir from "recursive-readdir";

export type DirectoryTemplateOptions = Omit<TemplateContext, "relativeTo">;

export async function executeDirectoryTemplate<TInput>(
  input: TemplateContext<TInput>
): Promise<TemplatingResult> {
  const { templatePath, outputDir } = input;
  const allFiles = await readDir(templatePath);
  const templateFiles = allFiles.filter(isTemplate);
  const regularFiles = allFiles.filter((file) => !isTemplate(file));
  const templateOutputs = await Promise.all(
    templateFiles?.map((t) =>
      executeFileTemplate({
        outputDir,
        input,
        templatePath: t,
        relativeTo: templatePath,
      })
    )
  );
  return [
    ...regularFiles?.map(
      (r) =>
        new File({
          path: path.join(outputDir, r.slice(templatePath.length)),
          sourcePath: r,
        })
    ),
    ..._.flatten(templateOutputs),
  ];
}
