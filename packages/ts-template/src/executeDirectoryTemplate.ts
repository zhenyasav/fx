import _ from "lodash";
import * as path from "path";
import { File } from "@nice/file";
import {
  executeFileTemplate,
  TemplateContext,
  TemplatingResult,
  isTemplateFile,
} from "./executeFileTemplate.js";
import readDir from "recursive-readdir";

export type DirectoryTemplateOptions = Omit<TemplateContext, "relativeTo">;

export async function executeDirectoryTemplate<TInput>(
  context: TemplateContext<TInput>
): Promise<TemplatingResult> {
  const { templatePath, outputDir } = context;
  const allFiles = await readDir(templatePath);
  const templateFiles = allFiles.filter(isTemplateFile);
  const regularFiles = allFiles.filter((file) => !isTemplateFile(file));
  const templateOutputs = await Promise.all(
    templateFiles?.map((t) =>
      executeFileTemplate({
        templatePath: path.relative(t, templatePath),
        templateRootDir: templatePath,
        outputRootDir: outputDir,
        input: context,
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
