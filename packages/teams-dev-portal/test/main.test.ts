import { AppStudioLogin } from "../src/auth/appStudioLogin";

describe("@fx/teams-dev-portal", () => {
  it("exists", () => {
    expect(AppStudioLogin).toBeDefined();
  });

  it("generates token", async () => {
    const asi = AppStudioLogin.getInstance();
    const token = await asi.getAccessToken(false);
    console.log({token});
    expect(token).toBeDefined();
  })
});
