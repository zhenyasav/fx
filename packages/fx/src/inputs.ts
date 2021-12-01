import inquirer from "inquirer";
// import { z } from "zod";

export type InputSpec<T = {}> = {
  questions: inquirer.Question[];
  defaults: Partial<T>;
}


export async function fulfillMissingInputs<I = any>(spec: InputSpec<I>) {
  return inquirer.prompt(spec.questions, spec.defaults) as Promise<I>;
}

// export async function fulfillMissingInputs<TInput = any>(
//   shape: z.ZodRawShape 
// ): Promise<Required<TInput>> {
//   const formedQuestions: inquirer.Question[] = Object.keys(shape).map((key) => {
//     const shapeVal = shape[key];
//     const type = shapeVal._type;
//     return {
      
//     };
//   });
//   const answers = await inquirer.prompt(formedQuestions);
//   return answers as any;
// }
