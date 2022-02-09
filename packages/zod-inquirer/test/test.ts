import { z } from "zod";
import { inquire, getQuestions, getQuestion } from "../src";

describe("zod-inquirer", () => {
  it("exists", () => {
    expect(inquire).toBeDefined();
  });

  it("can parse a simple shape", () => {
    const shape = z.object({
      foo: z.string().describe("foo message"),
    });
    const questions = getQuestions(shape.shape);
    expect(questions).toHaveLength(1);
    expect(questions[0]).toMatchObject({
      type: "input",
      name: "foo",
      message: "foo message:",
    });
  });

  it("can parse a shape with defaults", () => {
    const shape = z.object({
      foo: z.string().describe('foo is a foo').default('foo')
    });
    const questions = getQuestions(shape.shape);
    expect(questions).toHaveLength(1)
    expect(questions[0]).toMatchObject({
      type: "input",
      name: "foo",
      message: "foo is a foo:",
      default: "foo"
    });
  })

  it("can parse a shape with custom fallback", () => {
    const shape = z.object({
      foo: z.union([
        z.string().describe("foo"),
        z.literal("something").describe("something literal"),
      ]),
      bar: z.literal("bar").describe("bar needed here")
    });
    const questions = getQuestions(shape.shape, (_shape, key) => {
      return [{
        type: "input",
        name: key.toString(),
        b: 1
      }];
    });
    expect(questions).toHaveLength(2);
    expect(questions[0]).toMatchObject({
      type: "input",
      name: "foo",
      b: 1
    });
    expect(questions[1]).toMatchObject({
      type: "input",
      name: "bar",
      b: 1
    })
  });
});
