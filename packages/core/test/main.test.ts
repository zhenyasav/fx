import path from "path";
import { Fx } from "..";
import { expect } from "chai";

describe("core", () => {
  it("exists", () => {
    expect(Fx).to.exist;
  });

  it("loads config", async () => {
    const fx = new Fx({
      cwd: path.resolve(__dirname, './fixtures')
    });
    
    const config = await fx.config();

    expect(config).to.exist;
  })
});
