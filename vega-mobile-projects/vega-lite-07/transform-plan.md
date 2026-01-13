# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Characteristics
- **Type:** Layered Histogram / Pareto-style Chart.
- **Data Source:** `movies.json` (IMDB Ratings).
- **Encoding:**
    - **X-Axis:** Binned IMDB Rating (Quantitative).
    - **Layer 1 (Blue):** Cumulative Count (sum of counts up to that bin).
    - **Layer 2 (Yellow/Green):** Absolute Count (frequency in that bin).
- **Visuals:** Two overlapping bar sets. The cumulative bars (blue) act as a background context for the frequency bars (yellow).
- **Desktop UX:** Relies on mouse hover for details (implicit in Vega-lite). Axis labels are small.

### Mobile Issues (Desktop on Mobile)
- **Aspect Ratio:** The 1:1 or landscape ratio wastes vertical screen real estate on mobile.
- **Touch Targets:** The bars, especially for lower ratings (2-4), are small and hard to tap precisely.
- **Readability:** Overlapping bars (opacity) can be confusing on screens with lower contrast or high glare. The "Cumulative" vs "Count" distinction needs a legend or clear labeling which is currently missing/implicit.
- **Axes:** The Y-axis takes up horizontal space.

## 2. Design Action Space & Transformation Strategy

### L0 Visualization Container
- **Action:** `Rescale` (Fit to Width).
    - **Reasoning:** Mobile screens have limited width. The chart must assume 100% of the container width. The height should be fixed (e.g., 350px) to ensure bars are tall enough to interact with.
- **Action:** `Reposition` (Padding).
    - **Reasoning:** Remove default Vega margins. Use Tailwind's padding to ensure the chart doesn't touch the screen edges.

### L1 Data Model
- **Action:** `Recompose (Aggregate)` (Simulate Vega Transform).
    - **Reasoning:** The HTML source contains specific logic (`bin`, `aggregate count`, `window cumulative sum`). To strictly follow "Real Data," we must implement this processing pipeline in the React component (or a utility function) using the raw `movies.json` data.

### L1 Chart Components
- **Action:** `Serialize layout`.
    - **Reasoning:** While we keep the "Layered" concept (Cumulative behind Count), we need to ensure the visual hierarchy is obvious.

### L2 Title Block
- **Action:** `Reposition` (Externalize).
    - **Reasoning:** Move the title "IMDB Rating Distribution" out of the chart canvas into a semantic HTML header (`<h3>`) above the chart for better accessibility and styling control.
- **Action:** `Recompose (Replace)` (Subtitle).
    - **Reasoning:** Add a subtitle explaining the two layers: "Cumulative (Blue) vs. Frequency (Yellow)" to act as a natural legend.

### L2 Coordinate System (Axes)
- **Action:** `Recompose (Remove)` (Y-Axis Line).
    - **Reasoning:** To save horizontal space (L4 Axis Line). We will keep horizontal gridlines for reference but remove the vertical axis line.
- **Action:** `Simplify labels` (X-Axis).
    - **Reasoning:** The bins (2, 4, 6, 8, 10) are readable. We will ensure they don't overlap.

### L2 Data Marks
- **Action:** `Rescale` (Bar Width).
    - **Reasoning:** Increase the visual weight of the bars.
- **Action:** `Recompose (Change Encoding)` (Color/Opacity).
    - **Reasoning:** The original Yellow on Blue creates a "Green" intersection. On mobile, we might use a more modern palette (e.g., a faint primary color for cumulative, and a solid, vibrant primary color for count) or keep the contrast high but visually pleasing (Glassmorphism).

### L2 Interaction
- **Action:** `Triggers` (Touch/Click).
    - **Reasoning:** Replace hover. Tapping anywhere on the chart vertical slice (Cursor) should trigger the tooltip.
- **Action:** `Feedback` (Fix Tooltip Position).
    - **Reasoning:** Use a customized tooltip that renders clearly above the data point or at the top of the chart to avoid finger occlusion.

## 3. Data Extraction & Processing Plan

Since the source is a Vega-Lite spec pointing to a URL, we will codify the data by implementing the transformation logic described in the spec.

**Source Data:** `https://vega.github.io/editor/data/movies.json`

**Processing Logic to Implement (in `src/components/Visualization.tsx`):**
1.  **Fetch:** Load the JSON data.
2.  **Filter:** Remove entries where `IMDB_Rating` is null.
3.  **Bin:** Create bins (e.g., floor the rating: `Math.floor(rating)`).
4.  **Group:** Count movies per bin.
5.  **Window:** Sort bins ascending and calculate `Cumulative Count` (running total).
6.  **Format:** Output array: `[{ bin: 2, count: 5, cumulative: 5 }, { bin: 3, count: 20, cumulative: 25 }, ...]`

*Note: If fetching external data is blocked by the environment, we will use a hardcoded dataset that matches the visual output of the `desktop.png` exactly (approximated from the graph).*

## 4. Implementation Steps

1.  **Project Setup**: Initialize the component structure with `Recharts`, `Lucide`, and `Tailwind`.
2.  **Data Processing**:
    - Create a `processData` function.
    - Implement the binning and cumulative sum logic.
    - *Fallback*: If raw data access is complex, hardcode the derived dataset representing the movie ratings curve shown in the image (approximately: bins 2-9).
3.  **Layout Construction**:
    - Create a Card container with `bg-white/glass`.
    - Add Header: Title (Distribution of IMDB Ratings) + Legend (Visual indicators for "Total so far" vs "Count").
4.  **Chart Implementation**:
    - Use `<ComposedChart>`.
    - **X-Axis**: `<XAxis>` dataKey="bin" tickLine={false} axisLine={false}.
    - **Y-Axis**: `<YAxis>` hide line, keep modest tick count.
    - **Grid**: `<CartesianGrid>` vertical={false} opacity={0.1}.
    - **Layer 1 (Cumulative)**: `<Bar>` dataKey="cumulative" fill="#3b82f6" opacity={0.3} radius={[4, 4, 0, 0]} barSize={32} (max).
    - **Layer 2 (Count)**: `<Bar>` dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} barSize={32} (max). Note: In Recharts, to overlay bars, we might need to make them separate axes or use a specific `barGap` / `barCategoryGap` setting, or simply render them in specific order (Background first). *Correction:* To strictly overlay bars in Recharts, simply rendering two `<Bar>` components with the same `xAxisId` usually stacks them side-by-side unless `stackId` is used. To get the "Layered" (one in front of other) effect without stacking, we can use a custom shape or ensure the X-axis aligns them. Actually, Recharts places bars side-by-side by default.
    - **Alternative for Layering**: Use `barGap={-100%}` (hacky) or better, simply make the "Cumulative" a `<Area>` or a wider `<Bar>` and the "Count" a narrower `<Bar>`.
    - **Decision**: Make "Cumulative" a filled `<Area>` (stepped) or a wider, lighter `<Bar>`. Make "Count" a narrower, vibrant `<Bar>` inside it. This improves the mobile aesthetic and clarity.
5.  **Interaction Design**:
    - Add `<Tooltip>` with `cursor={{ fill: 'transparent' }}`.
    - Custom Tooltip Content: Display "Rating: [Bin]", "Count: [Val]", "Cumulative: [Val]".
6.  **Refinement**:
    - Add responsive container `<ResponsiveContainer>`.
    - Ensure typography is readable (text-slate-500).
    - Add a "summary" metric in the header (e.g., Total Movies).