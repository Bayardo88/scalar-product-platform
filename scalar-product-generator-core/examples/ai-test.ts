import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { parsePromptUnified, generateAstFromBrief } from "../src/index";

async function main() {
  console.log("=== Scalar AI Prompt Parser Test ===\n");

  const prompt =
    "Create a project management SaaS with dashboard, projects, tasks and analytics";

  console.log(`Prompt: "${prompt}"\n`);
  console.log(
    process.env.OPENAI_API_KEY
      ? "[Mode] Using OpenAI gpt-4.1-mini with JSON Schema Mode"
      : "[Mode] No OPENAI_API_KEY found — using regex fallback"
  );
  console.log();

  const brief = await parsePromptUnified(prompt);

  console.log("\n=== Generated SaaS App Brief ===\n");
  console.log(JSON.stringify(brief, null, 2));

  console.log("\n=== Generating Design AST ===\n");
  const ast = generateAstFromBrief(brief);

  console.log(`Screens: ${ast.screens.length}`);
  console.log(`Routes:  ${ast.routes.length}`);
  console.log(`Nodes:   ${ast.nodes.length}`);
  console.log(`\nScreen names: ${ast.screens.map((s) => s.name).join(", ")}`);
  console.log(`Route paths:  ${ast.routes.map((r) => r.path).join(", ")}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
