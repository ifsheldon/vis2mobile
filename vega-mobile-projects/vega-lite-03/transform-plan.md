# Plan for Transforming Penguin Body Mass Visualization

## 1. Data Extraction & Codification

I have analyzed the provided `desktop.html` and extracted the following data structure. This is **real data** derived directly from the `spec.data.values` JSON object in the source code.

The data represents statistical distributions (min, q1, median, q3, max, outliers) for three penguin species.

**Data Interface:**
```typescript
interface BoxPlotData {
  species: string;
  min: number; // 'lower' in original
  q1: number;
  median: number;
  q3: number;
  max: number; // 'upper' in original
  outliers: number[];
  color: string; // Mapping derived from original implicit color scale
}
```

**Extracted Dataset:**
```typescript
export const PENGUIN_DATA: BoxPlotData[] = [
  {
    species: "Adelie",
    min: 2850,
    q1: 3350,
    median: 3700,
    q3: 4000,
    max: 4775,
    outliers: [],
    color: "#4c78a8" // Standard Vega-Lite blue
  },
  {
    species: "Chinstrap",
    min: 2700,
    q1: 3487.5,
    median: 3700,
    q3: 3950,
    max: 4800,
    outliers: [2700, 4800], // Note: 2700 is also min, 4800 is also max in dataset, handled specifically
    color: "#f58518" // Standard Vega-Lite orange
  },
  {
    species: "Gentoo",
    min: 3950,
    q1: 4700,
    median: 5000,
    q3: 5500,
    max: 6300,
    outliers: [],
    color: "#e45756" // Standard Vega-Lite red
  }
];
```

## 2. Desktop Analysis & Mobile Design Reasoning

### Desktop Visualization Analysis
- **Layout**: Horizontal Boxplot. Species on Y-axis, Body Mass on X-axis.
- **Aspect Ratio**: Landscape (approx 16:9).
- **Issues on Mobile**:
    1.  **Squashed Scale**: When rendering horizontally on a portrait screen (as seen in `desktop_on_mobile.png`), the X-axis (Body Mass) becomes extremely short. This makes it impossible to visually compare the width of the boxes (interquartile range) or see subtle differences in medians.
    2.  **Small Targets**: The outliers (circles) and thin whisker lines are hard to see and interact with on a high-DPI small screen.
    3.  **Readability**: Axis labels (numbers) crowd together when the width is reduced.

### Planned Design Actions
Based on the `mobile-vis-design-action-space.md`, I propose the following high-level transformation plan:

| Component Level | Current State | Mobile Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L2 Coordinate System** | Horizontal (X=Val, Y=Cat) | **Transpose Axes** | **Critical Action.** Switch to Vertical Boxplots (X=Species, Y=Mass). Vertical layout aligns with the natural portrait aspect ratio of mobile phones, allowing the "Mass" axis to span the full height of the component for better resolution and comparison. |
| **L0 Container** | Fixed width/margin | **Rescale (Fluid)** | Set `width: 100%` and use a tall aspect ratio (e.g., `h-[400px]` or `aspect-[3/4]`) to fill the card. |
| **L4 Data Marks (Box)** | Standard Bars | **Rescale & Style** | Increase the width of the boxes and whiskers to ensure they are touch-friendly. Apply Glassmorphism (gradients/blur) to elevate aesthetics ("Premium" requirement). |
| **L5 Interaction** | Hover Tooltips | **Fix Tooltip Position** | Use a "Click-to-Select" interaction model. When a user taps a specific species column, display detailed statistics (Min, Max, Median) in a fixed card at the bottom or top, rather than a floating tooltip that gets blocked by the finger. |
| **L3 Axes** | Standard Ticks | **Decimate Ticks** | Reduce the number of Y-axis ticks (Mass) to prevent clutter. Remove axis lines (`stroke: none`) for a cleaner look, keeping only gridlines. |
| **L4 Outliers** | Small points | **Recompose (Flatten)** | Outliers will be rendered as a separate Scatter layer within the ComposedChart to allow distinct styling and interactions. |
| **L3 Title** | Simple Text | **Reposition & Style** | Move title to a dedicated header card with a subtitle explaining the unit (g), removing the need for a separate Axis Title. |

### Justification for Transpose
The action `Transpose Axes` is chosen over `Rescale` (shrinking the horizontal chart) because **comparison** is the main goal. Comparing heights of side-by-side vertical columns is cognitively easier on a narrow screen than comparing lengths of stacked horizontal bars that are squashed.

## 3. Implementation Steps

1.  **Scaffold Component**: Create `src/components/Visualization.tsx` using a card-based layout with TailwindCSS classes for glassmorphism (e.g., `bg-white/10`, `backdrop-blur-md`).
2.  **Prepare Recharts Data**:
    - Flatten the `outliers` data. Create a secondary dataset for the Scatter plot layer: `[{ x: 'Chinstrap', y: 2700 }, { x: 'Chinstrap', y: 4800 }]`.
3.  **Construct `ComposedChart`**:
    - **Orientation**: Vertical (default Recharts behavior).
    - **XAxis**: `dataKey="species"`. Custom tick renderer to ensure readable font sizes.
    - **YAxis**: Range `[2500, 6500]` (auto-adjusted) to zoom in on the relevant data range rather than starting from 0.
    - **Custom Shape**: Create a `CustomBoxPlot` component passed to the `shape` prop of a `<Bar />` (or `<Customized />`). This component will draw:
        - The "Whisker" lines (min to q1, q3 to max).
        - The "Box" rect (q1 to q3) with gradient fill.
        - The "Median" line (strong contrast).
    - **Scatter Layer**: Add `<Scatter />` for the outliers, ensuring they align with the category X-axis.
4.  **Premium Styling**:
    - Use Tailwind colors matching the original palette but with gradients.
    - Add layout animations (Framer Motion) for initial load.
    - Typography: Use bold, legible fonts for values.
5.  **Interaction Layer**:
    - Add `onClick` handler to the Bar/Chart.
    - State: `activeSpecies` (string | null).
    - Render a "Details Panel" below the chart when a species is active, showing the exact numerical values for Min, Q1, Median, Q3, Max.

This plan ensures the visualization is not just a shrunk desktop chart, but a re-imagined mobile experience that preserves the statistical integrity of the original boxplot.