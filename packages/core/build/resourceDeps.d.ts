import { z } from "zod";
import inquirer from "inquirer";
import { QuestionGenerator } from "@fx/plugin";
import { LoadedConfig } from "./config";
export declare function getResourceQuestionGenerator(config: LoadedConfig): QuestionGenerator;
export declare function generateResourceChoiceQuestions(config: LoadedConfig, shape: z.ZodTypeAny, key: string | number, merge?: Partial<inquirer.DistinctQuestion>): inquirer.DistinctQuestion[];
