export interface ExtractedMetadata {
  astId: string;
  role: string;
  screenId?: string;
  dataBind?: string;
}

export function extractMetadata(node: SceneNode): ExtractedMetadata | null {
  const astId = node.getPluginData("astId");
  const role = node.getPluginData("role");

  if (!astId && !role) return null;

  const screenId = node.getPluginData("screenId") || undefined;
  const dataBind = node.getPluginData("dataBind") || undefined;

  return { astId, role, screenId, dataBind };
}

export function hasScalarMetadata(node: SceneNode): boolean {
  return !!(node.getPluginData("astId") || node.getPluginData("role"));
}
