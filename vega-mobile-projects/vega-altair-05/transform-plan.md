# Vis2Mobile Transformation Plan

## 1. Analysis: Desktop vs. Mobile

### Original Desktop Visualization
- **Type**: Faceted Stacked Horizontal Bar Chart.
- **Data Dimensions**:
    - **Y-axis**: Barley Variety (Nominal).
    - **X-axis**: Yield (Quantitative).
    - **Color**: Site (Nominal, 6 distinct categories).
    - **Facet (Columns)**: Year (1931 vs 1932).
- **Layout**: Two chart panels side-by-side sharing a common Y-axis and Legend on the right.
- **Issues for Mobile**:
    - **Aspect Ratio**: The 2-column layout is extremely wide. Rendering it directly on mobile (`desktop_on_mobile.png`) creates an unreadable aspect ratio where bars become tiny slivers and text becomes microscopic.
    - **Legend**: The right-aligned legend consumes approximately 20% of horizontal space, which is fatal on portrait mobile screens.
    - **Data Density**: Stacking 6 distinct sites into a single bar creates very small tap targets for interaction.

### Mobile Design Goals
- **Readability**: The "Variety" names are long. Horizontal bars are excellent for this on mobile (no head tilting needed), but we must maximize width.
- **Comparison**: The user needs to compare yields across varieties and potentially across years.
- **Interaction**: Fingers are thick. Tapping a specific 5px wide color segment to see the tooltip is bad UX.

## 2. Design Action Space Plan

I will apply the following actions from the `mobile-vis-design-action-space.md` to transform this visualization.

### L0: Visualization Container & L3: Small Multiples
- **Action**: **Small Multiple -> Paginate Panels / Split states** (or **Compensate (Toggle)**)
    - **Reasoning**: The desktop version uses `column` faceting for "Year" (1931 vs 1932). Displaying these side-by-side on mobile compresses the width too much.
    - **Plan**: Instead of stacking them vertically (which makes comparison hard due to scrolling distance) or shrinking them, I will introduce a **Segmented Control (Tab)** at the top to toggle between `1931` and `1932`. This allows the active chart to utilize the full screen width.

### L3: Legend Block
- **Action**: **Reposition** (Right $\to$ Bottom/Top) & **Transpose** (Vertical $\to$ Horizontal)
    - **Reasoning**: The right sidebar legend is the biggest waste of horizontal space.
    - **Plan**: Move the legend to the **bottom** of the chart. Use a `flex-wrap` layout to display the 6 sites (University Farm, Waseca, etc.) clearly without intruding on the chart area.

### L2: Coordinate System & L4: Axes
- **Action**: **Rescale** (Width) & **Transpose Axes** (Maintain)
    - **Reasoning**: The original is already a horizontal bar chart (`Transpose Axes` is active). This is perfect for mobile because categorical labels (Variety names) fit better horizontally.
    - **Plan**: Set the chart container to `width: 100%`. Ensure the Y-axis (Variety) is allocated enough fixed width (e.g., 80-100px) so labels aren't truncated, while the bars take up the remaining fluid space.

### L5: Interaction & Feedback
- **Action**: **Reposition (Fix) Tooltip**
    - **Reasoning**: Standard floating tooltips are blocked by fingers.
    - **Plan**: Instead of a floating tooltip, use a **"Click to Select"** interaction. When a user taps a bar (Variety), highlight that row and display a detailed **Summary Card** (Bottom Sheet or Fixed Overlay) showing the specific yield breakdown for all sites for that variety.

### L4: Ticks
- **Action**: **Decimate Ticks**
    - **Reasoning**: To prevent X-axis overcrowding.
    - **Plan**: Limit X-axis ticks to 3-4 distinct values (e.g., 0, 100, 200).

## 3. Data Extraction Strategy

The data is embedded in the HTML file within the `spec` variable. I will extract the `datasets['data-9cc0564cb5591205eeeca8d2429dd11b']` array.

**Source Data Structure**:
```json
[
  {"yield": 27, "variety": "Manchuria", "year": 1931, "site": "University Farm"},
  ...
]
```

**Transformation for Recharts**:
Recharts requires a specific structure for Stacked Bar Charts where keys correspond to the stack segments (Sites). I will need to process the raw data:

1.  **Group** the data by `year`.
2.  Inside each year, **Group** by `variety`.
3.  **Pivot** the `site` fields into keys.

**Target Data Structure (Typescript Interface)**:
```typescript
interface ProcessedDataPoint {
  variety: string;
  totalYield: number; // For sorting
  "University Farm": number;
  "Waseca": number;
  "Morris": number;
  "Crookston": number;
  "Grand Rapids": number;
  "Duluth": number;
}

interface ChartData {
  1931: ProcessedDataPoint[];
  1932: ProcessedDataPoint[];
}
```
*Note: I will also extract the specific color mapping used in the original Vega spec (or define a premium palette if not specified, but the prompt asks to use real data which implies real categories).*

## 4. Implementation Steps

1.  **Data Extraction**: Copy the JSON array from the source HTML. Create a utility function `processBarleyData` to pivot this into the `ChartData` structure described above.
2.  **Component Skeleton**: Create the main `Visualization` component.
    - State: `activeYear` (1931 | 1932).
    - State: `selectedVariety` (string | null) for the "Focus" interaction.
3.  **UI Layout**:
    - **Header**: Title "Barley Yield Analysis" + Year Toggle (Segmented Control).
    - **Main Area**: `ResponsiveContainer` wrapping a Recharts `BarChart` (layout="vertical").
    - **Legend**: A flexible grid of colored dots and labels below the chart.
    - **Detail View**: A conditional rendering area (Card) that appears when a Variety is clicked, showing the exact numbers for that variety sorted by yield.
4.  **Recharts Configuration**:
    - `XAxis`: Type="number", hide axis line to reduce clutter.
    - `YAxis`: Type="category", dataKey="variety", tick={{ fontSize: 12, width: 90 }}.
    - `Bar`: Create 6 `<Bar />` components, one for each Site. StackId="a".
5.  **Styling (Premium Aesthetics)**:
    - Use a custom color palette inspired by the original but modernized (e.g., earthy tones for agriculture).
    - Add `radius={[0, 4, 4, 0]}` to the last bar in the stack for a polished look.
    - Use `AnimatePresence` (if using framer-motion) or CSS transitions for switching years.
    - Font: Inter or system sans-serif, ensuring readable contrast.

This plan ensures the mobile version is not just a shrunk desktop chart, but a functional, interactive application for exploring the dataset.