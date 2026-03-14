import { ASTNode } from "scalar-product-generator-core";

export function applyMetadata(
  figmaNode: SceneNode,
  astNode: ASTNode,
  screenId?: string
): void {
  figmaNode.setPluginData("astId", astNode.id);
  figmaNode.setPluginData("role", astNode.role);

  if (screenId) {
    figmaNode.setPluginData("screenId", screenId);
  }

  if (astNode.data?.bind) {
    figmaNode.setPluginData("dataBind", astNode.data.bind);
  }
}
