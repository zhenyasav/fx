import { Effector, EffectorSet } from "@fx/plugin";
export declare type RunYo = {
    type: "yo";
    generator: string;
};
export declare const yo: Effector<RunYo>;
export declare const Handlers: EffectorSet<RunYo>;
