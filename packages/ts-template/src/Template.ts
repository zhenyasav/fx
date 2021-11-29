import * as path from "path";
import { TemplateContext } from "./models.js";
import { File } from "./File.js";

export const TEMPLATE_REGEX = /(.*)\.t\.ts$/;

export function isTemplate(file: string): boolean {
  return TEMPLATE_REGEX.test(file);
}

export function getOutputNameFromTemplateName(s: string): string {
  const e = TEMPLATE_REGEX.exec(s);
  const out = e?.[1];
  return out ?? s;
}

export type TemplateOptions = {
  path: string;
  rootPath: string;
};

export type TemplateFunctionResult = string | File[];

export type TemplateFunction<I = {}> = (
  context: TemplateContext<I>
) => Promise<TemplateFunctionResult>;

export class Template<I = {}> {
  public options: TemplateOptions;
  constructor(options: TemplateOptions) {
    this.options = { ...options };
  }
  async generate(context: TemplateContext<I>): Promise<File[]> {
    const { path: templatePath, rootPath } = this.options;
    const { outputPath } = context;
    const templateFullPath = path.resolve(rootPath, templatePath);
    console.log('loading template', templateFullPath);
    const template = await import(templateFullPath);
    const templateFunction: TemplateFunction<I> =
      template?.["default"] ?? template;
    const result = await templateFunction(context);
    return typeof result == "string"
      ? [new File({
          content: result,
          path: path.resolve(
            outputPath,
            getOutputNameFromTemplateName(templatePath)
          ),
        })]
      : result;
  }
}
