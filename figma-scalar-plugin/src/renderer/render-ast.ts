import { DesignAST, ASTNode } from "scalar-product-generator-core";
import { renderNode } from "./render-node";

function findNodeById(nodes: ASTNode[], id: string): ASTNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export async function renderAST(ast: DesignAST): Promise<number> {
  let xOffset = 0;
  const SCREEN_GAP = 80;
  let renderedCount = 0;

  for (const screen of ast.screens) {
    const rootNode = findNodeById(ast.nodes, screen.rootNodeId);
    if (!rootNode) {
      console.log(`[scalar] Screen "${screen.name}" root node ${screen.rootNodeId} not found, skipping`);
      continue;
    }

    const figmaNode = await renderNode(rootNode, screen.id);

    if ("resize" in figmaNode) {
      (figmaNode as FrameNode).name = `Screen: ${screen.name}`;
    }

    figmaNode.x = xOffset;
    figmaNode.y = 0;

    figma.currentPage.appendChild(figmaNode);

    xOffset += ("width" in figmaNode ? (figmaNode as FrameNode).width : 400) + SCREEN_GAP;
    renderedCount++;
  }

  return renderedCount;
}
