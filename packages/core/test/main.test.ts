import inquirer from "inquirer";
import { z } from "zod";
import path from "path";
import prettyjson from "prettyjson";
import { time, duration } from "../src/util/timer";

import { Fx, getQuestions, generateResourceChoiceQuestions } from "../src";
const fixtures = path.resolve(__dirname, "./fixtures");

describe("core", () => {
  it("exists", () => {
    expect(Fx).toBeDefined();
  });

  it("loads config", async () => {
    const fx = new Fx({
      cwd: fixtures,
    });

    const config = await fx.config();
    expect(config).toBeDefined();
  });

  it.only("loads config repeatedly", async () => {
    const fx = new Fx({
      cwd: fixtures,
    });
    const attempts = 4;
    for (let i = 0; i < attempts; i++) {
      const t = await time(() => fx.config());
      console.log(`attempt ${i}:`, duration(t));
    }
  });

  it("resource choice question for a literal", async () => {
    const shape = z.literal("foo").describe("foos needed");
    const fx = new Fx({
      cwd: fixtures,
    });
    const config = await fx.config();
    const [question] = generateResourceChoiceQuestions(config, shape, "bar");
    expect(question).toMatchObject({
      type: "list",
      choices: [
        {
          name: "foo:foo-1",
          type: "choice",
          value: { $resource: "foo:foo-1" },
        },
        {
          name: "foo:foo-2",
          type: "choice",
          value: { $resource: "foo:foo-2" },
        },
        {
          name: `Create a new 'foo'`,
          type: "choice",
          value: { $resource: "foo" },
        },
      ],
      default: 0,
    });
  });

  it("resource choice question for a union", async () => {
    const shape = z
      .union([
        z.literal("foo").describe("Use a foo resource"),
        z.string().describe("Enter a url string"),
      ])
      .describe("provide a foo or a url");
    const fx = new Fx({
      cwd: fixtures,
    });
    const config = await fx.config();
    const questions = generateResourceChoiceQuestions(config, shape, "dux");
    expect(questions).toBeDefined;
    expect(questions).toHaveLength(3);

    const [question, typeQuestion, literalQuestion] = questions;
    const shouldBe: inquirer.ListQuestion = {
      type: "list",
      choices: [
        {
          type: "choice",
          name: "Use a foo resource",
          value: "foo",
        },
        { type: "choice", name: "Enter a url string", value: "string" },
      ],
      message: "provide a foo or a url",
      default: 0,
      name: "dux-type",
    };
    expect(question).toMatchObject(shouldBe);

    const shouldType: inquirer.ListQuestion = {
      type: "list",
      name: "dux",
      message: "Use a foo resource",
      choices: [
        {
          name: "foo:foo-1",
          type: "choice",
          value: { $resource: "foo:foo-1" },
        },
        {
          name: "foo:foo-2",
          type: "choice",
          value: { $resource: "foo:foo-2" },
        },
        {
          name: `Create a new 'foo'`,
          type: "choice",
          value: { $resource: "foo" },
        },
      ],
    };
    expect(typeQuestion).toMatchObject(shouldType);
    expect(typeQuestion.when).toBeDefined();

    const shouldLiteral: inquirer.InputQuestion = {
      type: "input",
      name: "dux",
      message: "Enter a url string",
    };
    expect(literalQuestion).toMatchObject(shouldLiteral);
    expect(literalQuestion.when).toBeDefined();
  });

  it("generates questions when looking for dependencies", async () => {
    const fx = new Fx({
      cwd: fixtures,
    });
    const config = await fx.config();
    const resources = config.getResources();
    expect(resources).toBeDefined();
    expect(resources).toHaveLength(3);

    const shape = z.object({
      foo: z.literal("foo").describe("gimme a foo"),
    });

    const questions = getQuestions(shape.shape, (shape, key) =>
      generateResourceChoiceQuestions(config, shape, key)
    );
    expect(questions).toBeDefined();
    expect(questions).toHaveLength(1);
    const qn: inquirer.ListQuestion = {
      type: "list",
      choices: [
        {
          name: "foo:foo-1",
          type: "choice",
          value: { $resource: "foo:foo-1" },
        },
        {
          name: "foo:foo-2",
          type: "choice",
          value: { $resource: "foo:foo-2" },
        },
        {
          name: `Create a new 'foo'`,
          type: "choice",
          value: { $resource: "foo" },
        },
      ],
      default: 0,
    };
    expect(questions[0]).toMatchObject(qn);
  });

  it("plans a create method", async () => {
    const fx = new Fx({
      cwd: fixtures,
    });
    const plan = await fx.planCreateResource("foo");
    expect(plan).toHaveLength(2);
  });

  it("plans a create method with dependencies", async () => {
    const fx = new Fx({
      cwd: fixtures,
    });
    const plan = await fx.planCreateResource("bar");
    console.log(prettyjson.render(plan));
    console.log(fx.printPlan(plan));
  });

  it("understands dependencies", async () => {});
});
