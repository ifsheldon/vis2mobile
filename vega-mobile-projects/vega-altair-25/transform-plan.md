# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Analysis
- **Content**: The visualization explores a movies dataset (`movies.json`).
- **Structure**: It consists of two vertically concatenated views (`vconcat`).
  1.  **Top View (Heatmap + Scatter)**:
      -   **X-Axis**: IMDB Rating (Quantitative, Binned).
      -   **Y-Axis**: Rotten Tomatoes Rating (Quantitative, Binned).
      -   **Layer 1 (Background)**: A Rectangular Heatmap showing the density (count) of *all* records. Color scheme: Green-Blue.
      -   **Layer 2 (Foreground)**: A Scatter plot showing specific records based on the selection from the bottom chart.
  2.  **Bottom View (Bar Chart)**:
      -   **X-Axis**: Major Genre (Nominal).
      -   **Y-Axis**: Count (Quantitative).
      -   **Interaction**: Selecting a bar filters the top view.
- **Interaction Model**: Cross-filtering. Clicking a genre in the bar chart highlights movies of that genre in the top ratings chart.

### Mobile Constraints & Issues
- **Bar Chart Layout**: The desktop bar chart puts "Major Genre" on the X-axis. There are many genres. On a narrow mobile screen, these labels will severely overlap or become unreadable (Requires **Transpose**).
- **Heatmap Detail**: The heatmap relies on recognizing density patterns. On mobile, the `viewBox` shrinking might make bins too small to see. The legend for the heatmap is likely to squeeze the chart content horizontally if kept on the right (Requires **Reposition**).
- **Touch Targets**: Bars on a compressed X-axis would be too thin for reliable touch interaction (Fat-finger problem).
- **Vertical Space**: Stacking two charts vertically is good for mobile scrolling, but the headers and axes need to be compact.

## 2. Design Action Space Planning

Based on the `mobile-vis-design-action-space.md`, here is the plan to transform the visualization.

### High-Level Actions

1.  **L0 Visualization Container: Rescale & Reposition**
    -   **Action**: Use a fluid layout (`width: 100%`) with a scrollable container.
    -   **Reasoning**: Mobile screens vary in height. We will treat the page as a dashboard where the user scrolls between the specific metrics.

2.  **L2 Coordinate System (Bottom Chart): Transpose (Axis-Transpose)**
    -   **Action**: Convert the **Vertical Bar Chart** (Genre on X) to a **Horizontal Bar Chart** (Genre on Y).
    -   **Reasoning**: This is the most critical action. "Major Genre" labels are text-heavy. Horizontal bars allow labels to be read naturally (left-to-right) and provide a large, full-width touch target for filtering. This solves the "Distorted layout" and "Cluttered text" issues found in the `desktop_on_mobile.png`.

3.  **L2 Data Marks (Top Chart): Rescale & Recompose**
    -   **Action (Heatmap)**: Instead of Vega's automatic binning, we will pre-calculate bins in the React component to ensure they map to a responsive grid. We will use a `ScatterChart` with custom square shapes to emulate the heatmap, ensuring the size of squares scales with the screen width.
    -   **Action (Overlay Points)**: The "selected" movies will be rendered as distinct dots over the heatmap squares.

4.  **L3 Legend Block: Reposition & Simplify**
    -   **Action**: Move the "Total Records" color legend from the right side (desktop) to the **top** of the heatmap (mobile), formatted as a gradient bar or a simplified "Low -> High" indicator.
    -   **Reasoning**: Horizontal space is premium on mobile. Side legends compress the chart data area.

5.  **L4 Axis: Simplify & Remove**
    -   **Action (Bar Chart)**: Remove the X-axis (Count) lines and gridlines. Place the numerical count value *inside* or *at the end* of the bar.
    -   **Reasoning**: Cleanliness. The exact count axis takes up vertical space. Direct labeling is more readable on mobile.
    -   **Action (Heatmap)**: Reduce tick count on IMDB (0-10) and Rotten Tomatoes (0-100) axes to prevent label overlap.

6.  **L1 Interaction: Feedback**
    -   **Action**: Implement "Active State" styling. When a Genre bar is tapped, it should glow or change color significantly to indicate it is the active filter.
    -   **Action**: Add a "Reset" button (Floating or fixed) to clear the filter, as clicking "empty space" is harder on mobile.

## 3. Data Extraction Strategy

The source data is a JSON file. I cannot rely on Vega-Lite's internal processing; I must process the raw data in JavaScript/TypeScript.

1.  **Fetch Data**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`
2.  **Processing for Bar Chart (Aggregation)**:
    -   Iterate through the array.
    -   Group by `Major Genre`.
    -   Count records.
    -   Sort by Count (Descending) for better readability in list format.
    -   *Handle Nulls*: Filter out or label 'Unknown' genres.
3.  **Processing for Heatmap (Binning)**:
    -   Define Bin dimensions: IMDB (0-10, step 0.5), Rotten Tomatoes (0-100, step 10).
    -   Create a grid matrix.
    -   Iterate all movies, calculate which bin they fall into, and increment count.
    -   Map count to a color scale (Green-Blue).
4.  **Processing for Interaction (Filtering)**:
    -   Keep the raw array in state.
    -   When a genre is selected, filter the raw array to get the subset of movies.
    -   Pass this subset to the Heatmap's second layer (Scatter).

## 4. Implementation Detailed Steps

### Step 1: Component Structure
-   **Header**: Title "Movie Ratings Analysis" with a glassmorphism effect.
-   **Section 1: Rating Distribution (Heatmap)**
    -   Container with fixed aspect ratio (Square-ish).
    -   Recharts `ComposedChart`.
    -   **Series A (Background)**: `Scatter` with custom shape (Rectangle). Data = All Binned Data. Color = Scale based on density.
    -   **Series B (Foreground)**: `Scatter` with circle shape. Data = Filtered Movies (Raw Coordinates). Color = Accent color (e.g., Orange/Pink) to contrast with Green-Blue background.
-   **Section 2: Genre Filter (Horizontal Bar Chart)**
    -   Scrollable vertical list.
    -   Recharts `BarChart` (layout="vertical").
    -   **YAxis**: Type="category", dataKey="genre", width={100} (allow space for text).
    -   **Bar**: Custom active state styling.

### Step 2: Styling (Tailwind)
-   **Palette**: Dark mode or deep blue/slate background (`bg-slate-900`) to make the colors pop.
-   **Heatmap Colors**: `scaleSequential` (d3-scale) using `interpolateGnBu` or a custom Tailwind gradient map (Teal to Blue).
-   **Selection Highlight**: Amber or Rose color for selected points to ensure visibility against the Green-Blue map.
-   **Typography**: Inter or system sans-serif. Large, legible headings.

### Step 3: Interaction Logic
-   State: `selectedGenre` (string | null).
-   State: `chartData` (Processed JSON).
-   Event: `onClick` on Bar Chart updates `selectedGenre`.
-   Effect: Updating `selectedGenre` triggers a re-calculation of the "Series B" data for the Heatmap.

### Step 4: Refinement
-   **Tooltip**: Custom mobile-friendly tooltip. Instead of hovering, tapping a point in the heatmap could show movie details (Title, Rating) in a fixed bottom drawer (Action: **Reposition (Fix)**) or a transient toast, but given the density, just showing the overall distribution is the primary goal. We will stick to standard Recharts tooltip for the bars, but perhaps disable specific movie tooltips on the heatmap if it's too crowded, or show a summary.

This plan ensures the visualization is not just a shrunk desktop chart, but a functional mobile application component.