# scalar-design-sync

CLI tool that reads Figma design export JSON files and generates React scaffold code, including screens, components, types, and routes. Supports merge-safe regeneration that preserves manual edits.

## Setup

```bash
# From the monorepo root
npm install
npm run build:core
npm run build:sync
```

## Commands

### `pull` — Generate React scaffolds

```bash
node dist/index.js pull \
  --design <path-to-design.export.json> \
  --out <output-directory> \
  --registry <optional-path-to-registry.json>
```

Generates:
- `src/screens/generated/*.generated.tsx` — React screen components
- `src/components/generated/*.generated.tsx` — Form, table, card grid components
- `src/types/generated/models.generated.ts` — TypeScript model interfaces
- `src/routes/generated.tsx` — Route configuration with lazy loading

Returns a machine-readable `PullReport` with:
- `generatedFiles` — list of files written
- `updatedScreens` — screen names that were regenerated
- `unmappedRoles` — roles not found in the registry
- `warnings` — human-readable warning messages

### `validate` — Validate design export

```bash
node dist/index.js validate \
  --design <path-to-design.export.json> \
  --registry <optional-path-to-registry.json>
```

Checks for:
- Missing roles on nodes
- Missing node IDs
- Broken screen → rootNode references
- Unmapped roles (when registry provided)
- Broken interaction targets

### `report` — Coverage report

```bash
node dist/index.js report \
  --design <path-to-design.export.json> \
  --registry <optional-path-to-registry.json> \
  --out <optional-output-directory>
```

### `diff` — Compare two design exports

```bash
node dist/index.js diff \
  --old <path-to-old-export.json> \
  --new <path-to-new-export.json> \
  --out <optional-output-directory>
```

### `watch` — Watch and auto-regenerate

```bash
node dist/index.js watch \
  --design <path-to-design.export.json> \
  --out <output-directory> \
  --registry <optional-path-to-registry.json>
```

Monitors the design export file and re-runs `pull` whenever it changes. Useful with the dev bridge for live regeneration.

## Merge Engine

Generated files use `@scalar-generated-start/end` markers with SHA-256 checksums. The merge engine:
- Preserves manual code below the `@scalar-generated-end` marker
- Detects unchanged generated blocks and skips them
- Reports merge strategy: `new`, `regenerated`, `merged-preserved`, `conflict-overwritten`

## Registry

The registry maps semantic AST roles to DS/Scalar React components:

```json
{ "role": "button.primaryAction", "component": "Button", "importPath": "@scalar/ui/Button" }
{ "role": "table.data", "component": "DataTable", "importPath": "@scalar/ui/DataTable" }
```

## Features

- Full screen, component, type, and route generation
- Merge-safe regeneration preserving manual edits
- Coverage reports and validation
- Design diff between exports
- Watch mode for live regeneration
- Machine-readable pull report for programmatic use (dev bridge integration)
