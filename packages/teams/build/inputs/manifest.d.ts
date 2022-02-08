import { z } from "zod";
export declare const manifestInput: z.ZodObject<{
    outputDir: z.ZodDefault<z.ZodString>;
    full: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    outputDir: string;
    full: boolean;
}, {
    outputDir?: string | undefined;
    full?: boolean | undefined;
}>;
export declare type ManifestInput = z.infer<typeof manifestInput>;
