import { ASTNode } from "scalar-product-generator-core";
import { applyLayout, setDefaultSize } from "./layout";
import { applyMetadata } from "./metadata";
import { getRoleLabel } from "./role-map";
import { createTextNode, headingFontSize } from "./text";

const FILL_LIGHT: SolidPaint = { type: "SOLID", color: { r: 0.96, g: 0.96, b: 0.96 } };
const FILL_CARD: SolidPaint = { type: "SOLID", color: { r: 1, g: 1, b: 1 } };
const FILL_BUTTON: SolidPaint = { type: "SOLID", color: { r: 0.35, g: 0.35, b: 0.94 } };
const FILL_SECONDARY: SolidPaint = { type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } };
const FILL_SIDEBAR: SolidPaint = { type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.2 } };

function fillForRole(role: string): SolidPaint | null {
  if (role === "navigation.sidebar") return FILL_SIDEBAR;
  if (role.startsWith("button.primary")) return FILL_BUTTON;
  if (role.startsWith("button.secondary")) return FILL_SECONDARY;
  if (role.startsWith("card.")) return FILL_CARD;
  if (role === "navigation.topbar") return FILL_LIGHT;
  if (role === "overlay.modal") return FILL_CARD;
  return null;
}

export async function renderNode(
  astNode: ASTNode,
  screenId?: string
): Promise<SceneNode> {
  if (astNode.type === "Text") {
    const fontSize = headingFontSize(astNode.role);
    const text = await createTextNode(astNode.name || "Text", { fontSize });
    applyMetadata(text, astNode, screenId);
    text.name = `[${getRoleLabel(astNode.role)}] ${astNode.name}`;
    return text;
  }

  if (astNode.type === "Primitive") {
    const rect = figma.createRectangle();
    rect.resize(100, 40);
    rect.fills = [FILL_LIGHT];
    rect.name = `[${getRoleLabel(astNode.role)}] ${astNode.name}`;
    applyMetadata(rect, astNode, screenId);
    return rect;
  }

  const frame = figma.createFrame();
  frame.name = `[${getRoleLabel(astNode.role)}] ${astNode.name}`;

  const fill = fillForRole(astNode.role);
  if (fill) {
    frame.fills = [fill];
  } else {
    frame.fills = [];
  }

  setDefaultSize(frame, astNode.role);
  applyLayout(frame, astNode.layout);
  applyMetadata(frame, astNode, screenId);

  if (astNode.children && astNode.children.length > 0) {
    for (const child of astNode.children) {
      const childNode = await renderNode(child, screenId);
      frame.appendChild(childNode);
    }
  } else if (
    astNode.type !== "Region" ||
    ["table.data", "chart.analytics", "chart.bar", "chart.line", "chart.pie",
     "feed.activity", "panel.details", "input.search", "input.text",
     "input.password", "input.select"].includes(astNode.role)
  ) {
    const label = await createTextNode(
      getRoleLabel(astNode.role),
      { fontSize: 12, color: { r: 0.5, g: 0.5, b: 0.5 } }
    );
    frame.appendChild(label);
  }

  return frame;
}
