# Mobile Visualization Plan: Layered Histogram

## 1. Analysis of Desktop Visualization

**Original Visualization Characteristics:**
*   **Type:** Layered Histogram (Overlapping Bar Chart).
*   **Data Structure:** Three experimental trials (Trial A, Trial B, Trial C) measuring a quantitative variable.
*   **Visual Encodings:**
    *   X-Axis: Measurement values (binned, approx range -5 to 11).
    *   Y-Axis: Count of records (Frequency).
    *   Color: Nominal encoding for the 3 Trials (Blue, Orange, Red).
    *   Opacity: Semi-transparent (0.3) to show overlapping distributions.
*   **Desktop Layout:** Chart on the left, Legend on the right. High bin count (maxbins: 100), resulting in fine-grained, thin bars.

**Mobile Challenges:**
1.  **Horizontal Space:** The side-by-side legend layout compresses the chart area significantly on mobile.
2.  **Bin Density:** 100 bins on a mobile screen (approx 350-400px wide) result in bars that are only ~3px wide. This creates visual noise ("jaggedness") and makes distinct distributions hard to read.
3.  **Overplotting:** With three overlapping semi-transparent layers, the visual information becomes muddy on a small screen, especially where all three overlap.
4.  **Touch Interaction:** Hovering over specific thin bars to see counts is impossible on touch devices.

## 2. Design Action Space & Transformation Plan

Based on the `mobile-vis-design-action-space.md`, here is the transformation plan:

### L1 Data Model
*   **Action: `Recompose (Aggregate)` (Re-binning)**
    *   **Reasoning:** The original 100 bins are too dense for mobile. I will re-aggregate the raw data into fewer bins (e.g., 25-30 bins). This increases the width of the bars (`L4 Mark Instance: Rescale`), making the distributions smoother and easier to read on a small screen without losing the overall shape.

### L3 Legend Block
*   **Action: `Reposition` (Move to Top)**
    *   **Reasoning:** Moving the legend from the right side to the top (`L3 Legend Block`) frees up the entire screen width for the chart (`L0 Visualization Container: Rescale`).
*   **Action: `Transpose` (Horizontal Layout)**
    *   **Reasoning:** Align legend items horizontally to fit the top bar context efficiently.

### L1 Interaction Layer / L2 Features
*   **Action: `Recompose (Add Filter/Focus)`**
    *   **Reasoning:** To solve the "muddy overlap" issue on mobile, I will make the legend interactive. Tapping a Legend Item will toggle the visibility or opacity of that specific Trial. This allows users to view one or two distributions clearly without visual interference.

### L5 Feedback (Tooltip)
*   **Action: `Reposition (Fix)`**
    *   **Reasoning:** Instead of a floating tooltip that gets covered by the finger, I will use a custom Tooltip component that snaps to the top or uses a fixed overlay area, or simply ensure the Recharts tooltip is styled large enough and positioned intelligently.

### L3 Axes & L4 Ticks
*   **Action: `Decimate Ticks`**
    *   **Reasoning:** Reduce the number of X-axis ticks to prevent label overlap (`Cluttered text`).
*   **Action: `Recompose (Remove)`**
    *   **Reasoning:** Remove the Y-axis gridlines (`L3 Gridlines`) to reduce visual noise, keeping only horizontal guides if necessary, or removing them entirely for a cleaner "Premium" look.

## 3. Data Extraction Plan

The data is embedded in the HTML file under `datasets`. I need to extract and transform it from "Wide" format to "Long" format suitable for Recharts and manual binning.

**Source Data Snippet:**
```json
[
  {"Trial A": 0.397, "Trial B": -0.600, "Trial C": 1.649},
  {"Trial A": -0.110, "Trial B": -1.075, "Trial C": 2.710},
  ...
]
```

**Transformation Logic (in Component):**
1.  **Flatten:** Iterate through the array. For each object, create 3 entries: `{ type: "Trial A", value: 0.397 }`, `{ type: "Trial B", value: -0.600 }`, etc.
2.  **Calculate Extents:** Find global Min (-5) and Max (11) values.
3.  **Binning:**
    *   Define `Bin Count` = 30 (optimized for mobile).
    *   `Bin Width` = (Max - Min) / Bin Count.
    *   Create an array of bin objects: `{ binStart: number, binEnd: number, "Trial A": 0, "Trial B": 0, "Trial C": 0 }`.
4.  **Populate:** Iterate flattened data, determine which bin it falls into, and increment the counter for that specific Trial.
5.  **Result:** An array suitable for Recharts `<BarChart>` where each object represents a bin and contains counts for all 3 trials.

## 4. Implementation Steps

1.  **Scaffold Component:** Create `src/components/Visualization.tsx`.
2.  **Data Processing:**
    *   Copy the raw JSON data into a constant.
    *   Implement the `processData` function to flatten and bin the data as described above.
3.  **Layout Structure:**
    *   Use a `Card` container with glassmorphism effects (`backdrop-blur`, `bg-opacity`).
    *   Header: Title "Experiment Analysis" + Subtitle "Distribution of measurements across trials".
    *   Legend: Custom buttons row at the top. Active state = colored; Inactive = grayed out.
4.  **Chart Implementation (Recharts):**
    *   Use `<ResponsiveContainer>` (L0 Rescale).
    *   Use `<BarChart>` with the binned data.
    *   XAxis: formatted to show range (e.g., "-5").
    *   YAxis: hide axis line (`L4 Recompose`), show only essential ticks.
    *   **Marks:** Three `<Bar>` components.
        *   `dataKey="Trial A"`, `dataKey="Trial B"`, etc.
        *   **Crucial:** Do *not* use `stackId` (to make them layered/overlapping).
        *   **Styling:** Use `fillOpacity={0.6}` to simulate the desktop's transparency. When a user focuses on one, increase its opacity to 1.0 and lower others to 0.1.
5.  **Interaction:**
    *   State: `activeSeries` (array of selected trials).
    *   `CustomTooltip`: Design a clean tooltip showing the bin range and the count for active trials.
6.  **Refinement:**
    *   Add smooth animations (Framer Motion or Recharts default) for state changes.
    *   Ensure typography is legible (Tailwind `text-sm`, `text-xs` for axes).

## 5. Mobile Readability Assurance
*   **Bin Width:** By manually reducing bins to ~30, each bar will be roughly 10px wide on a mobile screen, which is legible.
*   **Contrast:** Using distinct but harmonious colors (Blue/Orange/Red palette) with varying opacity ensures overlap regions are visible but not confusing.
*   **Focus Mode:** The interactive legend allows users to "de-clutter" the view instantly, a key mobile usability feature lacking in the static desktop image.