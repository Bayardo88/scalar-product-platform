# scalar-design-sync

CLI tool that reads Figma design export JSON files and generates React scaffold code, including screens, types, and routes.

## Setup

```bash
# From the monorepo root
npm install
npm run build -w scalar-product-generator-core
npm run build -w scalar-design-sync
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
- `src/types/generated/models.generated.ts` — TypeScript model interfaces
- `src/routes/generated.tsx` — Route configuration

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

Reports:
- Total screens, routes, nodes
- Unique roles and usage counts
- Mapped vs unmapped roles
- Coverage percentage

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | CLI entry point (commander) |
| `src/commands/pull.ts` | Pull command implementation |
| `src/commands/validate.ts` | Validate command implementation |
| `src/commands/report.ts` | Report command implementation |
| `src/generators/screens.ts` | React screen component generator |
| `src/generators/types.ts` | TypeScript model/type generator |
| `src/generators/routes.ts` | Route configuration generator |
| `registry/registry.scalar.react.json` | Role → React component mapping |

## Registry

The registry maps semantic AST roles to DS/Scalar React components:

```json
{ "role": "button.primaryAction", "component": "Button", "importPath": "@scalar/ui/Button" }
{ "role": "table.data", "component": "DataTable", "importPath": "@scalar/ui/DataTable" }
```

## Already Implemented

- Full `pull` command with screen, type, and route generation
- `validate` command with structural and semantic checks
- `report` command with coverage metrics
- Registry-based component mapping
- PascalCase naming and `.generated.tsx` suffix convention

## TODO

- [ ] Component-level code generation (not just screen shells)
- [ ] Support for custom templates/overrides
- [ ] Watch mode for live re-generation
- [ ] Diff mode to show changes between exports
- [ ] Integration with `@scalar/ui` component library
