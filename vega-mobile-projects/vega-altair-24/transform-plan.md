# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Source Analysis
- **Type**: Stacked Area Chart (Time Series).
- **Data Source**: External JSON (`unemployment-across-industries.json`).
- **Encodings**:
  - **X-axis**: Date (Year-Month).
  - **Y-axis**: Quantitative (Sum of Count).
  - **Mark**: Area (`type: "area"`).
  - **Color**: `goldenrod`.
- **Structure**:
  - **Layer 0 (Background)**: Displays the full time series with `opacity: 0.3`.
  - **Layer 1 (Foreground)**: Displays a filtered portion of the data based on an "interval" selection (Brush interaction).
- **Interaction**: The original desktop version relies on a "brush" (drag to select x-axis range) to highlight a specific time period.

### Mobile Challenges & Issues
1.  **Aspect Ratio**: The `desktop_on_mobile.png` shows the chart flattened significantly. The peaks (unemployment spikes) lose their visual impact.
2.  **Interaction**: "Brushing" (drawing a box/region) on a mobile screen is notoriously difficult due to "fat finger" issues and lack of precision. It blocks the view of the data.
3.  **Readability**: The original chart lacks a clear title, axis labels are likely too small when scaled down, and there is no immediate readout of values without interaction.
4.  **Density**: 10+ years of monthly data results in ~120+ data points. On a narrow mobile screen, tappable targets are too small.

## 2. Design Action Space & Transformation Plan

To transform this into a premium mobile-first component, I will focus on converting the "Brush/Highlight" intent into a **Touch/Scrubber** experience, where the user can slide a finger across the chart to see specific data points, rather than selecting a range (which is less useful on a small screen without a secondary drill-down view).

### High-Level Strategy
I will create a **"Focus-Card" Layout**. The top of the component will display the specific values (Date and Unemployment Count) dynamically as the user interacts with the chart. The chart itself will be a responsive Area Chart using a gradient to replace the flat "goldenrod" for a premium look.

### Detailed Actions by Layer

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | **Rescale & Reposition** | Use a card-based layout with appropriate padding (`p-4`). Ensure the chart container uses `h-[300px]` or `aspect-square` to provide enough vertical resolution for the data peaks, solving the "flattening" issue. |
| **L1** | **Data Model** | **Recompose (Aggregate)** | The source data contains industry breakdowns, but the Vega spec uses `aggregate: "sum"`. I will perform this aggregation in the data extraction phase to sum counts per month, creating a single "Total Unemployment" time series. |
| **L1** | **Interaction** | **Triggers (Replace)** | Replace the desktop `Brush` (Interval Selection) with a **Touch/Pan** interaction (Recharts `Tooltip` with a custom cursor). Mobile users prefer scrubbing to read values rather than selecting ranges. |
| **L2** | **Title Block** | **Recompose (Add)** | The original lacks a title. I will add a **Main Title** ("Unemployment Trends") and a **Dynamic Subtitle** (The current date/value being hovered, or the overall max value if inactive) to provide context immediately. |
| **L2** | **Features** | **Disable Hover / Enable Touch** | Hover is unavailable. I will configure Recharts `<Tooltip>` to trigger on touch/click and set `active={true}` logic to persist the selection. |
| **L2** | **Feedback** | **Reposition (Fix)** | Instead of a floating tooltip that gets covered by the finger, I will use a **Fixed Tooltip** strategy. The data readout will appear in the Header (Title Block) or a fixed overlay at the top of the chart area. |
| **L3** | **Axes** | **Recompose (Simplify)** | **X-Axis**: Use `Decimate Ticks`. Show only years (e.g., '00, '05, '10) to avoid clutter. **Y-Axis**: `Recompose (Remove)` the axis line and ticks. Move the scale context to the gridlines or just rely on the interactive readout. This maximizes horizontal space for the chart. |
| **L3** | **Gridlines** | **Recompose (Remove/Modify)** | Keep minimal horizontal gridlines (dashed, faint) to show scale, remove vertical gridlines to reduce noise. |
| **L2** | **Data Marks** | **Rescale & Style** | **Action**: Use a Gradient Fill (`<defs>`) for the Area chart instead of solid `goldenrod`. Fade from `amber-500` to transparent at the bottom. This creates the "Premium" glassmorphism/modern aesthetic. |
| **L5** | **Tick Label** | **Simplify Labels** | Format X-axis dates as "YYYY" (e.g., 2010). Format Y-axis values (if shown in tooltip) with "k" or "M" suffixes for readability (e.g., "5.4M"). |

### Reasoning for Deviation from Action Space
*   *Action Space Reference*: **L1 Interaction - Replace**. The action space suggests replacing Hover with Click.
*   *Specific Plan*: I am replacing "Interval Select" (Desktop) with "Scrubbing" (Mobile). This preserves the ability to explore the data timeline but adapts the input method to touch physics.

## 3. Data Extraction Plan

The original spec uses `aggregate: sum` on the `count` field, grouping by `date`.

1.  **Fetch**: Download JSON from `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment-across-industries.json`.
2.  **Parse**:
    *   Iterate through the array.
    *   Convert `date` string to a comparable Time object or Month-Year string key.
    *   Group by Month-Year.
    *   Sum the `count` for all industries in that month.
3.  **Transform**:
    *   Output a flat array of objects: `{ date: "YYYY-MM-DD", value: TotalCount }`.
    *   Sort chronologically.
4.  **Validation**: Ensure no fake data is used. Use the exact values derived from the JSON.

## 4. Implementation Steps

1.  **Setup Component**: Create `src/components/Visualization.tsx`.
2.  **Data Loading**: Implement a `useEffect` or async function to fetch and process the real data.
3.  **Layout**: Build the outer Card container using Tailwind (glass effect: `bg-white/90 backdrop-blur`, shadow-lg).
4.  **Header Area**: Implement the Title and a "Stat Display" area that updates based on chart state.
5.  **Chart Implementation**:
    *   Use `<ResponsiveContainer>` for width.
    *   Add `<AreaChart>`.
    *   Add `<defs>` for the Amber gradient.
    *   Add `<CartesianGrid>` (vertical=false).
    *   Add `<XAxis>` with `tickFormatter` (Year only).
    *   Add `<Tooltip>` with `cursor={{ stroke: 'gray', strokeDasharray: '4 4' }}` and a custom `content` render (or visually hidden content that updates React state for the Header).
6.  **Refinement**:
    *   Add Loading Skeleton state.
    *   Adjust typography (Inter font, nice tracking).
    *   Ensure colors match the "Goldenrod" inspiration but modernized (Tailwind `amber-500` / `yellow-600`).