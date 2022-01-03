import flatten from "lodash.flatten";
import * as path from "path";
import { File } from "@nice/file";
import {
  executeFileTemplate,
  TemplatingResult,
  isTemplateFile,
} from "./executeFileTemplate";
import readDir from "recursive-readdir";

export type ExecuteDirectoryTemplateOptions<TInput> = {
  templateDirectory: string;
  outputDirectory: string;
  input?: Partial<TInput>;
};

export async function executeDirectoryTemplate<TInput>(
  options: ExecuteDirectoryTemplateOptions<TInput>
): Promise<TemplatingResult> {
  const { templateDirectory, outputDirectory, input } = options;
  const allFiles = await readDir(templateDirectory);
  const templateFiles = allFiles.filter(isTemplateFile);
  const regularFiles = allFiles.filter((file) => !isTemplateFile(file));
  const templateOutputs = await Promise.all(
    templateFiles?.map((t) =>
      executeFileTemplate({
        templateFile: path.relative(templateDirectory, t),
        templateRelativeTo: templateDirectory,
        outputDirectory,
        input,
      })
    )
  );
  return [
    ...regularFiles?.map(
      (r) =>
        new File({
          path: path.join(outputDirectory, r.slice(templateDirectory.length)),
          copyFrom: r,
        })
    ),
    ...flatten(templateOutputs),
  ];
}
