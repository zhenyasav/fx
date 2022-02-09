import { z } from "zod";
import { ResourceDefinition, Methods, Transform } from "@fx/plugin";
export declare type TemplateResourceOptions<I extends z.ZodObject<z.ZodRawShape> = z.AnyZodObject> = {
    name: string;
    description?: string;
    templateDirectory: string;
    input?: I;
    inputTransform?: Transform<z.infer<I>>;
    outputDirectory?: string | ((inputs: z.infer<I>) => string);
    methods?: Omit<Methods, "create">;
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
