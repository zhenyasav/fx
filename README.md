# FX

> This is a demonstration of an extensible CLI which can be used to scaffold repetitive boilerplate, such as the creation of a standard package in a monorepo (let's say all your packages are typescript packages with a pre configured build and test pattern, etc).

Use [`pnpm`](https://pnpm.io/) to drive this repo. node16, pnpm6. See [`nvm`](https://github.com/nvm-sh/nvm) (optional).

## Installation:

```bash
pnpm i # this will fail at first, that's ok
pnpm build
pnpm i # this will succeed
```

test some fx commands:

```bash
pnpm fx -- --help
pnpm fx ls                  # shows what resources are available to create
```

Note that a double dash is required for pnpm to pass flags to the fx process, so only in this repo when debugging we have to say `pnpm fx -- -d add package foo` instead of the production command `fx -d add package foo`.

## Create a new package (add resource):

```bash
pnpm fx add package foobar
```

This will execute the template found in `./templates/package`. Every file with a `.t.ts` extension will be treated as a typescript template, every other file will be copied over to the new package directory.

## Configuration

The plugin configuration is found in `.fx.js` at the root, which is a module that exports a single default export that looks like this:

```js
export default {
  plugins: [
    /* plugins go here, instances of { Plugin } from "@nice/fx" ... */
  ],
};
```

## Features

done:

- [x] generate a new package from a customizeable template
- [x] drop in a teams manifest template

todo:

- [ ] add SSO auth to my existing code:
  - [ ] SPA
  - [ ] serverless code
  - [ ] a Bot Framework bot
- [ ] add hosting / deploy ops with azure and github
- [ ] add teams features
  - [ ] add an adaptive card notification
  - [ ] add a messaging extension
  - [ ] add a bot app to existing 
- [ ] generate teams sample code
  - [ ] production tab app
  - [ ] production bot app
- [ ] convert a project to a monorepo
- [ ] update templated files with [three-way-merge-lines](https://www.npmjs.com/package/three-way-merge-lines)
