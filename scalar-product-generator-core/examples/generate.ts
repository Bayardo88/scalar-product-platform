import { parsePromptToBrief, generateAstFromBrief } from "../src";

const prompt =
  "Create a project management SaaS with dashboard, projects, tasks, analytics and settings";

console.log("=== Prompt ===");
console.log(prompt);
console.log();

const brief = parsePromptToBrief(prompt);
console.log("=== SaaS App Brief ===");
console.log(JSON.stringify(brief, null, 2));
console.log();

const ast = generateAstFromBrief(brief);
console.log("=== Design AST ===");
console.log(JSON.stringify(ast, null, 2));
console.log();

console.log(`Generated ${ast.screens.length} screens, ${ast.routes.length} routes, ${ast.nodes.length} nodes`);
