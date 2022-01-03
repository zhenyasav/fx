import { z } from "zod";
import { executeDirectoryTemplate } from "@nice/ts-template";
import { method, Resource } from "@fx/plugin";

export type TemplateResourceOptions<
  I extends z.ZodObject<z.ZodRawShape> = z.AnyZodObject
> = {
  name: string;
  description?: string;
  templateDirectory: string;
  input?: I;
  outputDirectory?: string | ((inputs: z.infer<I>) => string);
};

export const templateInput = z.object({
  outputDirectory: z
    .string()
    .describe("directory where to place output"),
});

export type TemplateInput = z.infer<typeof templateInput>;

export function template<
  I extends z.ZodObject<z.ZodRawShape> = typeof templateInput
>(options: TemplateResourceOptions<I>): Resource {
  const { name, input, description, templateDirectory, outputDirectory } = {
    ...options,
  };
  return {
    name,
    description,
    methods: {
      create: method({
        inputShape: input ?? templateInput,
        async execute({ input }) {
          const od =
            typeof outputDirectory == "string"
              ? outputDirectory
              : typeof outputDirectory == "function"
              ? outputDirectory(input)
              : (input.outputDirectory as string);
          const files = await executeDirectoryTemplate({
            templateDirectory,
            input,
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
