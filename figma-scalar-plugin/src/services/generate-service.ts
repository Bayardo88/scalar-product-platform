import { parsePromptUnified, generateAstFromBrief, DesignAST } from "scalar-product-generator-core";
import { renderAST } from "../renderer/render-ast";
import { postToUI } from "../messaging/plugin-to-ui";
import { updateState } from "../state/plugin-state";

export interface GenerateResult {
  screenCount: number;
  routeCount: number;
  nodeCount: number;
  ast: DesignAST;
}

export async function runGenerate(prompt: string): Promise<GenerateResult> {
  postToUI({ type: "status", message: "Parsing prompt..." });
  const brief = await parsePromptUnified(prompt);

  postToUI({ type: "status", message: "Generating AST..." });
  const ast = generateAstFromBrief(brief);

  postToUI({
    type: "status",
    message: `Rendering ${ast.screens.length} screens...`,
  });
  const count = await renderAST(ast);

  updateState({ lastPrompt: prompt });

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);

  return {
    screenCount: count,
    routeCount: ast.routes.length,
    nodeCount: ast.nodes.length,
    ast,
  };
}
