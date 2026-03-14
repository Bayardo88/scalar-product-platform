# figma-scalar-plugin

A Figma plugin that generates low-fi wireframe layouts from natural language prompts, powered by `scalar-product-generator-core`.

## How It Works

1. User enters a product prompt in the plugin UI
2. Plugin parses the prompt into a SaaS App Brief via the core package
3. Brief is converted to a Design AST
4. AST is rendered as Figma frames/text on the current page
5. Each generated node stores metadata (astId, role, screenId, dataBind) as pluginData

## Setup

```bash
# From the monorepo root
npm install
npm run build -w scalar-product-generator-core
npm run build -w figma-scalar-plugin
```

## Development

1. Build the plugin: `npm run build -w figma-scalar-plugin`
2. In Figma Desktop → Plugins → Development → Import plugin from manifest
3. Point to `figma-scalar-plugin/manifest.json`
4. Run the plugin from the Plugins menu

For watch mode during development:
```bash
npm run watch -w figma-scalar-plugin
```

## Key Files

| File | Purpose |
|------|---------|
| `manifest.json` | Figma plugin configuration |
| `ui.html` | Plugin UI panel (prompt input) |
| `code.ts` | Plugin entry point, message handling |
| `renderer/render-ast.ts` | Top-level AST → Figma renderer |
| `renderer/render-node.ts` | Individual node renderer |
| `renderer/layout.ts` | AST layout → Figma Auto Layout translation |
| `renderer/metadata.ts` | PluginData attachment (astId, role, etc.) |
| `renderer/role-map.ts` | Human-readable labels for roles |
| `renderer/text.ts` | Text node creation and font loading |

## Already Implemented

- Prompt input UI with status feedback
- Full AST rendering pipeline
- Layout translation (stack, grid, padding, gap)
- PluginData metadata on every node
- Role-based fills (sidebar dark, buttons colored, etc.)
- Recursive child rendering

## TODO

- [ ] Design export engine (Figma → design export JSON)
- [ ] Hi-fi DS/Scalar component swap
- [ ] State variant rendering (loading, empty, error)
- [ ] Undo/redo support
- [ ] Bundler setup (esbuild/webpack) for production builds
