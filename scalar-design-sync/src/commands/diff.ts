import fs from "fs-extra";
import path from "path";
import { DesignAST, ASTNode, ASTScreen, ASTRoute } from "scalar-product-generator-core";

export interface DiffResult {
  screens: {
    added: ASTScreen[];
    removed: ASTScreen[];
    modified: Array<{ screenId: string; name: string; changes: string[] }>;
  };
  routes: {
    added: ASTRoute[];
    removed: ASTRoute[];
    modified: Array<{ routeId: string; changes: string[] }>;
  };
  nodes: {
    added: string[];
    removed: string[];
    roleChanged: Array<{ nodeId: string; from: string; to: string }>;
    propsChanged: string[];
    layoutChanged: string[];
  };
  summary: {
    totalChanges: number;
    affectedScreenIds: string[];
  };
}

function flattenNodes(nodes: ASTNode[]): Map<string, ASTNode> {
  const map = new Map<string, ASTNode>();
  function walk(node: ASTNode) {
    map.set(node.id, node);
    if (node.children) node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return map;
}

function findScreenForNode(ast: DesignAST, nodeId: string): string | undefined {
  for (const screen of ast.screens) {
    const nodeMap = flattenNodes(ast.nodes);
    const rootNode = nodeMap.get(screen.rootNodeId);
    if (!rootNode) continue;

    function isDescendant(parent: ASTNode, targetId: string): boolean {
      if (parent.id === targetId) return true;
      if (parent.children) {
        return parent.children.some((c) => isDescendant(c, targetId));
      }
      return false;
    }

    if (isDescendant(rootNode, nodeId)) return screen.id;
  }
  return undefined;
}

function compareNodes(oldNode: ASTNode, newNode: ASTNode): string[] {
  const changes: string[] = [];

  if (oldNode.role !== newNode.role) {
    changes.push(`role changed: "${oldNode.role}" → "${newNode.role}"`);
  }
  if (oldNode.type !== newNode.type) {
    changes.push(`type changed: "${oldNode.type}" → "${newNode.type}"`);
  }
  if (oldNode.name !== newNode.name) {
    changes.push(`name changed: "${oldNode.name}" → "${newNode.name}"`);
  }
  if (JSON.stringify(oldNode.layout) !== JSON.stringify(newNode.layout)) {
    changes.push(`layout changed`);
  }
  if (JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props)) {
    changes.push(`props changed`);
  }
  if (JSON.stringify(oldNode.data) !== JSON.stringify(newNode.data)) {
    changes.push(`data bindings changed`);
  }
  if (JSON.stringify(oldNode.interactions) !== JSON.stringify(newNode.interactions)) {
    changes.push(`interactions changed`);
  }

  const oldChildIds = (oldNode.children || []).map((c) => c.id);
  const newChildIds = (newNode.children || []).map((c) => c.id);
  const addedChildren = newChildIds.filter((id) => !oldChildIds.includes(id));
  const removedChildren = oldChildIds.filter((id) => !newChildIds.includes(id));
  if (addedChildren.length > 0) changes.push(`${addedChildren.length} children added`);
  if (removedChildren.length > 0) changes.push(`${removedChildren.length} children removed`);

  return changes;
}

