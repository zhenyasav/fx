import { File } from "@nice/file";
export declare namespace Effect {
    type WriteFile = {
        type: "write-file";
        file: File;
    };
    type Shell = {
        type: "shell";
        command: string;
        cwd?: string;
    };
    type PackageScript = {
        type: "package-script";
        name: string;
        args?: string[];
    };
    type Function = {
        type: "function";
        description?: string;
        body: () => any;
    };
    type Any = WriteFile | Function | Shell;
}
export declare type Effector<T extends {
    type: string;
} = Effect.Any> = {
    describe(e: T): string;
    apply(e: T): Promise<any>;
};
export declare type EffectorSet<TEffect extends {
    type: string;
} = Effect.Any> = {
    [T in TEffect["type"]]: Effector<Extract<TEffect, {
        type: T;
    }>>;
};
