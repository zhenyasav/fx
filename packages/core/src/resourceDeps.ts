import { z } from "zod";
import inquirer from "inquirer";
import { resourceId, QuestionGenerator, ResourceReference } from "@fx/plugin";
import {
  LoadedConfiguration,
  LoadedResource,
  getResourceDependencies,
} from "@fx/plugin";

export function getResourceQuestionGenerator(
  config: LoadedConfiguration
): QuestionGenerator {
  return (shape, key) =>
    generateResourceChoiceQuestions(config, shape, key.toString());
}

export type Graph = {
  [id: string]: string[];
};

export function getDependencyGraph({
  resources,
  methodName
}: {
  resources: LoadedResource[];
  methodName: string;
}): {
  graph: Graph;
  independents: string[];
  errors: string[];
} {
  const graph: Graph = {};
  const independents: string[] = [];
  const errors: string[] = [];
  for (let resource of resources) {
    const { dependencies, errors: depErrs } = getResourceDependencies(
      resource,
      methodName
    );
    errors.push(...depErrs);
    const { instance } = resource;
    if (dependencies?.length) {
      const forward = dependencies
        .filter((d) => !d.before)
        .map((f) => f.$resource);
      const reverse = dependencies
        .filter((d) => d.before)
        .map((f) => f.$resource);
      const rid = resourceId(instance);
      if (forward.length) {
        graph[rid] = graph[rid] || [];
        graph[rid].push(...forward);
      }
      if (reverse.length) {
        reverse.forEach((rev) => {
          graph[rev] = graph[rev] || [];
          graph[rev].push(rid);
        });
      }
    } else independents.push(resourceId(instance));
  }
  return { graph, independents, errors };
}

export function parseReferenceLiteral(literalValue: string): ResourceReference {
  const bfx = /before:/;
  const isBefore = bfx.test(literalValue);
  return {
    $resource: isBefore ? literalValue.slice(7) : literalValue,
    ...(isBefore ? { before: true } : {}),
  };
}

export function generateResourceChoiceQuestions(
  config: LoadedConfiguration,
  shape: z.ZodTypeAny,
  key: string | number,
  merge?: Partial<inquirer.DistinctQuestion>
): inquirer.DistinctQuestion[] {
  const { defaultValue: dv, description, typeName } = shape._def;
  const question: inquirer.DistinctQuestion = {} as any;
  const result = [question];
  if (dv) {
    question.default = dv?.();
  }
  if (description) {
    question.message = description;
  }
  if (typeName) {
    if (typeName == "ZodNumber") {
      const q = question as inquirer.NumberQuestion;
      q.type = "number";
      q.name = key.toString();
    } else if (typeName == "ZodString") {
      const q = question as inquirer.InputQuestion;
      q.type = "input";
      q.name = key.toString();
    } else if (typeName == "ZodLiteral") {
      const q = question as inquirer.ListQuestion;
      const resourceRef = parseReferenceLiteral(shape._def.value);
      const resources = config.getResources();
      const applicableResources = resources.filter(
        (res) => res.instance.type == resourceRef.$resource
      );
      const applicableDefinitions = config
        .getResourceDefinitions()
        .filter((def) => def.type == resourceRef.$resource);
      const resourceChoices = applicableResources.map((res) => ({
        type: "choice" as "choice",
        name: resourceId(res.instance),
        value: {
          $resource: resourceId(res.instance),
          ...(resourceRef.before ? { before: true } : {}),
        },
      }));
      q.type = "list";
      q.name = key.toString();
      const choices = [
        ...resourceChoices,
        ...(applicableDefinitions?.length
          ? [
              {
                type: "choice" as "choice",
                name: `Create a new '${resourceRef.$resource}'`,
                value: resourceRef,
              },
            ]
          : []),
      ];
      q.choices = choices;
      q.default = 0;
    } else if (typeName == "ZodUnion") {
      const { options, description } = (shape as z.ZodUnion<any>)._def;
      const q = question as inquirer.ListQuestion;
      q.type = "list";
      q.name = `${key.toString()}-type`;
      q.message = description;
      const choices = options?.map((opt: z.ZodTypeAny) => {
        const { description, typeName } = opt._def;
        const choice: inquirer.ListChoiceOptions = {
          type: "choice",
          name: description,
          value:
            typeName == "ZodString"
              ? "string"
              : typeName == "ZodNumber"
              ? "number"
              : typeName == "ZodLiteral"
              ? parseReferenceLiteral(opt._def.value).$resource
              : description,
        };
        return choice;
      });
      q.choices = choices;
      q.default = 0;

      options?.map((opt: z.ZodTypeAny, i: number) => {
        const followupQuestions = generateResourceChoiceQuestions(
          config,
          opt,
          key
        );
        followupQuestions?.forEach(
          (fq) =>
            (fq.when = (hash) => {
              return hash[`${key}-type`] == choices[i].value;
            })
        );
        result.push(...followupQuestions);
      });
    }
  }
  return result;
}
