# scalar-dev-bridge

A lightweight local Node.js + Express server that bridges the Figma Scalar plugin to React codebases by receiving design exports and running `scalar-design-sync` to generate scaffolds.

## Setup

```bash
# From the monorepo root
npm install
npm run build:core
npm run build:sync
npm run build:bridge
```

## Usage

```bash
# Start the bridge (default: localhost:4311)
npm run dev:bridge

# Or from this package directory
npm run dev
# or
npm start  # (requires build first)
```

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{ "status": "ok", "uptime": 42 }
```

### `POST /sync`

Receives a Design AST JSON payload, writes it to a temp file, runs `scalar-design-sync pull`, and returns the result.

**Request body:** Full `DesignAST` JSON (same shape as the Figma plugin export)

**Response:**
```json
{
  "ok": true,
  "generatedFiles": ["src/screens/generated/Dashboard.generated.tsx", "..."],
  "warnings": ["Role \"custom.widget\" found in design but not mapped in registry"],
  "exportHash": "a1b2c3d4e5f6g7h8"
}
```

Duplicate exports (same hash) are detected and skipped.

### `POST /validate`

Validates a Design AST export for structural integrity and registry coverage.

**Request body:** Full `DesignAST` JSON

**Response:**
```json
{
  "ok": true,
  "errors": [],
  "warnings": ["Role \"custom.widget\" not mapped"]
}
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `SCALAR_BRIDGE_PORT` | `4311` | Port to listen on |
| `SCALAR_OUTPUT_DIR` | `.scalar-sync/output` | Output directory for generated files |

## File Storage

The bridge stores temporary files and reports under `.scalar-sync/`:

```
.scalar-sync/
├── tmp/                    # Temporary design export files
├── output/                 # Generated React scaffolds (default)
│   └── src/
│       ├── screens/generated/
│       ├── components/generated/
│       ├── types/generated/
│       └── routes/
└── reports/                # Sync report JSON files
```

## Integration with Figma Plugin

The Figma plugin communicates with the bridge automatically when the user clicks **Sync to React** or **Validate Sync**. The plugin:

1. Exports the current Figma design to a Design AST
2. Computes a hash to detect unchanged designs
3. Sends the AST to `POST /sync` or `POST /validate`
4. Displays the result in the plugin UI

The bridge must be running locally for the sync to work. The plugin checks `/health` before attempting sync and provides a helpful error message if the bridge is unreachable.