export function diffDesignASTs(oldAST: DesignAST, newAST: DesignAST): DiffResult {
  const affectedScreenIds = new Set<string>();

  const oldScreenMap = new Map(oldAST.screens.map((s) => [s.id, s]));
  const newScreenMap = new Map(newAST.screens.map((s) => [s.id, s]));

  const addedScreens = newAST.screens.filter((s) => !oldScreenMap.has(s.id));
  const removedScreens = oldAST.screens.filter((s) => !newScreenMap.has(s.id));
  const modifiedScreens: Array<{ screenId: string; name: string; changes: string[] }> = [];

  for (const [id, newScreen] of newScreenMap) {
    const oldScreen = oldScreenMap.get(id);
    if (!oldScreen) continue;
    const changes: string[] = [];
    if (oldScreen.name !== newScreen.name) changes.push(`name: "${oldScreen.name}" → "${newScreen.name}"`);
    if (oldScreen.rootNodeId !== newScreen.rootNodeId) changes.push(`rootNodeId changed`);
    if (changes.length > 0) {
      modifiedScreens.push({ screenId: id, name: newScreen.name, changes });
      affectedScreenIds.add(id);
    }
  }

  addedScreens.forEach((s) => affectedScreenIds.add(s.id));
  removedScreens.forEach((s) => affectedScreenIds.add(s.id));

  const oldRouteMap = new Map(oldAST.routes.map((r) => [r.id, r]));
  const newRouteMap = new Map(newAST.routes.map((r) => [r.id, r]));

  const addedRoutes = newAST.routes.filter((r) => !oldRouteMap.has(r.id));
  const removedRoutes = oldAST.routes.filter((r) => !newRouteMap.has(r.id));
  const modifiedRoutes: Array<{ routeId: string; changes: string[] }> = [];

  for (const [id, newRoute] of newRouteMap) {
    const oldRoute = oldRouteMap.get(id);
    if (!oldRoute) continue;
    const changes: string[] = [];
    if (oldRoute.path !== newRoute.path) changes.push(`path: "${oldRoute.path}" → "${newRoute.path}"`);
    if (oldRoute.screenId !== newRoute.screenId) changes.push(`screenId changed`);
    if (oldRoute.layout !== newRoute.layout) changes.push(`layout changed`);
    if (changes.length > 0) {
      modifiedRoutes.push({ routeId: id, changes });
      affectedScreenIds.add(newRoute.screenId);
    }
  }

  const oldNodeMap = flattenNodes(oldAST.nodes);
  const newNodeMap = flattenNodes(newAST.nodes);

  const addedNodeIds = [...newNodeMap.keys()].filter((id) => !oldNodeMap.has(id));
  const removedNodeIds = [...oldNodeMap.keys()].filter((id) => !newNodeMap.has(id));
  const roleChanged: Array<{ nodeId: string; from: string; to: string }> = [];
  const propsChanged: string[] = [];
  const layoutChanged: string[] = [];

  for (const [id, newNode] of newNodeMap) {
    const oldNode = oldNodeMap.get(id);
    if (!oldNode) continue;

    if (oldNode.role !== newNode.role) {
      roleChanged.push({ nodeId: id, from: oldNode.role, to: newNode.role });
      const screenId = findScreenForNode(newAST, id);
      if (screenId) affectedScreenIds.add(screenId);
    }
    if (JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props)) {
      propsChanged.push(id);
      const screenId = findScreenForNode(newAST, id);
      if (screenId) affectedScreenIds.add(screenId);
    }
    if (JSON.stringify(oldNode.layout) !== JSON.stringify(newNode.layout)) {
      layoutChanged.push(id);
      const screenId = findScreenForNode(newAST, id);
      if (screenId) affectedScreenIds.add(screenId);
    }
  }

  for (const nodeId of addedNodeIds) {
    const screenId = findScreenForNode(newAST, nodeId);
    if (screenId) affectedScreenIds.add(screenId);
  }
  for (const nodeId of removedNodeIds) {
    const screenId = findScreenForNode(oldAST, nodeId);
    if (screenId) affectedScreenIds.add(screenId);
  }

  const totalChanges =
    addedScreens.length + removedScreens.length + modifiedScreens.length +
    addedRoutes.length + removedRoutes.length + modifiedRoutes.length +
    addedNodeIds.length + removedNodeIds.length +
    roleChanged.length + propsChanged.length + layoutChanged.length;

  return {
    screens: { added: addedScreens, removed: removedScreens, modified: modifiedScreens },
    routes: { added: addedRoutes, removed: removedRoutes, modified: modifiedRoutes },
    nodes: { added: addedNodeIds, removed: removedNodeIds, roleChanged, propsChanged, layoutChanged },
    summary: { totalChanges, affectedScreenIds: [...affectedScreenIds] },
  };
}

