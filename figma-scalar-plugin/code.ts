import { parsePromptUnified, generateAstFromBrief } from "scalar-product-generator-core";
import { renderAST } from "./renderer/render-ast";
import { exportDesignAST } from "./exporter/export-ast";
import { swapToHiFi } from "./hifi/swap-engine";

figma.showUI(__html__, { width: 420, height: 600 });

figma.ui.onmessage = async (msg: {
  type: string;
  prompt?: string;
  appName?: string;
  useLibrary?: boolean;
}) => {
  try {
    if (msg.type === "generate" && msg.prompt) {
      figma.ui.postMessage({ type: "status", message: "Parsing prompt..." });
      const brief = await parsePromptUnified(msg.prompt);

      figma.ui.postMessage({ type: "status", message: "Generating AST..." });
      const ast = generateAstFromBrief(brief);

      figma.ui.postMessage({
        type: "status",
        message: `Rendering ${ast.screens.length} screens...`,
      });
      const count = await renderAST(ast);

      figma.ui.postMessage({
        type: "status",
        message: `Done! Rendered ${count} screens, ${ast.routes.length} routes, ${ast.nodes.length} nodes.`,
      });
      figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
    }

    if (msg.type === "export") {
      figma.ui.postMessage({ type: "status", message: "Exporting design..." });
      const ast = exportDesignAST(msg.appName);
      figma.ui.postMessage({
        type: "exported",
        ast: JSON.stringify(ast, null, 2),
        message: `Exported ${ast.screens.length} screens, ${ast.nodes.length} top-level nodes.`,
      });
    }

    if (msg.type === "hifi-swap") {
      const useLibrary = msg.useLibrary !== false;
      const modeLabel = useLibrary ? "library components + styles" : "styles only";
      figma.ui.postMessage({
        type: "status",
        message: `Applying hi-fi DS/Scalar (${modeLabel})...`,
      });

      const selection = figma.currentPage.selection;
      const scope = selection.length > 0 ? [...selection] : undefined;

      const stats = await swapToHiFi(scope, useLibrary);

      const parts = [`${stats.swapped}/${stats.visited} nodes updated`];
      if (stats.componentSwaps > 0) {
        parts.push(`${stats.componentSwaps} swapped to library components`);
      }
      figma.ui.postMessage({
        type: "status",
        message: `Hi-fi swap complete! ${parts.join(", ")}.`,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    figma.ui.postMessage({ type: "status", message: `Error: ${message}` });
  }
};
