# scalar-product-platform

A unified monorepo for generating, designing, and syncing SaaS product scaffolds — from natural language prompt to deployed React code.

## Architecture

```
Prompt
  → scalar-product-generator-core   (parse prompt → SaaS Brief → Design AST)
  → figma-scalar-plugin              (render AST as Figma layouts)
  → hi-fi upgrade                    (apply DS/Scalar styles + component hints)
  → direct sync to React             (plugin → dev bridge → scaffold generation)
  OR: design export JSON             (manual export → scalar-design-sync CLI)
  → scalar-design-sync               (generates React screens, types, routes)
```

## Packages

| Package | Purpose |
|---------|---------|
| `scalar-product-generator-core` | Shared types, prompt parser (GPT-4.1-mini + regex fallback), AST generator, pattern registry |
| `figma-scalar-plugin` | Figma plugin: generates low-fi wireframes, applies hi-fi styles, exports Design AST, syncs directly to React |
| `scalar-design-sync` | CLI that reads design exports and generates React scaffold code with merge-safe regeneration |
| `scalar-dev-bridge` | Local Express server bridging the Figma plugin to scalar-design-sync for direct sync |
| `scalar-ui` | DS/Scalar React component library (Button, Sidebar, DataTable, Charts, etc.) |

## Quick Start

```bash
# Install all dependencies
npm install

# Build everything (core → sync → bridge → plugin)
npm run build:all

# Start the dev bridge (required for direct Figma → React sync)
npm run dev:bridge

# In a separate terminal, watch the plugin for development
npm run dev:plugin
```

## Direct Sync Workflow (Figma → React)

1. Start the dev bridge: `npm run dev:bridge`
2. Open the Figma plugin in Figma Desktop
3. Generate a layout from a prompt, or open an existing design
4. Click **Sync to React** in the plugin UI
5. The plugin exports the design, sends it to `localhost:4311`, and the bridge runs `scalar-design-sync pull` to generate React scaffolds

## CLI Workflow (Manual)

```bash
# Build core and sync
npm run build:core
npm run build:sync

# Generate from a design export file
node scalar-design-sync/dist/index.js pull \
  --design examples/design.export.json \
  --out ./test-output

# Validate a design export
node scalar-design-sync/dist/index.js validate \
  --design examples/design.export.json

# Watch for changes and auto-regenerate
node scalar-design-sync/dist/index.js watch \
  --design examples/design.export.json \
  --out ./test-output

# Generate a coverage report
node scalar-design-sync/dist/index.js report \
  --design examples/design.export.json \
  --out ./test-output

# Diff two design exports
node scalar-design-sync/dist/index.js diff \
  --old examples/design.export.old.json \
  --new examples/design.export.json
```

## Root Scripts

| Script | Description |
|--------|-------------|
| `build:all` | Build core → sync → bridge → plugin in order |
| `build:core` | Build scalar-product-generator-core |
| `build:sync` | Build scalar-design-sync |
| `build:bridge` | Build scalar-dev-bridge |
| `build:plugin` | Build figma-scalar-plugin |
| `dev:bridge` | Start the dev bridge server on localhost:4311 |
| `dev:plugin` | Watch-mode build for the Figma plugin |

## Design System

- **Name:** DS/Scalar
- **Frontend target:** React
- **Modes:** Low-fi wireframes → Hi-fi styled layouts

## Project Structure

```
scalar-product-platform/
├── package.json                          # Root workspace config + scripts
├── examples/
│   ├── prompt.txt                        # Sample prompt
│   └── design.export.json                # Sample design export for CLI testing
├── scalar-product-generator-core/        # Prompt parser + AST generator
├── figma-scalar-plugin/                  # Figma plugin (generate, export, hifi, sync)
│   ├── code.ts                           # Thin entrypoint
│   ├── src/
│   │   ├── controller/                   # Message dispatch
│   │   ├── services/                     # Generate, export, hifi, sync services
│   │   ├── messaging/                    # Typed message contracts
│   │   ├── state/                        # Plugin state management
│   │   ├── renderer/                     # AST → Figma renderer
│   │   ├── export/                       # Figma → Design AST exporter
│   │   └── sync/                         # Dev bridge client + change detection
│   ├── renderer/                         # Legacy renderer (kept for compatibility)
│   ├── exporter/                         # Legacy exporter (kept for compatibility)
│   └── hifi/                             # Hi-fi component registry + swap engine
├── scalar-design-sync/                   # CLI: design export → React scaffolds
│   ├── src/commands/                     # pull, validate, report, diff, watch
│   ├── src/generators/                   # Screen, component, type, route generators
│   └── registry/                         # Role → React component mapping
├── scalar-dev-bridge/                    # Local Express server for direct sync
│   └── src/
│       ├── routes/                       # /sync, /validate endpoints
│       └── services/                     # Pull runner, validator, file reporter
└── scalar-ui/                            # DS/Scalar React component library
```

## Generated Output Structure

```
output/
├── src/
│   ├── screens/
│   │   └── generated/                    # *.generated.tsx — DO NOT EDIT generated blocks
│   ├── components/
│   │   └── generated/                    # *.generated.tsx — component scaffolds
│   ├── types/
│   │   └── generated/                    # models.generated.ts
│   └── routes/
│       └── generated.tsx                 # Route configuration
```

Files use `@scalar-generated-start/end` markers and checksums. Manual code below the markers is preserved across regenerations.

## TODOs

- [ ] Full DS/Scalar library swap (replace placeholders with real Figma component instances)
- [ ] Bidirectional code-to-design diff
- [ ] Richer AST-to-React renderer (props, data bindings, state variants)
- [ ] Auth for non-local sync
- [ ] Unit tests for all packages
