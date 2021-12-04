import * as path from "path";
import _ from "lodash";
import { File } from "@nice/file";
import { TemplateContext } from "./models.js";
import { Template, TemplateOptions, isTemplate } from "./Template.js";
import readDir from "recursive-readdir";

export type DirectoryTemplateOptions = Omit<TemplateOptions, "rootPath">;

export class DirectoryTemplate<I = {}> extends Template<I> {
  constructor(opts: DirectoryTemplateOptions) {
    super({ ...opts, rootPath: opts.path });
  }
  async generate(context: TemplateContext<I>): Promise<File[]> {
    const { path: templatePath } = this.options;
    const { outputDirectory: outputPath } = context;
    const allFiles = await readDir(templatePath);

    const templateFiles = allFiles.filter(isTemplate);
    const regularFiles = allFiles.filter((file) => !isTemplate(file));

    const templateOutputs = await Promise.all(
      templateFiles?.map((t) =>
        new Template({
          path: t,
          rootPath: templatePath,
        }).generate(context)
      )
    );

    return [
      ...regularFiles?.map(
        (r) =>
          new File({
            path: path.join(outputPath, r.slice(templatePath.length)),
            sourcePath: r
          })
      ),
      ..._.flatten(templateOutputs),
    ];
  }
}
