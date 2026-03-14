import { getHiFiDef, HiFiComponentDef } from "../../hifi/component-registry";
import {
  scanDocumentForComponents,
  clearLocalKeys,
  getLibraryStats,
} from "../../hifi/library-manifest";
import { PLUGIN_DATA_KEYS, transferAllPluginData, setPluginDataKey } from "../renderer/metadata";
import { postToUI } from "../messaging/plugin-to-ui";

const SHADOW_ROLES = new Set([
  "navigation.sidebar", "card.summary", "chart.analytics", "chart.bar",
  "chart.line", "chart.pie", "table.data", "overlay.modal",
]);

const STROKE_ROLES = new Set([
  "card.summary", "input.text", "input.password", "input.search",
]);

const DS_SCALAR_COMPONENT_HINTS: Record<string, string> = {
  "navigation.sidebar": "Sidebar",
  "navigation.topbar": "Topbar",
  "button.primaryAction": "Button",
  "button.secondaryAction": "Button",
  "card.summary": "SummaryCard",
  "chart.analytics": "AnalyticsChart",
  "chart.bar": "BarChart",
  "chart.line": "LineChart",
  "chart.pie": "PieChart",
  "table.data": "DataTable",
  "feed.activity": "ActivityFeed",
  "panel.details": "DetailsPanel",
  "input.search": "SearchInput",
  "input.text": "TextInput",
  "input.password": "PasswordInput",
  "input.select": "Select",
  "form.login": "Form",
  "form.settings": "Form",
  "overlay.modal": "Modal",
  "alert.error": "Alert",
  "alert.success": "Alert",
  "navigation.tabs": "Tabs",
  "panel.filters": "FiltersPanel",
  "collection.cards": "CardGrid",
};

async function loadFont(family: string, style: string): Promise<void> {
  await figma.loadFontAsync({ family, style });
}

async function applyHiFiToFrame(node: FrameNode, def: HiFiComponentDef): Promise<void> {
  if (def.fills) node.fills = def.fills;
  if (def.cornerRadius !== undefined) node.cornerRadius = def.cornerRadius;
  if (def.minWidth && node.width < def.minWidth) node.resize(def.minWidth, node.height);
  if (def.minHeight && node.height < def.minHeight) node.resize(node.width, def.minHeight);

  if (SHADOW_ROLES.has(def.role)) {
    node.effects = [{
      type: "DROP_SHADOW", visible: true,
      color: { r: 0, g: 0, b: 0, a: 0.06 },
      offset: { x: 0, y: 2 }, radius: 8, spread: 0,
      blendMode: "NORMAL", showShadowBehindNode: false,
    }];
  }

  node.strokes = [];
  if (STROKE_ROLES.has(def.role)) {
    node.strokes = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.9 } }];
    node.strokeWeight = 1;
  }
}

async function applyHiFiToText(node: TextNode, def: HiFiComponentDef): Promise<void> {
  if (!def.textStyle) return;
  await loadFont("Inter", def.textStyle.fontWeight);
  node.fontName = { family: "Inter", style: def.textStyle.fontWeight };
  node.fontSize = def.textStyle.fontSize;
  node.fills = [{ type: "SOLID", color: def.textStyle.color }];
}

const componentCache = new Map<string, ComponentNode | null>();

async function tryImportComponent(key: string): Promise<ComponentNode | null> {
  if (componentCache.has(key)) return componentCache.get(key)!;
  try {
    const component = await figma.importComponentByKeyAsync(key);
    componentCache.set(key, component);
    return component;
  } catch {
    componentCache.set(key, null);
    return null;
  }
}

async function trySwapToComponentInstance(
  node: SceneNode,
  def: HiFiComponentDef
): Promise<{ swapped: boolean; instance?: InstanceNode }> {
  if (!def.componentKey) return { swapped: false };
  if (node.type !== "FRAME") return { swapped: false };

  const component = await tryImportComponent(def.componentKey);
  if (!component) return { swapped: false };

  const instance = component.createInstance();
  instance.x = node.x;
  instance.y = node.y;
  instance.resize(
    Math.max(node.width, def.minWidth || 0),
    Math.max(node.height, def.minHeight || 0)
  );

  if (def.variantProps) {
    try {
      instance.setProperties(def.variantProps);
    } catch {
      // variant props may not exist on all component versions
    }
  }

  transferAllPluginData(node, instance);
  instance.name = node.name;

  const parent = node.parent;
  if (parent && "children" in parent) {
    const idx = parent.children.indexOf(node);
    parent.insertChild(idx, instance);
    node.remove();
  }

  return { swapped: true, instance };
}

function applyComponentHints(node: SceneNode, role: string): void {
  const hint = DS_SCALAR_COMPONENT_HINTS[role];
  if (hint) {
    setPluginDataKey(node, "componentHint", hint);
    setPluginDataKey(node, "codeComponentHint", `@scalar/ui/${hint}`);
  }
}

export interface SwapStats {
  swapped: number;
  visited: number;
  componentSwaps: number;
  libraryResolved: number;
  libraryTotal: number;
}

async function swapNode(
  node: SceneNode,
  useLibraryComponents: boolean
): Promise<boolean> {
  const role = node.getPluginData("role");
  if (!role) return false;

  const def = getHiFiDef(role);
  if (!def) return false;

  applyComponentHints(node, role);

  if (useLibraryComponents && def.componentKey) {
    const result = await trySwapToComponentInstance(node, def);
    if (result.swapped) return true;
  }

  if (node.type === "TEXT" && def.textStyle) {
    await applyHiFiToText(node, def);
    return true;
  }

  if (node.type === "FRAME") {
    await applyHiFiToFrame(node, def);
    if (def.textStyle && node.children.length > 0) {
      for (const child of node.children) {
        if (child.type === "TEXT") await applyHiFiToText(child, def);
      }
    }
    return true;
  }

  return false;
}

async function walkAndSwap(
  node: SceneNode,
  stats: SwapStats,
  useLibraryComponents: boolean
): Promise<void> {
  stats.visited++;

  const didSwap = await swapNode(node, useLibraryComponents);
  if (didSwap) {
    stats.swapped++;
    if (useLibraryComponents) {
      const role = node.getPluginData("role");
      const def = role ? getHiFiDef(role) : undefined;
      if (def?.componentKey) stats.componentSwaps++;
    }
  }

  if ("children" in node) {
    const children = [...(node as FrameNode).children];
    for (const child of children) {
      await walkAndSwap(child, stats, useLibraryComponents);
    }
  }
}

export async function runHiFiUpgrade(
  useLibrary: boolean = true,
  scope?: SceneNode[]
): Promise<SwapStats> {
  componentCache.clear();
  clearLocalKeys();

  if (useLibrary) {
    postToUI({ type: "status", message: "Scanning for library components..." });
    await scanDocumentForComponents();
  }

  const libStats = getLibraryStats();

  const stats: SwapStats = {
    swapped: 0,
    visited: 0,
    componentSwaps: 0,
    libraryResolved: libStats.resolved,
    libraryTotal: libStats.total,
  };

  const targets = scope || figma.currentPage.children;
  for (const node of [...targets]) {
    await walkAndSwap(node, stats, useLibrary);
  }

  return stats;
}
