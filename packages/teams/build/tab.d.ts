import { z } from "zod";
import { ResourceDefinition } from "@fx/plugin";
export declare const tabInput: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    manifest: z.ZodLiteral<"teams-manifest">;
    url: z.ZodUnion<[z.ZodDefault<z.ZodString>, z.ZodLiteral<"tunnel">]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    manifest: "teams-manifest";
    url: string;
}, {
    url?: string | undefined;
    id: string;
    name: string;
    manifest: "teams-manifest";
}>;
export declare type TabInput = z.infer<typeof tabInput>;
export declare function tab(): ResourceDefinition;
