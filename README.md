# scalar-product-platform

A unified monorepo for generating, designing, and syncing SaaS product scaffolds.

## Architecture

```
Prompt
  → scalar-product-generator-core   (parse prompt → SaaS Brief → Design AST)
  → figma-scalar-plugin              (render AST as low-fi Figma layouts)
  → design export JSON               (Figma plugin exports AST back out)
  → scalar-design-sync               (CLI consumes export → generates React scaffolds)
```

## Packages

| Package | Purpose |
|---------|---------|
| `scalar-product-generator-core` | Shared types, prompt parser, AST generator, pattern registry |
| `figma-scalar-plugin` | Figma plugin that renders Design AST as low-fi wireframes |
| `scalar-design-sync` | CLI that reads design exports and generates React scaffold code |

## Quick Start

```bash
# Install all dependencies
npm install

# Build the core package first (other packages depend on it)
npm run build -w scalar-product-generator-core

# Run the example generator
npm run example -w scalar-product-generator-core

# Build the CLI
npm run build -w scalar-design-sync

# Test the CLI against the example export
node scalar-design-sync/dist/index.js pull \
  --design examples/design.export.json \
  --out ./test-output

node scalar-design-sync/dist/index.js validate \
  --design examples/design.export.json

node scalar-design-sync/dist/index.js report \
  --design examples/design.export.json \
  --out ./test-output
```

## Design System

- **Name:** DS/Scalar
- **Frontend target:** React
- **Current mode:** Low-fi wireframes

## Project Structure

```
scalar-product-platform/
├── package.json                          # Root workspace config
├── .gitignore
├── examples/
│   ├── prompt.txt                        # Sample prompt
│   └── design.export.json                # Sample design export for CLI testing
├── scalar-product-generator-core/
│   ├── src/
│   │   ├── types/brief.ts                # SaaSAppBrief type
│   │   ├── types/ast.ts                  # DesignAST / ASTNode types
│   │   ├── patterns/patterns.ts          # Reusable screen patterns
│   │   ├── parser/prompt-to-brief.ts     # Natural language → brief
│   │   └── generator/brief-to-ast.ts     # Brief → Design AST
│   └── examples/generate.ts              # End-to-end example script
├── figma-scalar-plugin/
│   ├── manifest.json                     # Figma plugin manifest
│   ├── ui.html                           # Plugin UI panel
│   ├── code.ts                           # Plugin entry point
│   └── renderer/                         # AST-to-Figma renderer
│       ├── render-ast.ts
│       ├── render-node.ts
│       ├── layout.ts
│       ├── metadata.ts
│       ├── role-map.ts
│       └── text.ts
└── scalar-design-sync/
    ├── src/
    │   ├── index.ts                      # CLI entry point
    │   ├── commands/pull.ts              # Generate React scaffolds
    │   ├── commands/validate.ts          # Validate design exports
    │   ├── commands/report.ts            # Coverage report
    │   └── generators/
    │       ├── screens.ts                # Screen component generator
    │       ├── types.ts                  # TypeScript model generator
    │       └── routes.ts                 # Route config generator
    └── registry/
        └── registry.scalar.react.json    # Role → React component mapping
```

## TODOs for Next Iteration

- [ ] Figma export engine (plugin → design export JSON)
- [ ] Hi-fi DS/Scalar component swap in Figma
- [ ] Richer React rendering from AST nodes (props, data bindings)
- [ ] Sync/diff between design and code (bidirectional)
- [ ] Unit tests for parser, generator, and CLI
- [ ] Component library (`@scalar/ui`) implementation
