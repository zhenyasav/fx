import { z } from "zod";
import { expect } from "chai";
import path from "path";
import { Fx, getQuestions } from "..";

const fixtures = path.resolve(__dirname, "./fixtures");

describe("core", () => {
  it("exists", () => {
    expect(Fx).to.exist;
  });

  it("loads config", async () => {
    const fx = new Fx({
      cwd: fixtures,
    });
    const config = await fx.config();
    expect(config).to.exist;
  });

  it.only("generates the right resource choice question", async () => {
    const shape = z.literal("bar").describe("bars needed");
    const fx = new Fx({
      cwd: fixtures,
    });
    const config = await fx.config();
    const question = await fx.generateResourceChoiceQuestion(shape, "bar");
    expect(question).to.exist.and.include({
      type: "list",
      choices: ["Create a new 'foo'", "foo:123", "foo:234"],
      default: 0,
    });
  });

  it("generates the right question when looking for dependencies", async () => {
    const fx = new Fx({
      cwd: fixtures,
    });
    const config = await fx.config();
    const resources = config.getResources();
    expect(resources).to.exist.and.be.an("array").of.length(2);

    const shape = z.object({
      foo: z.literal("foo").describe("gimme a foo"),
    });

    const questions = getQuestions(shape.shape, (shape, key) =>
      fx.generateResourceChoiceQuestion(shape, key)
    );
    expect(questions).to.exist.and.be.an("array").of.length(1);
    console.log(questions);
    expect(questions[0]).to.exist.and.include({
      type: "list",
      choices: ["Create a new 'foo'", "foo:123", "foo:234"],
      default: 0,
    });
  });
});
