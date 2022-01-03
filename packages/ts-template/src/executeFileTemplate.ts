import * as path from "path";
import { promises as fs } from "fs";
import * as esbuild from "esbuild";
import { File } from "@nice/file";

export const TEMPLATE_REGEX = /(.*)\.t\.ts$/;

export function isTemplateFile(file: string): boolean {
  return TEMPLATE_REGEX.test(file);
}

export function getOutputNameFromTemplateName(s: string): string {
  const e = TEMPLATE_REGEX.exec(s);
  const out = e?.[1];
  return out ?? s;
}

async function loadTemplate<I = any>(p: string): Promise<TemplateFunction<I>> {
  if (!isTemplateFile(p)) throw new Error("only t.ts templates are supported");
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

export type ExecuteFileTemplateOptions<TInput = {}> = {
  templateFile: string;
  templateRelativeTo?: string;
  outputDirectory: string;
  input?: TInput;
};

export type TemplateContext<TInput = {}> =
  ExecuteFileTemplateOptions<TInput> & {
    input: TInput;
    defaultOutputFile: string;
  };

export type TemplatingResult = File[];

export type TemplateFunctionResult = string | File[];

export type Functor<TInput = void, TOutput = void> = (
  input: TInput
) => Promise<TOutput>;

export type TemplateFunction<TInput = void> = Functor<
  TemplateContext<TInput>,
  TemplateFunctionResult
>;

export async function executeFileTemplate<TInput>(
  options: ExecuteFileTemplateOptions<TInput>
): Promise<TemplatingResult> {
  const {
    templateFile: templatePath,
    templateRelativeTo: templateRootDir,
    outputDirectory: outputRootDir,
  } = options;
  const templateFullPath = templateRootDir
    ? path.resolve(templateRootDir, templatePath)
    : templatePath;
  const templateFunction = await loadTemplate(templateFullPath);
  if (!templateFunction) return [];
  const nominalOutputPath = path.join(
    outputRootDir,
    templateRootDir
      ? getOutputNameFromTemplateName(templatePath).slice(
          templateRootDir.length
        )
      : getOutputNameFromTemplateName(templatePath)
  );
  try {
    const result = await templateFunction({
      input: {},
      ...options,
      defaultOutputFile: nominalOutputPath,
      ...(templateRootDir
        ? { templateRelativeTo: templateRootDir }
        : { templateRelativeTo: path.dirname(templateFullPath) }),
    });
    return typeof result == "string"
      ? [
          new File({
            content: result,
            path: nominalOutputPath,
          }),
        ]
      : result;
  } catch (err) {
    console.error(`problem in template ${templateFullPath}`);
    throw err;
  }
}