function formatDiffReport(diff: DiffResult, oldAST: DesignAST, newAST: DesignAST): string {
  const lines: string[] = [
    `# Design Diff Report`,
    ``,
    `**Old:** ${oldAST.meta.appName} (generated ${oldAST.meta.generatedAt})`,
    `**New:** ${newAST.meta.appName} (generated ${newAST.meta.generatedAt})`,
    ``,
    `## Summary`,
    ``,
    `- **Total changes:** ${diff.summary.totalChanges}`,
    `- **Affected screens:** ${diff.summary.affectedScreenIds.length}`,
    ``,
  ];

  if (diff.screens.added.length > 0) {
    lines.push(`## Added Screens`);
    diff.screens.added.forEach((s) => lines.push(`- ${s.name} (${s.id})`));
    lines.push(``);
  }

  if (diff.screens.removed.length > 0) {
    lines.push(`## Removed Screens`);
    diff.screens.removed.forEach((s) => lines.push(`- ${s.name} (${s.id})`));
    lines.push(``);
  }

  if (diff.screens.modified.length > 0) {
    lines.push(`## Modified Screens`);
    diff.screens.modified.forEach((s) => {
      lines.push(`- **${s.name}** (${s.screenId})`);
      s.changes.forEach((c) => lines.push(`  - ${c}`));
    });
    lines.push(``);
  }

  if (diff.routes.added.length > 0 || diff.routes.removed.length > 0 || diff.routes.modified.length > 0) {
    lines.push(`## Route Changes`);
    diff.routes.added.forEach((r) => lines.push(`- Added: ${r.path} → ${r.screenId}`));
    diff.routes.removed.forEach((r) => lines.push(`- Removed: ${r.path}`));
    diff.routes.modified.forEach((r) => {
      lines.push(`- Modified: ${r.routeId}`);
      r.changes.forEach((c) => lines.push(`  - ${c}`));
    });
    lines.push(``);
  }

  if (diff.nodes.added.length > 0 || diff.nodes.removed.length > 0) {
    lines.push(`## Node Changes`);
    if (diff.nodes.added.length > 0) lines.push(`- **${diff.nodes.added.length}** nodes added`);
    if (diff.nodes.removed.length > 0) lines.push(`- **${diff.nodes.removed.length}** nodes removed`);
    if (diff.nodes.roleChanged.length > 0) {
      lines.push(`- **${diff.nodes.roleChanged.length}** role changes:`);
      diff.nodes.roleChanged.forEach((c) => lines.push(`  - ${c.nodeId}: "${c.from}" → "${c.to}"`));
    }
    if (diff.nodes.propsChanged.length > 0) lines.push(`- **${diff.nodes.propsChanged.length}** prop changes`);
    if (diff.nodes.layoutChanged.length > 0) lines.push(`- **${diff.nodes.layoutChanged.length}** layout changes`);
    lines.push(``);
  }

  if (diff.summary.affectedScreenIds.length > 0) {
    lines.push(`## Screens to Regenerate`);
    lines.push(``);
    for (const screenId of diff.summary.affectedScreenIds) {
      const screen = newAST.screens.find((s) => s.id === screenId) ||
                     oldAST.screens.find((s) => s.id === screenId);
      lines.push(`- ${screen?.name || screenId} (\`${screenId}\`)`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}

export async function diffCommand(opts: {
  old: string;
  new: string;
  out?: string;
}): Promise<void> {
  console.log(`[scalar-design-sync] diff`);
  console.log(`  old: ${opts.old}`);
  console.log(`  new: ${opts.new}`);

  const oldAST: DesignAST = await fs.readJson(opts.old);
  const newAST: DesignAST = await fs.readJson(opts.new);

  const diff = diffDesignASTs(oldAST, newAST);
  const report = formatDiffReport(diff, oldAST, newAST);

  console.log();
  console.log(report);

  if (opts.out) {
    const reportsDir = path.join(opts.out, "reports");
    await fs.ensureDir(reportsDir);
    const reportPath = path.join(reportsDir, "diff-report.md");
    await fs.writeFile(reportPath, report, "utf-8");
    console.log(`\nDiff report saved to: ${reportPath}`);
  }

  if (diff.summary.totalChanges === 0) {
    console.log("\nNo changes detected between the two exports.");
  } else {
    console.log(`\n${diff.summary.totalChanges} total changes affecting ${diff.summary.affectedScreenIds.length} screen(s).`);
    if (diff.summary.affectedScreenIds.length > 0) {
      console.log(`Run 'pull' with --screens flag to selectively regenerate affected screens.`);
    }
  }
}
