# scalar-product-generator-core

Shared core engine for the Scalar ecosystem. This package is the single source of truth for SaaS App Brief types, Design AST types, the pattern registry, prompt parsing, and AST generation.

## What It Provides

- **SaaSAppBrief** — structured representation of a SaaS product specification
- **DesignAST** — tree-based representation of screens, routes, and UI nodes
- **Pattern Registry** — reusable patterns (app shell, dashboard, entity list/detail, etc.)
- **Prompt Parser** — `parsePromptToBrief(prompt)` converts natural language into a brief
- **AST Generator** — `generateAstFromBrief(brief)` converts a brief into a renderable AST

## Setup

```bash
npm install
npm run build
```

## Usage

```ts
import { parsePromptToBrief, generateAstFromBrief } from "scalar-product-generator-core";

const brief = parsePromptToBrief("Create a project management SaaS with dashboard, projects and tasks");
const ast = generateAstFromBrief(brief);
console.log(JSON.stringify(ast, null, 2));
```

## Run Example

```bash
npm run example
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/brief.ts` | SaaSAppBrief interface and related types |
| `src/types/ast.ts` | DesignAST, ASTNode, ASTScreen, ASTRoute interfaces |
| `src/patterns/patterns.ts` | Pattern definitions and registry |
| `src/parser/prompt-to-brief.ts` | Prompt → Brief parser |
| `src/generator/brief-to-ast.ts` | Brief → AST generator |
| `src/index.ts` | Package barrel exports |

## Already Implemented

- Full SaaSAppBrief type with modules, entities, flows, navigation
- Full DesignAST type with nodes, screens, routes
- 8 reusable patterns (app shell, dashboard, entity list/detail, form modal, auth, analytics, settings)
- Prompt parser with entity inference (projects, tasks, users)
- AST generator producing login, dashboard, entity list/detail, analytics, settings screens

## TODO

- [ ] More sophisticated NLP-based prompt parsing
- [ ] Support for custom entity field mapping
- [ ] Hi-fi mode AST generation with DS/Scalar component tokens
- [ ] Validation utilities for brief and AST
