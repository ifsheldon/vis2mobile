# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Waterfall Chart.
- **Purpose**: Illustrates the cumulative effect of positive and negative monthly values on a starting initial value ("Begin") to reach a final value ("End").
- **Structure**:
    - **X-Axis**: Categorical (Time/Sequence: Begin, Jan-Dec, End).
    - **Y-Axis**: Quantitative (Amount).
    - **Visual Encodings**:
        - **Height/Position**: Represents the cumulative sum.
        - **Color**:
            - Beige (`#f7e0b6`): Totals (Begin, End).
            - Green (`#93c4aa`): Positive change (Increase).
            - Orange/Red (`#f78a64`): Negative change (Decrease).
    - **Labels**:
        - **Bar Labels**: The incremental change (e.g., "+1707", "-1425").
        - **Top Labels**: The running total (e.g., "5707").
    - **Connectors**: Thin lines connecting the top of one bar to the start of the next.

### Mobile Rendering Issues
- **Density**: 14 distinct bars squeezed horizontally into a narrow viewport.
- **Unreadable Text**:
    - The `desktop_on_mobile.png` clearly shows that text inside the bars (increments) and above the bars (totals) becomes microscopic or overlaps significantly.
    - X-axis labels (Months) are too small to read comfortably.
- **Aspect Ratio**: Waterfall charts typically require wide aspect ratios to show the "flow." The vertical aspect ratio of mobile devices compresses the visual steps, making comparisons difficult.

## 2. High-Level Transformation Strategy

The core strategy is **Coordinate System Transposition (Rotation)**.

Trying to keep the chart vertical (Bars growing up/down) on mobile will result in failure because the bars will be too thin to tap or read.

By **transposing the axes**:
1.  **Time (Categories)** moves to the **Y-Axis** (vertical).
2.  **Amount (Value)** moves to the **X-Axis** (horizontal).
3.  The chart becomes a **Horizontal Waterfall Chart**.

This layout leverages the natural vertical scrolling behavior of mobile devices. We can give each month a fixed, comfortable height (e.g., 40-50px), ensuring labels are legible and touch targets are adequate.

## 3. Design & Action Space Plan

### L0: Visualization Container
- **Action**: `Rescale` (Fit width, Dynamic Height).
- **Reasoning**: Instead of a fixed height `viewBox`, the container height will calculate based on the number of data points (e.g., `rows * fixed_row_height`). This prevents the chart from being squashed.

### L2: Coordinate System
- **Action**: `Transpose Axes` (Vertical Bars $\to$ Horizontal Bars).
- **Reasoning**: Solves the "Distorted layout" and "Overcrowding" issues. Allows the timeline to flow down the screen, which is intuitive for mobile users.

### L3: Axes
- **Action**: `Recompose (Remove)` Y-Axis Line/Ticks (now the Time axis).
- **Reasoning**: We will place the Month labels (Jan, Feb...) *inside* or *immediately to the left* of the chart area, styled as row headers, rather than a traditional axis line.
- **Action**: `Move` X-Axis (Amount) to Top or Bottom.
- **Reasoning**: Provide context for the magnitude of values.

### L2: Data Marks (The Bars)
- **Action**: `Rescale` (Fixed Height).
- **Reasoning**: Set bar thickness to ~32px-40px to ensure the internal text (+1707) is readable.
- **Action**: `Recompose (Change Encoding)` - **Implementation Details**:
    - Recharts does not have a native "Waterfall" mark.
    - **Solution**: Use a **Stacked Bar Chart**.
        - **Stack 1 (Transparent)**: Acts as the spacer. Calculated as `min(previous_cumulative, current_cumulative)`.
        - **Stack 2 (Colored)**: The actual bar. Calculated as `abs(monthly_change)`.
        - **Stack 3 (Total)**: For "Begin" and "End" bars, they start at 0.

### L4: Mark Labels (Text)
- **Action**: `Reposition` & `Simplify`.
- **Reasoning**:
    - **Incremental Change**: Place *inside* the bar (centered). If the bar is too short, hide it or move it outside.
    - **Running Total**: Since we are horizontal, place the running total text to the *right* of the bar (or left for negative flow, though right is safer for alignment).

### L2: Auxiliary Components (Connectors)
- **Action**: `Recompose (Remove)` or `Simplify`.
- **Reasoning**: Drawing the "connector lines" in Recharts on a horizontal layout is complex and might add visual clutter on mobile. We will omit the fine connector lines in favor of clear grid alignment or a slight "step" visual, as the colors sufficiently indicate the flow.

