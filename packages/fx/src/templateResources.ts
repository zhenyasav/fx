import * as path from "path";
import { DirectoryTemplate } from "@nice/ts-template";
import { CreateResourceResult, Plugin, ResourceDefinition } from "./plugin.js";
import { fulfillWithQuestions } from "./util/inputs.js";
import { removeScope } from "./util/scope.js";
import { z } from "zod";

export const defaultInput = z.object({
  name: z.string().describe("name the new resource"),
  outputDir: z.string().describe(`specify output directory`).optional(),
});

export type DefaultInputSchema = typeof defaultInput;

export type DefaultInput = z.infer<typeof defaultInput>;

export type TemplateResourceOptions<
  I extends z.AnyZodObject = DefaultInputSchema
> = {
  typeName: string;
  templateDir: string;
  description?: string;
  outputDir?: string;
  flattenScopes?: boolean;
  input?: I;
};

export function templateResources<
  InputSchema extends z.AnyZodObject = DefaultInputSchema
>(...opts: TemplateResourceOptions<InputSchema>[]): Plugin {
  class C extends Plugin {
    async resourceDefinitions(): Promise<ResourceDefinition[]> {
      return opts.map((options) => {
        const {
          typeName,
          templateDir,
          description,
          flattenScopes,
          outputDir: od,
          input,
        } = {
          flattenScopes: true,
          ...options,
        };
        if (!typeName)
          throw new Error("a type name for the resource is required");
        if (!templateDir)
          throw new Error(
            "a template resource must have a path to the root folder of the template"
          );
        const inputSchema = input ?? defaultInput;
        type IType = z.infer<typeof inputSchema>;
        return {
          type: typeName,
          description,
          async create({ input }): Promise<CreateResourceResult<IType>> {
            const defaults: any = { outputDir: od, ...input };
            const template = new DirectoryTemplate<IType>({
              path: templateDir,
            });
            const fulfilled = await fulfillWithQuestions(inputSchema, defaults);
            const { outputDir, name } = fulfilled;
            const files = await template.generate({
              input: fulfilled as any,
              outputDirectory: path.resolve(
                outputDir,
                !!name ? (flattenScopes ? removeScope(name) : name) : ""
              ),
            });
            return {
              input: fulfilled as any,
              description: `${typeName}${name ? ` named '${name}'` : ""}`,
              effects: files?.map((file) => ({
                type: "write-file",
                file,
              })),
            };
          },
        };
      });
    }
  }
  return new C();
}
