// this has to be a template file because otherwise typescript thinks
// the nested templates in this folder should look at this tsconfig.json
// as their project file
export default () => /*javascript*/ `{
  "extends": "../../tsconfig.json",
  "include": ["./src/**/*.ts"],
  "exclude": ["build", "node_modules"],
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build"
  }
}
`;
