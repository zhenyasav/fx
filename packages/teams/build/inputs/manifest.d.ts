import { z } from "zod";
export declare const manifestInput: z.ZodObject<{
    directory: z.ZodDefault<z.ZodString>;
    buildDirectory: z.ZodDefault<z.ZodString>;
    name: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    packageName: z.ZodString;
    developerName: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    buildDirectory: string;
    name: string;
    description: string;
    packageName: string;
    developerName: string;
}, {
    directory?: string | undefined;
    buildDirectory?: string | undefined;
    description?: string | undefined;
    developerName?: string | undefined;
    name: string;
    packageName: string;
}>;
export declare type ManifestInput = z.infer<typeof manifestInput>;
