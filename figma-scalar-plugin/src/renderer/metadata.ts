import { ASTNode } from "scalar-product-generator-core";

export const PLUGIN_DATA_KEYS = [
  "astId",
  "role",
  "screenId",
  "dataBind",
  "entity",
  "field",
  "state",
  "componentHint",
  "codeComponentHint",
] as const;

export type PluginDataKey = (typeof PLUGIN_DATA_KEYS)[number];

export function setPluginDataKey(
  node: SceneNode,
  key: PluginDataKey,
  value: string
): void {
  node.setPluginData(key, value);
}

export function getPluginDataKey(
  node: SceneNode,
  key: PluginDataKey
): string {
  return node.getPluginData(key);
}

export function applyMetadata(
  figmaNode: SceneNode,
  astNode: ASTNode,
  screenId?: string
): void {
  setPluginDataKey(figmaNode, "astId", astNode.id);
  setPluginDataKey(figmaNode, "role", astNode.role);

  if (screenId) {
    setPluginDataKey(figmaNode, "screenId", screenId);
  }

  if (astNode.data?.bind) {
    setPluginDataKey(figmaNode, "dataBind", astNode.data.bind);
  }

  if (astNode.data?.entity) {
    setPluginDataKey(figmaNode, "entity", astNode.data.entity);
  }

  if (astNode.data?.field) {
    setPluginDataKey(figmaNode, "field", astNode.data.field);
  }
}

export function readAllPluginData(
  node: SceneNode
): Partial<Record<PluginDataKey, string>> {
  const data: Partial<Record<PluginDataKey, string>> = {};
  for (const key of PLUGIN_DATA_KEYS) {
    const val = node.getPluginData(key);
    if (val) data[key] = val;
  }
  return data;
}

export function transferAllPluginData(
  source: SceneNode,
  target: SceneNode
): void {
  for (const key of PLUGIN_DATA_KEYS) {
    const val = source.getPluginData(key);
    if (val) target.setPluginData(key, val);
  }
}
