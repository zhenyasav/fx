import { z } from "zod";
import { executeDirectoryTemplate } from "@nice/ts-template";
import { method, ResourceDefinition, Methods, Transform, effect } from "@fx/plugin";

export type TemplateResourceOptions<
  I extends z.ZodObject<z.ZodRawShape> = z.AnyZodObject
> = {
  name: string;
  description?: string;
  templateDirectory: string;
  input?: I;
  inputTransform?: Transform<z.infer<I>>;
  outputDirectory?: string | ((inputs: z.infer<I>) => string);
  methods?: Omit<Methods, "create">;
};

export const templateInput = z.object({
  outputDirectory: z.string().describe("directory where to place output"),
});

export type TemplateInput = z.infer<typeof templateInput>;

export function template<
  I extends z.ZodObject<z.ZodRawShape> = typeof templateInput
>(options: TemplateResourceOptions<I>): ResourceDefinition {
  const {
    name,
    input,
    inputTransform,
    description,
    templateDirectory,
    outputDirectory,
    methods,
  } = {
    ...options,
  };

  return {
    type: name,
    description,
    methods: {
      create: method<I>({
        inputShape: input ?? (templateInput as any),
        inputTransform,
        async body({ input, config, resource }) {
          const inputXform = (v: any) =>
            inputTransform ? inputTransform?.(v, { config, resource }) : v;
          const od =
            typeof outputDirectory == "string"
              ? outputDirectory
              : typeof outputDirectory == "function"
              ? outputDirectory(inputXform(input))
              : (input.outputDirectory as string);
          const files = await executeDirectoryTemplate({
            templateDirectory,
            input,
            outputDirectory: od,
          });
          return {
            files: files?.map((f) => {
              return effect({
                $effect: 'file',
                file: f
              })
            }),
          };
        },
      }),
      ...methods,
    },
  };
}
