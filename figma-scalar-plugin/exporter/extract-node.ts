import {
  ASTNode,
  ASTDataBinding,
  ASTInteraction,
} from "scalar-product-generator-core";
import { extractMetadata } from "./extract-metadata";
import { extractLayout } from "./extract-layout";

let exportIdCounter = 1;

export function resetExportIdCounter(): void {
  exportIdCounter = 1;
}

function nextExportId(): string {
  return `exp_node_${exportIdCounter++}`;
}

function inferTypeFromRole(role: string): ASTNode["type"] {
  if (role.startsWith("text.")) return "Text";
  if (role.startsWith("form.")) return "Form";
  if (role.startsWith("overlay.")) return "Overlay";
  if (role.startsWith("collection.")) return "Collection";
  if (
    role === "appShell" ||
    role.startsWith("content.") ||
    role.startsWith("navigation.") ||
    role.startsWith("panel.")
  ) {
    return "Region";
  }
  return "ComponentInstance";
}

function inferTypeFromFigmaNode(node: SceneNode): ASTNode["type"] {
  if (node.type === "TEXT") return "Text";
  if (node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "LINE") return "Primitive";
  return "Region";
}

export function extractASTNode(node: SceneNode): ASTNode {
  const meta = extractMetadata(node);

  const id = meta?.astId || nextExportId();
  const role = meta?.role || `unknown.${node.type.toLowerCase()}`;
  const name = node.name.replace(/^\[.*?\]\s*/, "");

  const type = meta?.role ? inferTypeFromRole(meta.role) : inferTypeFromFigmaNode(node);

  const astNode: ASTNode = { id, type, role, name };

  if ("layoutMode" in node) {
    const layout = extractLayout(node);
    if (layout) astNode.layout = layout;
  }

  if (meta?.dataBind) {
    const data: ASTDataBinding = { bind: meta.dataBind };
    astNode.data = data;
  }

  if ("children" in node) {
    const frame = node as FrameNode;
    if (frame.children.length > 0) {
      const childNodes: ASTNode[] = [];
      for (const child of frame.children) {
        if (child.visible !== false) {
          childNodes.push(extractASTNode(child));
        }
      }
      if (childNodes.length > 0) {
        astNode.children = childNodes;
      }
    }
  }

  return astNode;
}
