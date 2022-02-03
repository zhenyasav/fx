import { z } from "zod";
import { ResourceDefinition } from "@fx/plugin";
export declare type TemplateResourceOptions<I extends z.ZodObject<z.ZodRawShape> = z.AnyZodObject> = {
    name: string;
    description?: string;
    templateDirectory: string;
    input?: I;
    outputDirectory?: string | ((inputs: z.infer<I>) => string);
};
export declare const templateInput: z.ZodObject<{
    outputDirectory: z.ZodString;
}, "strip", z.ZodTypeAny, {
    outputDirectory: string;
}, {
    outputDirectory: string;
}>;
export declare type TemplateInput = z.infer<typeof templateInput>;
export declare function template<I extends z.ZodObject<z.ZodRawShape> = typeof templateInput>(options: TemplateResourceOptions<I>): ResourceDefinition;
