# @scalar/ui

DS/Scalar React component library. These are the real implementations of the components referenced in the `scalar-design-sync` registry.

## Components

| Component | Role(s) | Description |
|-----------|---------|-------------|
| `Button` | `button.primaryAction`, `button.secondaryAction` | Primary/secondary/ghost/danger buttons |
| `Sidebar` | `navigation.sidebar` | Vertical navigation sidebar |
| `Topbar` | `navigation.topbar` | Top navigation bar |
| `DataTable` | `table.data` | Data table with columns, rows, click handler |
| `SummaryCard` | `card.summary` | KPI card with label, value, trend |
| `AnalyticsChart` | `chart.analytics`, `chart.bar` | Bar chart visualization |
| `LineChart` | `chart.line` | Line chart visualization |
| `PieChart` | `chart.pie` | Pie chart visualization |
| `ActivityFeed` | `feed.activity` | Activity/event feed list |
| `DetailsPanel` | `panel.details` | Key-value detail view |
| `Modal` | `overlay.modal` | Modal dialog with backdrop |
| `Alert` | `alert.error`, `alert.success` | Contextual alert banners |
| `Form` | `form.login`, `form.settings`, `form.container` | Form wrapper |
| `TextInput` | `input.text` | Text input with label |
| `PasswordInput` | `input.password` | Password input |
| `SearchInput` | `input.search` | Search input |
| `Select` | `input.select` | Select dropdown |
| `Tabs` | `navigation.tabs` | Tab navigation |
| `FiltersPanel` | `panel.filters` | Filter controls |
| `CardGrid` | `collection.cards` | Grid layout for cards |

## Setup

```bash
npm install
npm run build
```

## Usage

```tsx
import { Button, DataTable, Sidebar } from "@scalar/ui";

<Button variant="primary" onClick={handleClick}>Save</Button>
<DataTable data={items} onRowClick={handleRowClick} />
```

## Design Tokens

All components use shared tokens from `tokens.ts`:
- `colors` — palette (primary, surface, text, etc.)
- `spacing` — consistent spacing scale
- `radii` — border radius values
- `typography` — font family, sizes, weights
- `shadows` — box shadow values
