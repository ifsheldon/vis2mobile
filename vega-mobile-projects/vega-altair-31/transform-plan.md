# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Material
*   **Type:** Slope Graph (a variation of a line chart designed to show transition between two states).
*   **Data:** Comparative crop yields across two years (1931 vs 1932) for 6 different sites. The data is aggregated using the **Median** of yields from various crop varieties at each site.
*   **Key Information:**
    *   **Trend:** How yields changed per site (Increase/Decrease).
    *   **Rank:** Which site had the highest/lowest yield in each year.
    *   **Magnitude:** The slope indicates the rate of change.
*   **Desktop Layout:**
    *   Standard Cartesian coordinate system.
    *   Legend on the right (takes up horizontal space).
    *   Y-Axis on the left with labels.
    *   Two distinct X-axis points (1931, 1932).

### Mobile Render Issues (observed in `desktop_on_mobile.png`)
1.  **Aspect Ratio Distortion:** The chart becomes extremely tall and narrow, making the slopes steep and difficult to interpret. The "slope" metaphor relies on a balanced aspect ratio (usually closer to 1:1 or 4:3) to visually communicate rate of change.
2.  **Legend Occlusion/Space:** The side-by-side layout (Chart + Legend) squeezes the chart area significantly. On mobile, horizontal space is the scarcest resource.
3.  **Interaction Gap:** Desktop likely relies on mouse hover to trace specific lines. On mobile, with crossing lines ("Spaghetti plot" effect), it is nearly impossible to trace a single site's path with a finger without obscuring the view.
4.  **Small Text:** Axis labels and legend text may become unreadable if simply shrunk.

## 2. High-Level Design & Action Space Plan

To transform this into a premium mobile component, I will apply the following actions from the **Vis2Mobile Design Action Space**:

### L0: Visualization Container
*   **Action: `Rescale`**: Instead of a full-screen vertical stretch, I will use a **card-based container** with a fixed aspect ratio (e.g., 4:3 or 1:1) to preserve the visual integrity of the slopes.
*   **Action: `Reposition`**: Remove "unwanted white space" caused by the default Vega layout.

### L1: Data Model
*   **Action: `Recompose (Aggregate)`**: I must process the raw JSON data to calculate the **median** yield per site per year, replicating the aggregation logic of the original Vega-Lite spec. The raw data provides yields per *variety*, but the chart plots *site* medians.

### L2: Interaction Layer
*   **Action: `Recompose (Replace)` (Triggers)**: Replace `hover` interactions with `click/tap`.
*   **Action: `Focus` (Features)**: Implement a "Focus Mode". Since lines cross, users must be able to tap a Site name (in the legend) or a line to highlight it while dimming others (setting opacity to 0.2 for non-selected items).
*   **Action: `Reposition (Fix)` (Feedback)**: Instead of a floating tooltip that gets blocked by a finger, I will use a **Glassmorphism Detail Card** fixed at the bottom of the visualization or directly above the chart title that updates when a site is selected.

### L3: Legend Block
*   **Action: `Reposition`**: Move the legend from the **right** to the **top** (as a scrollable chip list) or **bottom** (as a grid). This recovers valuable horizontal pixels for the chart itself.
*   **Rationale**: Side legends are anti-patterns on mobile portrait views.

### L3: Axes & Gridlines
*   **Action: `Recompose (Remove)` (Axes)**: Remove the vertical Y-axis line (`domain` line).
*   **Action: `Recompose (Remove)` (Ticks)**: Reduce Y-axis tick count (e.g., only show 0, 20, 40, 60) to reduce clutter, or rely entirely on direct labeling/tooltips for exact values.
*   **Action: `Simplify` (TickLabel)**: Ensure X-axis explicitly shows "1931" and "1932" clearly at the start and end.

### L2: Data Marks (The Lines)
*   **Action: `Compensate (Color)`**: Assign a distinct, accessible color palette. The original colors are standard Vega defaults. I will use a custom palette that looks good in both light/dark modes (though I will default to a premium dark-themed or clean light aesthetic).
*   **Action: `Rescale`**: Increase the stroke width of the lines for better touch targets and visibility. Add "Dots" at the 1931 and 1932 endpoints to clearly mark the values.

## 3. Implementation Steps

### Step 1: Data Processing (The "Hard" Part)
1.  Ingest the raw JSON array.
2.  Group data by `site` and `year`.
3.  Calculate the `median` yield for each group.
4.  Transform into a structure suitable for Recharts:
    ```typescript
    // Target Structure for Recharts
    [
      { year: 1931, 'Crookston': 43.2, 'Duluth': 28.1, ... },
      { year: 1932, 'Crookston': 32.1, 'Duluth': 25.5, ... }
    ]
    ```
    *Note: Recharts handles wide-format data best for multiple lines sharing an X-axis.*

### Step 2: Component Layout (Next.js + Tailwind)
1.  Create a `Visualization` component wrapper.
2.  **Header:** Title "Crop Yield Changes" with a subtitle "Median yield by site (1931 vs 1932)".
3.  **Legend/Filter:** A horizontal scrollable area of "Chips" at the top.
    *   State: `activeSite` (string | null).
    *   Interaction: Tapping a chip toggles highglight for that site.
4.  **Chart Area:**
    *   Use `ResponsiveContainer` from Recharts with a fixed height (e.g., `h-80`).
    *   `<LineChart>` with 6 `<Line>` components (one for each site).
    *   **Key Logic:** Dynamic styling. If `activeSite` is set, all other `<Line>` components get `strokeOpacity={0.1}`, active one gets `strokeWidth={4}`.
5.  **Detail/Insight Block:**
    *   A visually distinct area (maybe glassmorphism style) below the chart that shows the exact delta for the selected site (e.g., "Crookston: ▼ -25%").

### Step 3: Styling & Polish
1.  Use Lucide icons (e.g., `TrendingUp`, `TrendingDown`) in the detail block.
2.  Use a Tailwind color palette (e.g., Slate/Zinc for background, distinct vibrant colors for lines).
3.  Ensure fonts are readable (min 12px for axes, 14px+ for body).

## 4. Data Extraction

I will extract the raw data directly from the HTML `spec.datasets` object.

**Raw Data Sample (to be processed):**
The dataset name is `data-9cc0564cb5591205eeeca8d2429dd11b`.

```json
[
  {"yield": 27, "variety": "Manchuria", "year": 1931, "site": "University Farm"},
  {"yield": 48.86667, "variety": "Manchuria", "year": 1931, "site": "Waseca"},
  ...
]
```

**Processing Logic (Pseudocode for Agent):**
```javascript
const sites = unique(data.map(d => d.site));
const years = [1931, 1932];

const processedData = years.map(year => {
  const row = { year };
  sites.forEach(site => {
    // 1. Filter data for this site and year
    const samples = data.filter(d => d.site === site && d.year === year).map(d => d.yield);
    // 2. Calculate Median
    samples.sort((a, b) => a - b);
    const mid = Math.floor(samples.length / 2);
    const median = samples.length % 2 !== 0 ? samples[mid] : (samples[mid - 1] + samples[mid]) / 2;
    // 3. Assign to row
    row[site] = median;
  });
  return row;
});
```

This logic ensures we are visualizing **real data** faithful to the original aggregation method.