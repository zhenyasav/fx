import * as path from "path";
import _ from "lodash";
import { File } from "./File.js";
import { TemplateContext } from "./models.js";
import { Template, TemplateOptions, isTemplate } from "./Template.js";
import readDir from "recursive-readdir";

export type DirectoryTemplateOptions = Omit<TemplateOptions, 'rootPath'>;

export class DirectoryTemplate<I = {}> extends Template<I> {
  constructor(opts: DirectoryTemplateOptions) {
    super({...opts, rootPath: opts.path});
  }
  async generate(context: TemplateContext<I>): Promise<File[]> {
    const { path: templatePath } = this.options;
    const { outputPath } = context;
    const allFiles = await readDir(templatePath);
    const relativeFiles = allFiles?.map((file) =>
      file.slice(templatePath.length)
    );
    const templateFiles = relativeFiles.filter(isTemplate);
    const regularFiles = relativeFiles.filter((file) => !isTemplate(file));
    const templateOutputs = await Promise.all(
      templateFiles?.map((t) =>
        new Template({
          path: path.join(templatePath, t),
          rootPath: templatePath
        }).generate(context)
      )
    );
    return [
      ...regularFiles?.map(
        (r) =>
          new File({
            path: path.join(outputPath, r),
          })
      ),
      ..._.flatten(templateOutputs),
    ];
  }
}
