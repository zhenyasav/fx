# FX

> This is a demonstration of an extensible CLI which can be used to scaffold repetitive boilerplate, such as the creation of a standard package in a monorepo (let's say all your packages are typescript packages with a pre configured build and test pattern, etc).

use [`pnpm`](https://pnpm.io/) to drive this repo.

installation:
```bash
pnpm i # this will fail at first, that's ok
pnpm build
pnpm i # this will succeed
```

test some fx commands:
```bash
pnpm fx --help
pnpm fx ls                  # shows what resources are available to create
```

## Create a new package:
```bash
pnpm fx add package foobar 
```
This will execute the template found in `./templates/package`. Every file with a `.t.ts` extension will be treated as a typescript template, every other file will be copied over to the new package directory.


## Configuration
The plugin configuration is found in `.fx.js` at the root, which is a module that exports a single default export that looks like this:
```js
export default {
  plugins: [ /* plugins go here, instances of { Plugin } from "@nice/fx" ... */ ]
} 
```
