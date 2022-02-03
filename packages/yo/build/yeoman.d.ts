import { ResourceDefinition } from "@fx/plugin";
import { z } from "zod";
export declare const yoInput: z.ZodObject<{
    generator: z.ZodString;
}, "strip", z.ZodTypeAny, {
    generator: string;
}, {
    generator: string;
}>;
export declare type YoInput = z.infer<typeof yoInput>;
export declare function yogenerator(): ResourceDefinition;
