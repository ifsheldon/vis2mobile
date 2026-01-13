# Mobile Visualization Plan: Falkensee Population History

## 1. Analysis of Original Desktop Visualization

**Content & Intent:**
The visualization depicts the demographic history of Falkensee, Germany, from 1875 to 2014. It combines two layers of information:
1.  **Quantitative Trend:** A line chart showing population growth, characterized by slow growth initially, a sharp rise during the 1930s, a plateau/decline, and a sharp rise again in the 1990s.
2.  **Contextual Events:** Two colored background rectangles indicating specific historical periods: "Nazi Rule" (Orange) and "GDR (East Germany)" (Blue).

**Desktop vs. Mobile Issues:**
*   **Aspect Ratio:** The desktop version is wide (landscape). A direct scaling to mobile (`desktop_on_mobile.png`) compresses the X-axis, making the slope of the line steep and harder to read, and causing potential label overlap.
*   **Legend:** The legend is positioned to the right of the chart. On mobile, this consumes approximately 20-25% of the horizontal screen real estate, compressing the actual data view significantly.
*   **Typography:** The axis labels and title are relatively small. On a mobile screen, the years on the X-axis and population numbers on the Y-axis would be difficult to read without zooming.
*   **Interaction:** The original relies on mouse hovering for specific data points, which does not translate natively to touch interaction.

## 2. Vis2Mobile Design Action Space Reasoning

Based on the `mobile-vis-design-action-space.md`, the following actions will be taken to transform the visualization:

### L0: Visualization Container
*   **Action: `Rescale` (Aspect Ratio Adjustment)**
    *   *Reasoning:* The original wide aspect ratio squashes the time series on narrow screens. I will change the aspect ratio to a taller format (e.g., 4:3 or 1:1) to allow the line chart to "breathe" and accurately convey the rate of population change.
*   **Action: `Reposition` (Padding)**
    *   *Reasoning:* Remove the excessive desktop margins. The container will use a standard mobile padding (e.g., `p-4`) to maximize width.

### L1: Chart Components & Interaction
*   **Action: `Reposition (Fix)` (Feedback/Tooltip)**
    *   *Reasoning:* Instead of a floating tooltip that might be covered by a finger, I will use a **Custom Tooltip** that snaps to the nearest data point and renders clearly, possibly utilizing a "crosshair" cursor for better precision on touch.
*   **Action: `Recompose (Replace)` (Triggers)**
    *   *Reasoning:* Replace `hover` events with `touch/drag` gestures to scrub through the timeline.

### L2: Title Block
*   **Action: `Reposition` (Externalize)**
    *   *Reasoning:* The original title is embedded or implicit. I will move the title ("Population of Falkensee") and subtitle ("Impact of Historical Events") into a dedicated DOM header above the chart for better SEO and hierarchy.

### L3: Axes (Coordinate System)
*   **X-Axis (Year)**
    *   **Action: `Decimate Ticks`**
        *   *Reasoning:* To prevent label overlapping ("Cluttered text") on the narrow width, I will reduce the tick count or let Recharts automatically manage interval skipping.
*   **Y-Axis (Population)**
    *   **Action: `Simplify labels` (Format)**
        *   *Reasoning:* The raw numbers (e.g., "40,000") take up horizontal space. I will format them as "40k" using a formatter function. This saves pixels for the actual chart.
    *   **Action: `Recompose (Remove)` (Axis Line)**
        *   *Reasoning:* Remove the vertical axis line and rely on faint horizontal grid lines to reduce visual noise (`L4 AxisLine -> Remove`).

### L3: Legend Block
*   **Action: `Reposition` (Top/Bottom)**
    *   *Reasoning:* The side legend is the biggest blocker for mobile width. I will move the legend to the **Top** (between title and chart) using a flexible row layout. This ensures the user understands the color coding (Nazi Rule/GDR) *before* interpreting the chart.
*   **Action: `Simplify Text`**
    *   *Reasoning:* "GDR (East Germany)" is long. I will wrap this text or ensure the legend item allows for two lines if necessary, but "Nazi Rule" and "GDR" are short enough if placed horizontally.

### L2: Data Marks
*   **Action: `Rescale` (Line & Dots)**
    *   *Reasoning:* The line stroke width and dot radius need to be increased (e.g., stroke width 2px -> 3px) to be visually impactful on high-DPI mobile screens.
*   **Action: `Reposition` (Annotations)**
    *   *Reasoning:* The colored rectangles (Reference Areas) will be preserved as they are critical to the narrative. They will sit behind the line layer.

## 3. Data Extraction Plan

The data is embedded directly in the HTML file within the `spec` variable. I will extract two datasets:

1.  **Main Time Series Data:**
    Located in `spec.data.values`.
    *   **Fields:** `year` (string "YYYY"), `population` (integer).
    *   **Transformation:** Convert `year` string to integer for sorting/plotting if necessary, though categorical string often works fine for X-axis labels in Recharts if sorted.

2.  **Event Annotations (Background Rects):**
    Located in `spec.layer[0].data.values`.
    *   **Fields:** `start` (string "YYYY"), `end` (string "YYYY"), `event` (string).
    *   **Mapping:**
        *   "Nazi Rule": 1933 - 1945 (Color: Orange)
        *   "GDR (East Germany)": 1948 - 1989 (Color: Blue)

**Data Format for Component:**
```typescript
interface PopulationData {
  year: string;
  population: number;
}

interface HistoricalEvent {
  start: string;
  end: string;
  event: string;
  color: string;
}
```

## 4. Implementation Steps

1.  **Project Setup:** Initialize the component structure in `src/components/Visualization.tsx`.
2.  **Data Codification:** Copy the JSON data from the source HTML into a constant variable or a separate data file.
3.  **Layout Construction (L0 - L2):**
    *   Create a clean, glassmorphic container using Tailwind (`bg-white/90`, `backdrop-blur`, `shadow-xl`, `rounded-2xl`).
    *   Implement the Title and Subtitle area.
    *   Implement the Legend area at the top using Flexbox (`flex-row`, `justify-start`, `gap-4`).
4.  **Chart Implementation (Recharts):**
    *   Use `<ResponsiveContainer>` with a set height (e.g., `h-[400px]` or `aspect-[4/5]`) to ensure vertical breathing room.
    *   Use `<ComposedChart>` to combine `<Line>` and `<ReferenceArea>`.
    *   **Layer 1 (Background):** Map through the Event Annotations data to render `<ReferenceArea>` components. Set `x1` and `x2` to the start/end years. Assign distinct fill colors (Orange/Blue) with opacity to ensure grid lines remain visible.
    *   **Layer 2 (Grid):** Add `<CartesianGrid>` (vertical=false, strokeDasharray="3 3").
    *   **Layer 3 (Axes):**
        *   `<XAxis dataKey="year">` with `tick={{ fontSize: 12 }}` and `minTickGap={20}`.
        *   `<YAxis>` with `tickFormatter={(value) => value >= 1000 ? '${value/1000}k' : value}` and `width={35}`.
    *   **Layer 4 (Data):** Add `<Line type="monotone" dataKey="population">`. Enhance styling (dark grey stroke, standard dot size).
    *   **Layer 5 (Interaction):** Add `<Tooltip>` with a custom content component that displays the Year, Population, and arguably the specific Event if the year falls within a range.
5.  **Refinement:**
    *   Apply lucide icons if relevant (e.g., a chart icon in the header).
    *   Test typography scaling and contrast.
    *   Ensure the background colors for events look good in Dark Mode if supported (or stick to a defined palette).