import * as path from "path";
import { TemplateContext } from "./models.js";
import { File } from "./File.js";
import * as esbuild from "esbuild";
import { promises as fs } from "fs";

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

async function importTemplate<I = {}>(p: string): Promise<TemplateFunction<I>> {
  if (!isTemplate(p)) throw new Error("only t.ts templates are supported");
  const outpath = p.replace(/\.t\.ts$/, ".t.js");
  await esbuild.build({
    entryPoints: [p],
    outfile: outpath,
    target: "node16",
    platform: "node",
  });
  let mod;
  try {
    mod = await import(outpath);
  } finally {
    await fs.unlink(outpath);
  }
  const fn = mod?.["default"] ?? mod;
  return typeof fn == "function" ? fn : null;
}

export class Template<I = {}> {
  public options: TemplateOptions;
  constructor(options: TemplateOptions) {
    this.options = { ...options };
  }
  async generate(context: TemplateContext<I>): Promise<File[]> {
    const { path: templatePath, rootPath } = this.options;
    const { outputPath } = context;
    const templateFullPath = path.resolve(rootPath, templatePath);
    const templateFunction = await importTemplate(templateFullPath);
    if (!templateFunction) return [];
    try {
      const result = await templateFunction(context);
      return typeof result == "string"
        ? [
            new File({
              content: result,
              path: path.join(
                outputPath,
                getOutputNameFromTemplateName(templatePath).slice(
                  rootPath.length
                )
              ),
            }),
          ]
        : result;
    } catch (err) {
      console.error(`problem in template ${templateFullPath}`);
      throw err;
    }
  }
}
