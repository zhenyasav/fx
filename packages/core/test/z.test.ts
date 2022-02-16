
// import { z } from "zod";

// describe.only("zod test", () => {

//   it.only("zods", () => {
//     // const schema = z.object({
//     //   manifest: z.string(), // required when appname == null
//     //   appname: z.string(), // required when manifest == null
//     //   redirecturis: z.string(),
//     //   platform: z.union([
//     //     z.literal("spa"),
//     //     z.literal("web"),
//     //     z.literal("publicClient"),
//     //   ]), // required when redirecturis.length > 0
//     //   aadAppScopeConsentBy: z.union([
//     //     z.literal("admins"),
//     //     z.literal("adminsAndUsers"),
//     //   ]),
//     //   scopeName: z.string(),
//     //   uri: z.string(), // required when scopename.length > 0
//     //   scopeAdminConsentDescription: z.string(), // required when scopename.length > 0
//     //   scopeAdminConsentDisplayName: z.string(), // required when scopename.length > 0
//     // });
    
//     const manifestOrAppName = z
//       .object({
//         manifest: z.string(),
//       })
//       .or(
//         z.object({
//           appname: z.string(),
//         })
//       );
    
//     const rest = z.object({
//       redirecturis: z.string(),
//     });
    
//     const combined = rest.and(manifestOrAppName);
    
//     type T = z.infer<typeof combined>;
    
//     const tt: T = {
//       redirecturis: "something",
//       appname: "foo",
//       manifest: "bar",
//     };

//     const parsed = combined.parse(tt);

//     console.log(parsed);
    
//     expect(tt).toBeDefined();
//   })
// })
