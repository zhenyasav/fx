import { z } from "zod";
export declare const tabInput: z.ZodObject<{
    outputDir: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    outputDir: string;
}, {
    outputDir?: string | undefined;
}>;
export declare type TabInput = z.infer<typeof tabInput>;
