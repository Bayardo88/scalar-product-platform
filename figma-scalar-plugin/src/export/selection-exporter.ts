import { ASTNode, ASTDataBinding } from "scalar-product-generator-core";
import { readAllPluginData, PluginDataKey } from "../renderer/metadata";

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

function extractLayout(node: SceneNode): ASTNode["layout"] | undefined {
  if (!("layoutMode" in node)) return undefined;
  const frame = node as FrameNode;
  if (frame.layoutMode === "NONE") return undefined;

  const layout: NonNullable<ASTNode["layout"]> = {};

  if (frame.layoutMode === "HORIZONTAL" || frame.layoutMode === "VERTICAL") {
    if (frame.layoutWrap === "WRAP") {
      layout.display = "grid";
    } else {
      layout.display = "stack";
      layout.direction = frame.layoutMode === "HORIZONTAL" ? "horizontal" : "vertical";
    }
  }

  if (frame.itemSpacing > 0) layout.gap = frame.itemSpacing;

  const hasPadding =
    frame.paddingTop > 0 || frame.paddingRight > 0 ||
    frame.paddingBottom > 0 || frame.paddingLeft > 0;

  if (hasPadding) {
    layout.padding = {
      top: frame.paddingTop,
      right: frame.paddingRight,
      bottom: frame.paddingBottom,
      left: frame.paddingLeft,
    };
  }

  return layout;
}

export interface ExportDiagnostic {
  nodeId: string;
  nodeName: string;
  issue: "missing-role" | "missing-astId" | "missing-screenId";
}

export function extractASTNode(
  node: SceneNode,
  diagnostics: ExportDiagnostic[]
): ASTNode {
  const pluginData = readAllPluginData(node);

  const id = pluginData.astId || nextExportId();
  const role = pluginData.role || `unknown.${node.type.toLowerCase()}`;
  const name = node.name.replace(/^\[.*?\]\s*/, "");

  if (!pluginData.role) {
    diagnostics.push({ nodeId: id, nodeName: name, issue: "missing-role" });
  }
  if (!pluginData.astId) {
    diagnostics.push({ nodeId: id, nodeName: name, issue: "missing-astId" });
  }

  const type = pluginData.role
    ? inferTypeFromRole(pluginData.role)
    : inferTypeFromFigmaNode(node);

  const astNode: ASTNode = { id, type, role, name };

  if ("layoutMode" in node) {
    const layout = extractLayout(node);
    if (layout) astNode.layout = layout;
  }

  if (pluginData.dataBind || pluginData.entity || pluginData.field) {
    const data: ASTDataBinding = {};
    if (pluginData.dataBind) data.bind = pluginData.dataBind;
    if (pluginData.entity) data.entity = pluginData.entity;
    if (pluginData.field) data.field = pluginData.field;
    astNode.data = data;
  }

  if ("children" in node) {
    const frame = node as FrameNode;
    if (frame.children.length > 0) {
      const childNodes: ASTNode[] = [];
      for (const child of frame.children) {
        if (child.visible !== false) {
          childNodes.push(extractASTNode(child, diagnostics));
        }
      }
      if (childNodes.length > 0) {
        astNode.children = childNodes;
      }
    }
  }

  return astNode;
}
