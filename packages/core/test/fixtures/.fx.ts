import { Config } from "../..";

const config: Config = {
  plugins: [
    {
      name: "local",
      resources() {
        return [
          {
            type: "foo",
          },
          {
            type: "bar",
          },
          { type: "zoo" },
        ];
      },
    },
  ],
};

export default config;
