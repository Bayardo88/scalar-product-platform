# scalar-product-generator-core

Shared core engine for the Scalar ecosystem.

It provides:

- SaaS App Brief types and parser
- Design AST types
- Pattern registry
- Prompt/brief -> AST generation
- Reusable building blocks for:
  - Figma plugin
  - scalar-design-sync CLI

## Install

```bash
npm install
npm run build
```

## Example

```ts
import { parsePromptToBrief, generateAstFromBrief } from "scalar-product-generator-core";

const brief = parsePromptToBrief("Create a project management SaaS with dashboard, projects and tasks");
const ast = generateAstFromBrief(brief);
console.log(JSON.stringify(ast, null, 2));
```
