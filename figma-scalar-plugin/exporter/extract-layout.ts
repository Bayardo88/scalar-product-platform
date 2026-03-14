import { ASTLayout } from "scalar-product-generator-core";

export function extractLayout(node: SceneNode): ASTLayout | undefined {
  if (!("layoutMode" in node)) return undefined;

  const frame = node as FrameNode;

  if (frame.layoutMode === "NONE") return undefined;

  const layout: ASTLayout = {};

  if (frame.layoutMode === "HORIZONTAL" || frame.layoutMode === "VERTICAL") {
    if (frame.layoutWrap === "WRAP") {
      layout.display = "grid";
    } else {
      layout.display = "stack";
      layout.direction = frame.layoutMode === "HORIZONTAL" ? "horizontal" : "vertical";
    }
  }

  if (frame.itemSpacing > 0) {
    layout.gap = frame.itemSpacing;
  }

  const hasPadding =
    frame.paddingTop > 0 ||
    frame.paddingRight > 0 ||
    frame.paddingBottom > 0 ||
    frame.paddingLeft > 0;

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
