# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization & Mobile Challenges

### Original Visualization
- **Type**: Vertical Bar Chart (Time Series).
- **Data Content**: Monthly "Nonfarm Employment Change" from 2006 to 2015.
- **Key Narrative**: The visualization highlights the economic crash of 2008-2009 (deep orange negative bars) followed by a recovery (blue positive bars).
- **Encoding**:
    - **X-Axis**: Time (Monthly).
    - **Y-Axis**: Quantity (Employment Change).
    - **Color**: Condition-based (Blue for >0, Orange for <0).

### Mobile Challenges (Desktop-on-Mobile Analysis)
1.  **High Graphical Density (Overplotting)**: There are approx. 120 bars (10 years * 12 months). On a mobile screen (~375px width), each bar would be less than 3px wide. This creates a "texture" rather than distinct bars, making it impossible to distinguish individual months visually.
2.  **Unusable Interaction (Fat-finger problem)**: Hovering to see specific values is impossible on touch screens. Tapping a 3px wide bar is frustrating.
3.  **Illegible Axes**: The X-axis labels (years) are readable in the image, but the Y-axis ticks are small. The "Nonfarm_change" label is rotated, which is hard to read on mobile.
4.  **Flat Aspect Ratio**: Squashing the chart to mobile width flattens the dramatic peaks/troughs of the 2008 recession, reducing emotional impact.

## 2. High-Level Strategy

My strategy prioritizes **Context + Focus**.
1.  **Visual**: We will maintain the Bar Chart type as the "Zero Baseline" is crucial for showing positive vs. negative change.
2.  **Layout**: We will use a **Scrollable Pan** (Horizontal Scrolling) approach. We cannot fit 120 readable bars on one mobile screen. We will display a subset of data (e.g., ~2-3 years) by default to ensure bars are distinct and tappable (`Rescale`), allowing the user to swipe horizontally to see the history.
3.  **Interaction**: We will implement a "Scrubbing" interaction. As the user touches the chart, a crosshair/cursor will snap to the nearest month, and the data will appear in a **Fixed Feedback Panel** (Header area) rather than a floating tooltip.

## 3. Design Actions (Based on Action Space)

### L0: Visualization Container
*   **Action: `Rescale` (Aspect Ratio)**
    *   **Reasoning**: Change from the wide desktop ratio (approx 2:1) to a taller mobile ratio (e.g., 4:3 or 1:1). This increases the vertical resolution, making the "crash" (deep negative bars) look more dramatic and legible.
*   **Action: `Reposition` (Padding)**
    *   **Reasoning**: Remove standard margins. The chart should span the full width (`width: 100%`) of the container to maximize data ink.

### L1: Data Model
*   **Action: `Recompose (Aggregate)` (Rejected)**
    *   *Why Rejected*: Aggregating to "Yearly" sums would hide the specific volatility of the 2008 crash. We keep monthly granularity.
*   **Action: `Recompose (Windowing/Zoom)` (New Action)**
    *   **Reasoning**: Instead of showing all 120 months at once, we will render the chart inside a horizontally scrollable container. The initial view will focus on the most recent data or the most dramatic data (2008), with a "Scroll for history" cue.
    *   *Note*: While not explicitly in the "Action Space" table under L1, this maps to `Rescale` in L4 (Mark Instance) combined with a scroll container.

### L2: Data Marks (The Bars)
*   **Action: `Rescale` (Reduce width / Increase spacing)**
    *   **Reasoning**: To ensure touch targets are valid, bars need to be at least ~8-12px wide with gaps. This confirms the decision to use a scrollable X-axis.
*   **Action: `Recompose (Change Encoding)` (Color)**
    *   **Reasoning**: Keep the logic (Pos=Blue, Neg=Orange) but upgrade the palette.
    *   *Premium Aesthetic*: Use `Emerald-500` (or similar vibrant green/blue) for positive and `Rose-500` for negative with a gradient fill (opacity top-to-bottom) to look modern and "glassy".

### L2: Interaction (Triggers & Feedback)
*   **Action: `Recompose (Replace)` (Hover -> Touch)**
    *   **Reasoning**: Replace desktop hover with a continuous touch/drag gesture.
