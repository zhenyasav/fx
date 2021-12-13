import { Resource } from "@fx/plugin";

export function yogenerator(): Resource { return { name: "foo" }; }
// import { method, Resource, Effects } from "@fx/plugin";
// // import { RunYo } from "./effects.js";

// export function yogenerator({
//   name,
//   description,
// }: {
//   name: string;
//   description?: string;
// }): Resource {
//   return {
//     name: `generator`,
//     description: description ? description : `yo generator '${name}'`,
//     methods: {
//       create: method({
//         execute() {
//           return {
//             description: `yo ${name}`,
//             effects: [
//               {
//                 type: "yo",
//               },
//             ],
//           };
//         },
//       }),
//     },
//   };
// }