### L1: Interaction Layer
- **Action**: `Recompose (Replace)` Hover with Click.
- **Action**: `Fix Tooltip Position`.
- **Reasoning**: Tapping a bar will trigger a "Sheet" or "Card" at the bottom showing detailed breakdown: Month, Starting Balance, Change, Ending Balance.

## 4. Detailed Data Extraction & Transformation

We cannot use the raw `values` directly because we need the calculated fields (cumulative sums) which Vega-Lite calculated at runtime. We must implement the logic in TypeScript.

### Source Data
```javascript
const rawData = [
  {"label": "Begin", "amount": 4000},
  {"label": "Jan", "amount": 1707},
  {"label": "Feb", "amount": -1425},
  // ... rest of data
  {"label": "End", "amount": 0} 
];
```

### Transformation Logic (to be implemented in `src/components/Visualization.tsx`)

We need to generate a dataset compatible with Recharts Stacked Bars.

**Target Data Structure**:
```typescript
interface WaterfallDataPoint {
  label: string;      // e.g., "Jan"
  amount: number;     // e.g., 1707
  
  // Calculated fields for Recharts
  start: number;      // Value where the bar starts
  end: number;        // Value where the bar ends
  
  // For Stacked Bar rendering
  placeholder: number; // Transparent stack size (the bottom/left offset)
  barSize: number;     // The colored bar size (abs(amount))
  
  // For Styling
  fill: string;       // Color based on type (Inc/Dec/Total)
  
  // For Labels
  displayAmount: string; // "+1707"
  runningTotal: number;  // The cumulative value at this step
}
```

**Algorithm**:
1. Initialize `currentSum = 0`.
2. Iterate through `rawData`.
3. For **Begin**:
   - `start` = 0, `end` = `amount`.
   - `placeholder` = 0.
   - `barSize` = `amount`.
   - `currentSum` = `amount`.
4. For **Intermediate Months**:
   - `previousSum` = `currentSum`.
   - `currentSum` += `amount`.
   - `start` = `min(previousSum, currentSum)`.
   - `end` = `max(previousSum, currentSum)`.
   - `placeholder` = `start`.
   - `barSize` = `end - start` (which equals `abs(amount)`).
5. For **End**:
   - `start` = 0, `end` = `currentSum` (from Dec).
   - `placeholder` = 0.
   - `barSize` = `currentSum`.
6. Assign Colors:
   - Begin/End: `#f7e0b6` (Tailwind equivalent: `amber-200`)
   - Increase (>0): `#93c4aa` (Tailwind equivalent: `emerald-400`)
   - Decrease (<0): `#f78a64` (Tailwind equivalent: `orange-400`)

## 5. Visual Styling Plan (Premium Aesthetics)

- **Typography**: Inter or similar clean sans-serif. Bold for totals, regular for axis labels.
- **Palette**:
    - Background: Very light gray/slate (`bg-slate-50`) to make charts pop.
    - Card: White with soft shadow (`shadow-md`).
- **Glassmorphism**: Use a semi-transparent, blurred background for the "Summary" overlay when a bar is tapped.
- **Animation**: Recharts `Animation` easing on load.
- **Layout**:
    - **Header**: Title "Annual Financial Flow" & Subtitle "Monthly Deviation & Cumulative Balance".
    - **Chart Area**: Scrollable container if height > viewport, but with 14 items it might fit on a tall screen. We will allow it to expand naturally.
    - **Legend**: Simple dots at the top (Begin/End, Increase, Decrease).

## 6. Implementation Steps

1.  **Data Processing**: Write the utility function to transform the raw JSON into the "Stacked Bar" format described above.
2.  **Component Skeleton**: Create the Next.js component structure.
3.  **Chart Setup**:
    - Import `BarChart`, `Bar`, `XAxis`, `YAxis`, `ReferenceLine`, `ResponsiveContainer` from Recharts.
    - Set `layout="vertical"`.
    - Configure two `<Bar />` components:
        - Bar 1: `dataKey="placeholder"`, `stackId="a"`, fill="transparent".
        - Bar 2: `dataKey="barSize"`, `stackId="a"`, fill dynamically based on payload.
4.  **Custom Tick**: Create a custom Y-Axis tick component to render the Month labels cleanly aligned to the left.
5.  **Custom Label**: Create a custom label component for the bars to conditionally render the text inside (if fits) or outside.
6.  **Interactive Tooltip**: Implement a `CustomTooltip` that overrides default Recharts behavior to look like a premium mobile card.
7.  **Final Polish**: Add Tailwind classes for spacing, fonts, and "glass" effects.