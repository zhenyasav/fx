import inquirer from "inquirer";
import { z } from "zod";

export async function fulfillMissingInputs<TInput = any>(
  shape: z.ZodRawShape 
): Promise<Required<TInput>> {
  const formedQuestions: inquirer.Question[] = Object.keys(shape).map((key) => {
    const shapeVal = shape[key];
    const type = shapeVal._type;
    return {
      
    };
  });
  const answers = await inquirer.prompt(formedQuestions);
  return answers as any;
}
