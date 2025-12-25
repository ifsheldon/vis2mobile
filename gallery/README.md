# Vis2Mobile: Mobile Visualization Gallery

**Objective**: Transform desktop-oriented static SVG visualizations into premium, mobile-first, interactive React components.

This project focuses on codifying data from static assets and presenting them in a highly polished, responsive gallery.

## 🚀 Core Mission

1. **Transform**: Convert static SVGs (e.g., from PC dashboards) into interactive mobile components.
2. **Codify Data**: Extract and use **real data** from the source SVG (coordinates, colors, labels). **No fake data allowed.**
3. **Mobile-First UX**: Ensure touch-friendliness, readable typography, and responsive layouts.
4. **Premium Aesthetics**: Use modern UI principles (glassmorphism, vibrant palettes, smooth animations) to create a "wow" factor.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Visualization**: Recharts
- **Icons**: Lucide React
- **Linting/Formatting**: Biome
- **Package Manager**: `bun`

## 📂 Project Structure

- `components/`: Contains the interactive chart components (e.g., `SalesChart.tsx`, `SalesLineChart.tsx`).
- `app/preview/[type]/page.tsx`: Standalone mobile preview pages for each chart (iframe targets).
- `app/page.tsx`: **Gallery Dashboard** (Desktop view) that showcases all mobile charts in various device frames.
- `public/`: Stores the original reference SVGs.
- `AGENTS.md`: Technical instructions for agents. Read this before implementing a new visualization.

## 📝 Workflow for New Visualizations

When adding a new example (e.g., `NewChart.svg`):

1. **Analyze**: Study the SVG to understand the data structure, coordinate system, colors, and specific values.
2. **Implement**:
    - Create a new component in `components/`.
    - **Codify the data**: Do not hardcode magic numbers if possible; calculate values based on the SVG coordinate system (like `calculateValue(y)`).
    - Match the colors and style of the original but enhance it for mobile.
3. **Preview**:
    - Create a standalone page: `app/preview/[new-chart]/page.tsx`.
    - Remove dashboard headers/footers from the preview; show only the chart and relevant metrics.
4. **Showcase**:
    - Add a new card to the Gallery Grid in `app/page.tsx`.
    - Include a link to the original SVG stored in `public/`.
5. **Verify**:
    - Run `bun run lint && bun run format && bun run check`.
    - Verify responsiveness and accuracy against the original SVG.

## 💻 Commands

```bash
# Run Development Server
bun dev

# Lint, Format, and Type Check
bun run lint && bun run format && bun run check
```

# Vis2Mobile Python Library

The python library is managed by `uv`. Use `uv sync` to set up the Python environment.
