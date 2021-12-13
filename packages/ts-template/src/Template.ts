import * as path from "path";
import { File } from "@nice/file";
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

async function loadTemplate<I = any>(p: string): Promise<TemplateFunction<I>> {
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

export type TemplateContext<TInput = void> = {
  templatePath: string;
  relativeTo?: string;
  outputDir: string;
  input?: TInput;
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

export async function template<TInput>(
  context: TemplateContext<TInput>
): Promise<TemplatingResult> {
  const { templatePath, relativeTo, outputDir } = context;
  const templateFullPath = relativeTo
    ? path.resolve(relativeTo, templatePath)
    : templatePath;
  const templateFunction = await loadTemplate(templateFullPath);
  if (!templateFunction) return [];
  try {
    const result = await templateFunction(context);
    return typeof result == "string"
      ? [
          new File({
            content: result,
            path: path.join(
              outputDir,
              relativeTo
                ? getOutputNameFromTemplateName(templatePath).slice(
                    relativeTo.length
                  )
                : getOutputNameFromTemplateName(templatePath)
            ),
          }),
        ]
      : result;
  } catch (err) {
    console.error(`problem in template ${templateFullPath}`);
    throw err;
  }
}