*   **Action: `Reposition (Fix)` (Tooltip)**
    *   **Reasoning**: Move tooltip information (Date + Value) to a dedicated **Header Card** above the chart. This solves the occlusion problem where the user's finger hides the data they are trying to read.

### L3: Axes & Coordinate System
*   **Action: `Recompose (Remove)` (Axis Titles)**
    *   **Reasoning**: Remove "month" and "nonfarm_change" labels. The title "Employment Change" and the context of the data make these redundant.
*   **Action: `Decimate Ticks` (X-Axis)**
    *   **Reasoning**: Only show Year labels (e.g., "2008", "2009"). Since the chart is scrollable, we can place a sticky tick or repetitive year markers.
*   **Action: `Format Tick Label` (Y-Axis)**
    *   **Reasoning**: Simplify numbers. Instead of `-1000`, use `-1k`. Move Y-Axis to the right side (`orientation="right"`) so it doesn't obscure the start of the data if scrolled to the left, or keep it fixed background.

### L2: Annotations
*   **Action: `Compensate (Number/Context)`**
    *   **Reasoning**: Add a summary highlight. e.g., "The 2008 Crash" annotation overlaying the deep trough to guide the user's eye to the narrative focus.

## 4. Data Extraction Plan

I will extract the raw data directly from the provided HTML `script` tag.

**Source Location**: `spec.datasets['data-47b635ed2eb04c99c31d7dc9bd6ff69f']`

**Data Structure**:
Array of objects, each containing:
1.  `month`: String (ISO date format, e.g., `"2006-01-01T00:00:00"`). -> Needs parsing to JS Date or formatted string.
2.  `nonfarm_change`: Number (Integer, e.g., `282`, `-707`). -> Used for Bar height.

**Processing**:
1.  Copy the JSON array.
2.  Format `month` to a readable display format (e.g., "Jan 06") for the tooltip/header.
3.  Add a `color` property to each data point based on `nonfarm_change > 0`.

## 5. Implementation Steps

1.  **Setup Component**: Create `EmploymentChangeChart.tsx`.
2.  **Prepare Data**:
    *   Create a constant `rawChartData` with the extracted JSON.
    *   Create a utility to format dates (`date-fns` or native `Intl`).
3.  **Build Layout (L0)**:
    *   Outer Container: Tailwind styled card (`bg-white/10 backdrop-blur`, `rounded-xl`, `shadow-lg`).
    *   Header: Title "US Employment Change" and a dynamic "Active Data" display (shows the value of the bar currently under focus).
4.  **Implement Chart (Recharts)**:
    *   Use `ResponsiveContainer` (height ~300px).
    *   **Crucial Step**: Wrap the `BarChart` in a `div` with `overflow-x-auto` to allow scrolling, OR set the `min-width` of the `BarChart` to something large (e.g., `1000px`) inside the scroll container.
    *   *Alternative Mobile View*: Use `BarChart` with `Brush`? No, horizontal scroll is more native to mobile.
    *   **Axes**:
        *   `XAxis`: `dataKey="month"`, `tickFormatter` to show only Years.
        *   `YAxis`: `width={40}`, `tickFormatter={(val) => val/1000 + 'k'}` (if needed) or simple numbers.
    *   **Bars**:
        *   `Bar`: `dataKey="nonfarm_change"`.
        *   `Cell`: Map over data, assign `fill` color based on value (Green/Red).
        *   `radius`: `[4, 4, 0, 0]` for positive, `[0, 0, 4, 4]` for negative for a polished look.
5.  **Interaction**:
    *   Use `Tooltip` with `cursor={{fill: 'transparent'}}` (custom cursor visual).
    *   Use `content={<CustomTooltip />}` but actually use state to lift the data to the Header (L2 Reposition). *Note: Recharts custom tooltip rendering might be laggy for lifting state; better to render the tooltip at a fixed position via CSS inside the custom tooltip component.*
6.  **Styling**:
    *   Apply glassmorphism borders.
    *   Ensure fonts are `text-sm` or `text-xs` but legible sans-serif.

## 6. Data to be Extracted (Snippet)

*For implementation, I will use the full dataset provided in the source.*

```json
[
  {"month": "2006-01-01T00:00:00", "nonfarm_change": 282},
  {"month": "2006-02-01T00:00:00", "nonfarm_change": 312},
  ... (all 120 records)
]
```