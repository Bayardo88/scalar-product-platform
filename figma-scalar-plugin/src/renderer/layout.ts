import { ASTLayout } from "scalar-product-generator-core";

export function applyLayout(frame: FrameNode, layout?: ASTLayout): void {
  if (!layout) return;

  if (layout.display === "stack") {
    frame.layoutMode = layout.direction === "horizontal" ? "HORIZONTAL" : "VERTICAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
  }

  if (layout.display === "grid") {
    frame.layoutMode = "HORIZONTAL";
    frame.layoutWrap = "WRAP";
    frame.primaryAxisSizingMode = "FIXED";
    frame.counterAxisSizingMode = "AUTO";
  }

  if (typeof layout.gap === "number") {
    frame.itemSpacing = layout.gap;
  }

  if (layout.padding) {
    if (typeof layout.padding.top === "number") frame.paddingTop = layout.padding.top;
    if (typeof layout.padding.right === "number") frame.paddingRight = layout.padding.right;
    if (typeof layout.padding.bottom === "number") frame.paddingBottom = layout.padding.bottom;
    if (typeof layout.padding.left === "number") frame.paddingLeft = layout.padding.left;
  }
}

export function setDefaultSize(frame: FrameNode, role: string): void {
  const sizeMap: Record<string, [number, number]> = {
    "appShell": [1440, 900],
    "navigation.sidebar": [240, 900],
    "navigation.topbar": [1200, 56],
    "content.main": [1200, 844],
    "content.toolbar": [1160, 48],
    "table.data": [1160, 400],
    "chart.analytics": [1160, 300],
    "chart.bar": [560, 300],
    "chart.line": [560, 300],
    "chart.pie": [560, 300],
    "panel.details": [1160, 400],
    "feed.activity": [1160, 250],
    "collection.cards": [1160, 120],
    "form.login": [360, 200],
    "form.settings": [600, 300],
    "overlay.modal": [480, 400],
  };

  const size = sizeMap[role];
  if (size) {
    frame.resize(size[0], size[1]);
  } else {
    frame.resize(320, 120);
  }
}
