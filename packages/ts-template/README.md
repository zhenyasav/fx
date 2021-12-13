# TS-Template

```ts
import { executeDirectoryTemplate } from "@nice/ts-template";

const result = await executeDirectoryTemplate({
  templatePath: '/path to folder',
  outputDir: '/...',
  input: {
    ...
  }
})
```