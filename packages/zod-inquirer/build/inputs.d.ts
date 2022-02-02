import inquirer from "inquirer";
import { z } from "zod";
export declare type InputSpec<T = {}> = {
    questions: inquirer.Question[];
    defaults: Partial<T>;
};
export declare function fulfillMissingInputs<I = any>(spec: InputSpec<I>): Promise<I>;
export declare function getQuestion(shape: z.ZodTypeAny): inquirer.Question;
export declare function getQuestions(shape: z.ZodRawShape): {
    name: string;
    type?: string | undefined;
    message?: string | Promise<string> | ((answers: inquirer.Answers) => string | Promise<string>) | undefined;
    default?: any;
    prefix?: string | undefined;
    suffix?: string | undefined;
    filter?(input: any, answers: inquirer.Answers): any;
    when?: boolean | Promise<boolean> | ((answers: inquirer.Answers) => boolean | Promise<boolean>) | undefined;
    validate?(input: any, answers?: inquirer.Answers | undefined): string | boolean | Promise<string | boolean>;
}[];
export declare function inquire<T extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>>(shape: T, defaults?: Partial<z.infer<T>>): Promise<z.infer<T>>;