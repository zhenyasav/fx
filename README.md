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
  plugins: [ /* plugins go here, instances of { Plugin } from "@nice/fx" ... */ ]
} 
```

## Next steps
These would be features this tool should learn to demonstrate next
- [x] drop in a teams manifest template
- [ ] add SSO auth to my existing SPA / serverless app
- [ ] add hosting / deploy ops with azure and github
- [ ] add teams communications features
  - [ ] add an adaptive card notification
  - [ ] add a messaging extension
  - [ ] add a bot

## Who is this for
1. __Purpose-built apps (LOB)__ are apps that are built with one specific business unit in mind as the primary customer. The application or system will be tailor made for that specific business process (or mildly customized to fit a particular variant) and tends to be used "internally" by employees, or close customers and partners. It's different from a broad market app in that it's not relevant to a broad set of customers, and is operated and deployed entirely within a single organizational boundary (tenant) for internal use. All of them require identity management and auth/z, cloud hosting and data storage, and data residency and compliance are a factor for larger clients (10K seats+). Many of these solutions are not maintained/deployed on a frequent basis, and are not deployed via CI/CD, which is a luxury only larger, more continuous investments can make.

    - a. __Consultants and systems integrators__, who are financed per-project or per unit time to modernize business processes with software. They work for the full range of SMB to medium and large Enterprise, and have to know how to deliver solutions within specific budgetary, time, and team constraints. A typical consultant might deliver 2-5 projects per year, or spend time continuously on maintaining a larger internal software product or platform within an Enterprise. Projects tend to be fixed cost or fixed time, and project renewal is an expensive process, meaning many projects are built with more thought given to "how will the customer maintain this without us" consideration. Consultants and clients are likely to ask for "platform-ready" and "customizeable" solutions (such as Power platform) as a result of this engagement pattern. Low complexity and low cost solutions (serverless, code-less) are preferred, and it's very typical to see them used in combination with narrow bits of pro-code solutions running in serverless functions (by default) or somewhere on-premise (if required) for example.  Those who consult around Microsoft platforms and technologies tend to have dominant experience with C#, .NET, and SharePoint Framework. They are comfortable with Azure, and tend to consult clients who are also comfortable with at least buying into services in Azure, even if they need help using it. A growing number of them are shifting away from SPFx to more modern web patterns including React SPA front ends written in TypeScript, serverless hosting, and are increasingly involved in conversations with clients about Teams integrations over the last year (broad market focus on migrating from legacy patterns like SPFx or on-prem Sharepoint apps towards Teams). Typical topologies are either SPFx apps, or ASP.NET + TS React SPA (webpack + redux + REST on ASP.NET), less frequently (3/10) full-stack TS (webpack + redux + node.js + express), or in rarer cases (1/10) Blazor apps. For clients with less than 10K seats, access to admin consent and permissions to deploy into the client's environment can be much easier. For clients with 10K+ seats, consultants will tend to work with the client's engineering and SRE teams to develop and plan solution deployment which will be handled by the SRE teams. Projects tend to be very constrained by legacy technology decisions, or specific unique systems requiring integration or modernization, as well as cost constraints. The vast majority of consulting projects do not serve high volumes of concurrent users, but a small (5-10%) portion of high volume/high performance LOB applications exist in the industry and power the internals of the most important industries (e.g. airline, telecom, etc...).

    - b. __Developers within enterprises__ who either create, operate, and/or mondernize existing internal applications and systems. Their new project volume per year can be higher (2-4) if they are part of an internal "platform" team (more like a consultant above), or they are dedicated to a specific business unit's operations, in which case they are more like an ISV who maintains an operational concern and modernizes it gradually (0-2 new projects yearly). Unlike consultants above, even if new project volume is high for a platform team, there are much lower barriers to re-engagement and maintenance of existing projects or solutions built "last year". The company has to buy into clouds or technology platforms of consequential cost at the CTO/CIO level, but individual technology decisions can be up to the tech leads and architects / engineering owners. Cost constraints are applied differently (less on time, and more on infrastructure cogs and solution complexity). These developers tend to use patterns more modern than what consultants (tend to be forced to) use. More often than not we see full-stack TypeScript or Java on the server with TS SPA on the client running React or less frequently Angular.

    - c. hobbyists and students are out of scope

2. __Broad-market apps (ISV)__ are apps that are built for a large scale of customers. The application tackles a common set of scenarios relevant to entire cohorts of customers in specific verticals. Most of these products are sold through organic self-serve motions or with outbound sales-driven motions by the ISV, and are deployed across many organizations (multi-tenant). 

    - a. __Microsoft-native ISVs__ are companies with solutions that target the Microsoft ecosystem as customers and get most or all of their customers there. These solutions tend to take advantage of the fact that the M365 cloud is approved for use in many companies around the world, and therefore choose to deliver their technology as much as possible through Microsoft technologies and portals: Sharepoint, Azure, SPFx, Office Add-ins, Microsoft Graph, Power Platform are all go-to solutions, and there are factors that encourage more use of Microsoft technologies for this group: the kind of talent they retain, the kinds of marketing dollars and opportunities they receive by partnership or association with Microsoft, and the customer scenarios themselves are often a driver (e.g. many customer have specific problems articulating business process around systems they are already bought into: say SharePoint and Outlook. Contracts365 helps automate contract workflow by keeping all the logic entirely within Sharepoint and exposing controls over it via Outlook). They typically look for more opportunities to integrate Msft platforms because it represents sizeable customer reach for them. Application topologies tend to be designed for "medium scale" concurrent users (10s or 100s of thousands daily active users).

    - b. __All other ISVs__ are companies that build apps on top of whatever platform they choose, for customers beyond just those who buy into Microsoft platforms (such as Slack or Salesforce for example). These are typically hosted on AWS and have long been built upon web technologies: webpack, typescript, grunt/gulp, terraform, git, github actions, node.js with typescript on the server, or Java or Python servers. These folks are also preferring serverless for lower volume operations, and kubernetes for higher volume or higher security (banking industry) conditions. Application topologies tend to be designed for larger scale and involve more advanced server topologies with queues or exotic data stores, service discovery systems, orchestration systems, etc. The larger business apps in this space (ServiceNow, Monday.com) get a small fraction of their traffic from their Microsoft integrations such as their Teams application or Sharepoint integration, and do it mostly for the reach for new users in our platform and their revenue. 

