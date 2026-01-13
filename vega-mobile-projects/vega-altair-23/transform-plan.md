# Vis2Mobile Transformation Plan: IMDB Rating Histogram with Mean Overlay

## 1. Analysis of Original Visualization

### Desktop Version Details
*   **Type**: Vertical Histogram with a global mean overlay.
*   **Data Source**: `movies.json` (IMDB Ratings).
*   **X-Axis**: Binned quantitative field ("IMDB Rating"). The bins represent ranges of ratings.
*   **Y-Axis**: Quantitative count of records (Frequency).
*   **Visual Elements**:
    *   Blue bars representing the frequency of movies in each rating bin.
    *   A prominent, vertical **Red Rule** representing the global mean (average) IMDB rating.
    *   Gridlines are present for Y-axis values.
    *   Axis labels: "IMDB Rating" and "Count of Records".

### Mobile Constraints & Issues in "Desktop on Mobile"
*   **Aspect Ratio**: Direct rendering squeezes the chart horizontally, making bars very thin and harder to tap/distinguish.
*   **Legibility**: Axis text (numbers) becomes small.
*   **Interaction**: Desktop hover states (if any) won't work. The precision required to select a specific bin on a phone screen is high.
*   **Information Density**: The mean line is vital narrative context but might be obscured if the chart is too crowded.

## 2. Vis2Mobile Design Action Plan

Based on the `mobile-vis-design-action-space.md`, here is the plan to transform the visualization.

### High-Level Strategy
I will retain the **Vertical Histogram** layout. While transposing to horizontal bars is a common mobile tactic, a frequency distribution (histogram) is conventionally read horizontally (left-to-right increasing value). Transposing it vertically might confuse the "shape" of the bell curve. Instead, I will focus on **Rescaling** and **Simplifying** to fit the vertical bars comfortably on a mobile width.

### Action Space Mapping

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | `Rescale` | Use a responsive container with a fixed aspect ratio suitable for scrolling (e.g., height 350px) rather than scaling down the desktop aspect ratio. This ensures bars are tall enough to resolve differences. |
| **L0** | **Container** | `Reposition` | Add "padding" to the container to prevent edge clipping on curved mobile screens. |
| **L1** | **Data Model** | `Recompose (Aggregate)` | **Crucial**: The original Vega-Lite spec performs automatic binning. I must manually aggregate the raw `movies.json` data into bins (e.g., 0.5 or 1.0 intervals) and calculate the Mean in JavaScript before passing it to the visualization library. |
| **L2** | **TitleBlock** | `Recompose (Add)` | The original lacks a clear title inside the SVG. I will add a **L3 Title** ("IMDB Ratings Distribution") and **L3 Subtitle** ("Global Average Overlay") to provide immediate context without relying on external text. |
| **L3** | **Axes (X)** | `Decimate Ticks` | If the bins are granular (e.g., 0.5), displaying every label will clutter the X-axis. I will show every 2nd or integer tick to ensure labels (1, 2, 3...) are readable. |
| **L3** | **Axes (Y)** | `Recompose (Remove)` | Remove the solid axis line (`axisLine={false}`) and potentially the ticks (`tickLine={false}`), keeping only the labels and gridlines to reduce visual noise (Data-Ink Ratio). |
| **L2** | **Data Marks (Bars)** | `Rescale` | Ensure bars have a `minPointSize` or adequate padding. I will add a subtle corner radius to the top of bars for a modern "Premium" look. |
| **L2** | **Annotations (Mean)** | `Reposition` / `Style` | The Red Line is the key insight. I will use a `ReferenceLine`. On mobile, simply drawing a line might be subtle. I will add a label directly to the line or in a legend above the chart to explicitly state "Mean: [Value]". |
| **L2** | **Feedback (Tooltip)** | `Fix Tooltip Position` | Instead of a floating tooltip that might be covered by a finger, I will use a "Sticky" tooltip logic or style the customized tooltip to appear at the top of the chart area when a bar is active. |

## 3. Data Extraction & Codification Strategy

Since the original uses a URL and Vega-Lite transforms (binning/aggregate), I cannot simply "scrape" SVG coordinates. I must process the raw data.

1.  **Fetch Data**: Retrieve `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`.
2.  **Filter**: Ensure valid "IMDB Rating" exists.
3.  **Calculate Mean**: Compute the average of all "IMDB Rating" values.
4.  **Binning Logic**:
    *   Define bin size (e.g., 0.5 or 1.0).
    *   Iterate through records, assigning them to bins.
    *   Count frequency per bin.
5.  **Output Structure**:
    ```typescript
    interface ChartData {
      binStart: number; // e.g., 6.0
      binEnd: number;   // e.g., 6.5
      label: string;    // "6.0-6.5"
      count: number;    // Frequency
    }
    const globalMean: number; // e.g., 6.5
    ```

## 4. Implementation Steps

### Step 1: Project Setup & Components
*   Create `src/components/Visualization.tsx`.
*   Import `Recharts` components: `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`, `ReferenceLine`, `CartesianGrid`.
*   Import `lucide-react` for auxiliary icons (e.g., Info icon for context).

### Step 2: Data Processing Utility
*   Write a function inside the component (or distinct utility) to fetch the JSON and process it into the Histogram format described in Section 3.
*   **Self-Correction**: Fetching inside a client component might cause lag. Since this is a demo, I will hardcode the URL fetch in a `useEffect` or simulate Server Component data fetching pattern if feasible. For this task, client-side fetching in `useEffect` is acceptable.

### Step 3: Layout & Styling (Tailwind)
*   **Container**: `w-full h-auto p-4 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20`.
*   **Typography**:
    *   Title: `text-xl font-bold text-slate-800`.
    *   Subtitle: `text-sm text-slate-500 mb-6`.
*   **Chart Area**: `h-[350px] w-full`.

### Step 4: Visualization Construction (Recharts)
*   `<ResponsiveContainer>` wrapping the chart.
*   `<BarChart>` with the binned data.
*   `<CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />` for minimal guidance.
*   `<XAxis>`:
    *   `dataKey="binStart"`
    *   `tick={{ fontSize: 12, fill: '#64748b' }}`
    *   `tickLine={false}`, `axisLine={false}`.
*   `<YAxis>`:
    *   `tick={{ fontSize: 12, fill: '#64748b' }}`
    *   `axisLine={false}`, `tickLine={false}`.
    *   Use `tickFormatter` to abbreviate large numbers (e.g., 1k) if necessary.
*   `<Bar>`:
    *   Fill color: A modern blue/indigo gradient (using SVG linearGradient definition).
    *   `radius={[4, 4, 0, 0]}` for top rounded corners.
    *   `activeBar`: Highlight color on touch.
*   `<ReferenceLine>`:
    *   `x={meanValue}`.
    *   `stroke="red"`, `strokeDasharray="3 3"`.
    *   `label={{ value: 'Mean', position: 'insideTopRight', fill: 'red', fontSize: 12 }}`.

### Step 5: Mobile Interaction Polish
*   Implement a **Custom Tooltip**.
    *   Backdrop blur styling.
    *   Shows: "Rating Range: X - Y", "Count: Z".
*   Ensure the Red Mean Line is rendered *after* the bars (higher z-index equivalent in SVG order) so it's visible on top of bars.

### Step 6: Final Review
*   Check against "Hard Requirement": Is it readable? Yes, by removing axis lines and spacing ticks.
*   Check aesthetics: Does it look "Premium"? Glassmorphism and rounded bars will ensure this.