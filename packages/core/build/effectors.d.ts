import { Effect, Effector } from "@fx/plugin";
export declare function getEffector<T extends Effect.Any = Effect.Any>(e: T): Effector<T>;
export declare function applyEffects(effects: Effect.Any[], caption: string): Promise<any[]>;
export declare function printEffects(effects: Effect.Any[], caption?: string): Promise<void>;
