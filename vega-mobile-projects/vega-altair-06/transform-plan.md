# Vis2Mobile Plan: Temperature Variation by Month

## 1. Analysis of Original Visualization

### Desktop Version
- **Type**: Range Bar Chart (Interval Bar Chart).
- **Data**: Aggregated monthly weather data (Seattle 2012-2015).
- **Axes**: 
  - Y-Axis: Categorical (Months Jan-Dec).
  - X-Axis: Quantitative (Temperature °C).
- **Marks**: Horizontal bars representing the span between the minimum `temp_min` and maximum `temp_max` recorded for that month.
- **Labels**: Explicit text labels placed at the left and right ends of the bars indicating the specific min/max values.
- **Aesthetics**: Functional, clean, "steel blue" color, standard gridlines.

### Mobile Issues (Desktop Rendered on Mobile)
1.  **Horizontal Constriction**: The horizontal aspect ratio on mobile compresses the bars, making the differences between months less perceptible.
2.  **Label Clipping/Overlap**: The labels (`-7.1`, `18.9`) placed horizontally outside the bars risk overlapping with the axis or being cut off at the screen edge if the margin isn't perfect.
3.  **Small Touch Targets**: The bars are relatively thin, making them hard to interact with (e.g., to see specific values via tooltip).
4.  **Text Readability**: The font size for labels and axes scales down, potentially becoming hard to read.

## 2. Design Action Space Plan

I will transform this into a **Vertical Range Bar Card** with interactive feedback.

### **L0: Visualization Container**
- **Action: Reposition (Margins/Padding)**
    - **Reasoning**: Mobile screens are narrow. I need to maximize the `chart area` width. I will reduce the default padding and ensure the chart container uses `width: 100%` with a responsive height.
- **Action: Rescale (Viewport)**
    - **Reasoning**: The chart height needs to be increased relative to the width to allow for taller bars and comfortable spacing between months.

### **L1: Data Model**
- **Action: Recompose (Aggregate)**
    - **Reasoning**: The source data is daily. I must replicate the original visualization's logic by grouping all records by `month` and calculating the global `min` and `max` for each month across all years. This preserves the "Variation by Month" narrative.

### **L2: Coordinate System**
- **Action: No Transpose (Keep Horizontal)**
    - **Reasoning**: While `Transpose` is a common mobile action, for time-series categories (Jan-Dec), a vertical list (Horizontal Bars) is actually superior on mobile because:
        1.  It aligns with natural vertical scrolling.
        2.  Y-axis labels (Month names) are horizontal and readable without rotation.
        3.  Converting to vertical bars (column chart) would crowd 12 columns into a 350px width, causing label overlap.

### **L2: Data Marks (Bars)**
- **Action: Rescale (Bar Size)**
    - **Reasoning**: Increase the bar size (thickness) to `24px` or `32px`. This makes the color gradient more visible and improves the "premium" feel.
- **Action: Change Encoding (Color)**
    - **Reasoning**: The original uses a flat blue. To achieve "Premium Aesthetics" and "Vibrant palettes," I will apply a linear gradient to the bars based on temperature (e.g., Cyan for cold end -> Orange/Red for hot end). This adds a second visual cue for temperature.
- **Action: Style (Rounded Corners)**
    - **Reasoning**: Apply full border radius to bar ends for a modern, friendly UI.

### **L3/L4: Axes & Ticks**
- **Action: Recompose (Remove) - Axis Line & Ticks**
    - **Reasoning**: The original chart relies heavily on direct labels (the numbers at the bar ends). The X-axis grid/ticks are redundant clutter on a small screen. I will hide the X-axis line and ticks, keeping only vertical gridlines for subtle context.
- **Action: Format (Y-Axis Labels)**
    - **Reasoning**: Use 3-letter abbreviations (Jan, Feb) to save horizontal space.

### **L4: Labels (Mark Labels)**
- **Action: Reposition (Smart Placement)**
    - **Reasoning**: Placing labels strictly *outside* (like the original) wastes about 60-80px of horizontal space.
    - **Plan**:
        - I will try to position labels *outside* first, but if space is tight, I will use **Reposition (Internalize)** for the values, placing them inside the bar ends with high-contrast text (white), or just above the bar in a "floating" style if the bar is too short.
        - Given the data range (-10 to 40), the bars are generally wide enough. I will likely keep them outside but use a dedicated column layout or Recharts' `LabelList` with strict margins.

### **L5: Interaction**
- **Action: Feedback (Tooltips)**
    - **Reasoning**: Implement a custom `Tooltip` that appears on touch. It will show the Month, Min Temp, Max Temp, and the Range (Delta).
    - **Action**: **Reposition (Fix)**: Ensure the tooltip doesn't fly off-screen by snapping it or using a portal.

## 3. Data Extraction Plan

The source HTML contains a JSON object in the `spec` variable.
1.  **Source**: `datasets['data-9cda1fa0376fcdc5d69536fab26b0d0b']`.
2.  **Processing**:
    -   Iterate through the array.
    -   Parse `date` to get the Month index (0-11).
    -   Maintain a mapping for each month: `{ min: Infinity, max: -Infinity }`.
    -   For each record:
        -   Update `month.min` if `record.temp_min` is lower.
        -   Update `month.max` if `record.temp_max` is higher.
    -   Format the output array: `[{ month: 'Jan', min: -7.1, max: 18.9 }, ...]`.
    -   Sort strictly by month index.

## 4. Implementation Steps

1.  **Setup Component**: Create `Visualization.tsx` with a Card container.
2.  **Process Data**: Implement the extraction logic described above inside a `useMemo`.
3.  **Construct Chart**:
    -   Use `ResponsiveContainer` and `BarChart` (layout="vertical").
    -   XAxis type="number" with domain `['auto', 'auto']` (or slightly padded like `[-10, 45]`).
    -   YAxis type="category" dataKey="month".
4.  **Implement Range Bars**:
    -   Use `Bar` component. Pass data as `[min, max]`.
    -   Create a custom SVG `defs` for the linear gradient.
5.  **Styling**:
    -   Add `LabelList` for the Min (position left) and Max (position right).
    -   Apply Tailwind classes for typography and glassmorphism effects on the container.
6.  **Refine Mobile UX**:
    -   Ensure Y-axis width is fixed and minimal (e.g., `width={40}`).
    -   Add a custom tooltip component.

This plan ensures all original data (min/max per month) is preserved, readability is enhanced via larger touch targets and clearer text, and the layout is optimized for vertical scrolling on mobile.