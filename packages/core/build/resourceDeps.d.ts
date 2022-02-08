import { z } from "zod";
import inquirer from "inquirer";
import { LoadedConfig } from "./config";
export declare function generateResourceChoiceQuestions(config: LoadedConfig, shape: z.ZodTypeAny, key: string | number, merge?: Partial<inquirer.DistinctQuestion>): inquirer.DistinctQuestion[];
