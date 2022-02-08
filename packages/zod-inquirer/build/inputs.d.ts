import { z } from "zod";
import inquirer from "inquirer";
export declare type InputSpec<T = {}> = {
    questions: inquirer.Question[];
    defaults: Partial<T>;
};
export declare function fulfillMissingInputs<I = any>(spec: InputSpec<I>): Promise<I>;
export declare function getQuestion(shape: z.ZodTypeAny): inquirer.Question;
export declare type QuestionGenerator<T = any> = (shape: T[keyof T], key: keyof T) => inquirer.Question;
export declare function getQuestions(shape: z.ZodRawShape, defaultGenerator?: QuestionGenerator<z.ZodRawShape>): {
    name: string;
    type?: string | undefined;
    message?: inquirer.AsyncDynamicQuestionProperty<string, inquirer.Answers> | undefined;
    default?: any;
    prefix?: string | undefined;
    suffix?: string | undefined;
    filter?(input: any, answers: inquirer.Answers): any;
    when?: inquirer.AsyncDynamicQuestionProperty<boolean, inquirer.Answers> | undefined;
    validate?(input: any, answers?: inquirer.Answers | undefined): string | boolean | Promise<string | boolean>;
}[];
export declare function inquire<T extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>>(shape: T, options?: {
    defaults?: Partial<z.infer<T>>;
    questionGenerator?: QuestionGenerator<z.infer<T>>;
}): Promise<z.infer<T>>;
