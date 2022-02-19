# FX

> This is a demonstration of an extensible CLI which can be used to scaffold code as logical "resources" with individual devops lifecycle methods such as `build`, `test`, `run`, and `deploy`. When executing a lifecycle method the framework runs methods on every resource in the right order, allowing information to be passed from one resource to another. Resources can use this information to emit code, call APIs, and otherwise simplify developer integration and automation tasks.

> using the CLI, developers can "stack resources" to scaffold working projects with multiple integrated systems working together without manual configuration.

## Feature Highlights:
- Plugins and resource definitions can be implemented in separate packages
- Plugins and resource definitions can be implemented "locally" by the developer within the project they are working on
- Any number of any kind of resource can be added to a project
- Resources can implement any arbitrary lifecycle methods they want
- Method implementations can arbitrarily depend on other methods (i.e. must `build` before `deploy`)
- Resources can accept arbitrary inputs from the user at execution time for any method, and will be fulfilled by `inquirer` prompts
- Resources can depend on each other by accepting other resources as inputs
- A method invoked on the whole solution will be invoked on all supporting resources in correct dependency order
- Resources can have forward and reverse dependencies (i.e. I must execute before or after this other resource)
- All method actions can be previewed without changes to the project in the `--dry` run mode
- Any unfunfilled resource dependencies can be created on-demand during resource creation (i.e when `foo` depends on `bar` and user creates a `foo` without a `bar` already present, they will have the option to create a `bar` on the fly)
- Existing code and assets can be imported and treated as resources

Other features:

- A solution for writing file templates in TypeScript with type checking and dual-syntax highlighting is provided in `@nice/ts-template` (i.e.: both the template's output language and the embedded typescript statements can be highlighted together in the same file)
- A solution for conveniently modifying existing files on disk is provided in `@nice/file`
- Inputs to resource methods are expressed much like regular interfaces with [zod type-checking schemas](https://github.com/colinhacks/zod) which are used to automatically generate TypeScript types and `inquirer` question sequences to fulfill the inputs via `@fx/zod-inquirer`

## Currently Supported Scenarios:
- Developer can add a Teams custom tab feature via `fx add teams-tab` to any existing web app and obtain the ability to F5 directly into the Teams client via the `fx dev` command.
- Developer can scaffold a new package in the repo using a template they can control

## Installation:

Use [`pnpm`](https://pnpm.io/) to drive this repo. node16, pnpm6. See [`nvm`](https://github.com/nvm-sh/nvm) (optional).

```bash
pnpm i # first time will fail, that's ok, it's because this repo is self-hosting
pnpm build # everything should build fine
pnpm i # this should succeed
```

test some fx commands:

```bash
pnpm fx help
pnpm fx se # shows what resources are available to create
pnpm fx ls # shows what resources are in the project
```

Note that a double dash is required for pnpm to pass flags to the fx process, so only in this repo when debugging we have to say `pnpm fx -- -d add package foo` instead of the production command `fx -d add package foo` (-d is "dry").

## Adding resources:

Try creating a teams tab or teams manifest:

```bash
pnpm fx add teams-tab # to add manifest and supporting devops
...
pnpm fx dev # to start up Teams client
```

## Create a new package

```bash
pnpm fx add package foobar
```

This will execute the template found in `./templates/package`. Every file with a `.t.ts` extension will be treated as a typescript template, every other file will be copied over to the new package directory.

## Configuration

The plugin configuration is found in `.fx.ts` at the root, which is a module that exports a single default export that looks like this:

```js
export default {
  plugins: [
    /* plugins go here, instances of { Plugin } from "@fx/plugin" ... */
  ],
};
```

This repo shows how plugins (resource definitions) can be created locally (see `package` resource), or loaded from other npm modules like the `teams` plugin.

## Task List:

- [x] resources, methods, cli, and resource dependencies
- [x] generate a new package from a customizeable template
- [x] drop in a teams manifest template
- [x] ngrok tunnels
- [x] teams tabs
- [ ] add a bot registration
- [ ] multiple environment support
- [ ] add SSO auth to my existing code:
  - [ ] SPA
  - [ ] serverless code
  - [ ] a Bot Framework bot
- [ ] add hosting / deploy ops with azure and github
- [ ] switch to swc loader for faster config loading
- [ ] add more teams features
  - [ ] add an adaptive card notification
  - [ ] add a messaging extension
  - [ ] add a bot app to existing
- [ ] generate teams sample code (invoke other generators)
  - [ ] production tab app
  - [ ] production bot app
- [ ] convert a project to a monorepo (wrap a folder package with a monorepo)
- [ ] update templated files with [three-way-merge-lines](https://www.npmjs.com/package/three-way-merge-lines)
