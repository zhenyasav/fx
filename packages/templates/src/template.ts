// import * as path from "path";
import { z } from "zod";
import { DirectoryTemplate } from "@nice/ts-template";
import { method, Resource } from "@fx/plugin";

export type TemplateResourceOptions<
  I extends z.ZodObject<z.ZodRawShape> = z.AnyZodObject
> = {
  name: string;
  description?: string;
  templateDir: string;
  outputDir?: string | ((inputs: z.infer<I>) => string);
  input?: I;
};

export const templateInput = z.object({
  outputDir: z.string().default(""),
});

export type TemplateInput = z.infer<typeof templateInput>;

export function template<
  I extends z.ZodObject<z.ZodRawShape> = typeof templateInput
>(options: TemplateResourceOptions<I>): Resource {
  const { name, input, templateDir, outputDir } = { ...options };
  return {
    name,
    methods: {
      create: method({
        input: input ?? templateInput,
        async execute({ input }) {
          const template = new DirectoryTemplate<typeof input>({
            path: templateDir,
          });
          const od =
            typeof outputDir == "string"
              ? outputDir
              : typeof outputDir == "function"
              ? outputDir(input)
              : (input.outputDir as string);
          const files = await template.generate({
            input: { ...input, outputDir: od },
            outputDirectory: od,
          });
          return {
            description: `create '${name}'`,
            effects: files?.map((file) => ({
              type: "write-file",
              file,
            })),
          };
        },
      }),
    },
  };
}
