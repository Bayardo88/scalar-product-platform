# figma-scalar-plugin

A Figma plugin that generates low-fi wireframe layouts from natural language prompts, applies hi-fi DS/Scalar styles, exports Design AST JSON, and syncs directly to React codebases via a local dev bridge.

## Architecture

```
code.ts (thin entrypoint)
  → src/controller/plugin-controller.ts (message dispatch)
    → src/services/generate-service.ts     (prompt → brief → AST → render)
    → src/services/export-service.ts       (Figma → Design AST JSON)
    → src/services/hifi-upgrade-service.ts (low-fi → hi-fi style swap)
    → src/services/sync-service.ts         (export + send to dev bridge)
```

### Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| Entrypoint | `code.ts` | Shows UI, delegates to controller |
| Controller | `src/controller/` | Receives UI messages, dispatches to services |
| Services | `src/services/` | Business logic (generate, export, hifi, sync) |
| Messaging | `src/messaging/` | Typed message contracts (UI ↔ plugin) |
| State | `src/state/` | Plugin state management |
| Renderer | `src/renderer/` | AST → Figma node rendering |
| Export | `src/export/` | Figma → Design AST extraction |
| Sync | `src/sync/` | Dev bridge client + change detection |

## Setup

```bash
# From the monorepo root
npm install
npm run build:core
npm run build:plugin
```

## Development

1. Build the plugin: `npm run build:plugin` (from root)
2. In Figma Desktop → Plugins → Development → Import plugin from manifest
3. Point to `figma-scalar-plugin/manifest.json`
4. Run the plugin from the Plugins menu

For watch mode: `npm run dev:plugin` (from root)

## Direct Sync to React

1. Start the dev bridge: `npm run dev:bridge` (from root)
2. In the plugin UI, click **Sync to React**
3. The plugin exports the current design, sends it to `localhost:4311/sync`, and the bridge generates React scaffolds

The plugin also supports **Validate Sync** to check the design export for issues before syncing.

## Message Types

| Message | Direction | Description |
|---------|-----------|-------------|
| `generate` | UI → Plugin | Parse prompt and render layout |
| `export` | UI → Plugin | Export Design AST JSON |
| `hifi-swap` | UI → Plugin | Apply DS/Scalar hi-fi styles |
| `sync-react` | UI → Plugin | Export and sync to React via dev bridge |
| `validate-sync` | UI → Plugin | Export and validate via dev bridge |

## PluginData Keys

Every generated Figma node stores metadata via `pluginData`:

| Key | Description |
|-----|-------------|
| `astId` | Unique AST node identifier |
| `role` | Semantic role (e.g. `button.primaryAction`) |
| `screenId` | Parent screen identifier |
| `dataBind` | Data binding expression |
| `entity` | Entity name for data binding |
| `field` | Field name for data binding |
| `state` | UI state variant |
| `componentHint` | DS/Scalar component name hint |
| `codeComponentHint` | Full import path hint for code generation |

## Features

- Natural language prompt → low-fi wireframe generation
- Hi-fi DS/Scalar style upgrade with component hints
- Design AST export with diagnostics
- Direct sync to React via local dev bridge
- Change detection to skip identical re-syncs
- Typed message contracts between UI and plugin sandbox
