# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Details
- **Type**: Nightingale Rose Chart (Coxcomb Chart) / Variable Radius Pie Chart.
- **Encoding**: Double encoding. The data value determines both the **Angle** (`theta`) and the **Radius** (`radius`).
- **Data**: A simple array of quantitative values: `[12, 23, 47, 6, 52, 19]`.
- **Labels**: Numeric values placed externally at the end of each slice.
- **Aesthetics**: Bright, categorical color scheme (Yellow, Green, Teal, Red, Orange, Blue). White background.

### Mobile Challenges
1.  **Redundant Encoding**: The double encoding (Angle + Radius) creates complex shapes that are difficult to compare accurately on small screens.
2.  **Label Collision**: External labels (L4 MarkLabel) floating around a radial chart often overlap or get cut off (`Out of viewport`) on narrow mobile screens.
3.  **Readability**: The smallest slice (value 6) is very close to the center and hard to tap or see clearly.
4.  **Recharts Limitation**: Standard Recharts does not natively support a true "Rose Chart" (where both angle and radius vary dynamically per slice) easily without complex custom paths.

## 2. High-Level Strategy

To ensure "Premium Aesthetics" and "Mobile-First UX" while adhering to the Action Space:

1.  **Recompose (Change Encoding)**: I will transform the Rose Chart into a **Donut Chart**.
    *   *Why*: Recharts handles Donut charts perfectly. While the Rose chart is visually unique, the Donut chart preserves the "Part-to-Whole" relationship more cleanly on mobile. The double encoding (radius + angle) of the original is visually interesting but analytically distracting on a small screen.
2.  **Reposition (Externalize) & Serialize Layout**: Instead of floating labels, I will move the data into a **Scrollable Legend/List** below the chart.
    *   *Why*: This solves the label collision issue. It allows for large, readable typography for the values.
3.  **Interaction (Feedback)**: Utilize the center of the Donut (the "Hole") to display the currently selected data point's value, triggered by a click/tap.
    *   *Why*: This uses the `Compensate` strategy, utilizing empty space to show detail on demand.

## 3. Data Extraction

I will extract the raw data directly from the HTML source `spec.data.values`.

**Extracted Dataset:**
```json
[
  { "id": "1", "value": 52, "fill": "var(--color-yellow)" }, // Largest (Yellow)
  { "id": "2", "value": 47, "fill": "var(--color-green)" },  // (Green)
  { "id": "3", "value": 23, "fill": "var(--color-teal)" },   // (Teal)
  { "id": "4", "value": 19, "fill": "var(--color-red)" },    // (Red)
  { "id": "5", "value": 12, "fill": "var(--color-orange)" }, // (Orange)
  { "id": "6", "value": 6,  "fill": "var(--color-blue)" }    // Smallest (Blue)
]
```
*Note: Since the original data has no category names, I will map them to generic "Group" names or simply emphasize the values, as the value itself acts as the label in the original.*

## 4. Implementation Plan (Action Space)

### Step 1: L0 Visualization Container
*   **Action**: `Rescale` & `Reposition`
*   **Plan**: Create a responsive card container with glassmorphism effects (`backdrop-blur`). Use a vertical flex layout: Chart at the top, Data List at the bottom.
*   **Reasoning**: Ensures the chart fits within the viewport width while allocating vertical space for the data list.

### Step 2: L2 Data Marks (The Chart)
*   **Action**: `Recompose (Change Encoding)` -> **Donut Chart**
*   **Plan**: Use Recharts `<PieChart>` with `innerRadius={60}` and `outerRadius={100}`.
*   **Action**: `Recompose (Remove)` (Encoding)
*   **Plan**: Remove the "Radius" encoding. All slices will have the same outer radius. Only the Angle will represent the value.
*   **Reasoning**: Improves tap targets for small values (like '6') and simplifies the visual cognitive load on mobile.

### Step 3: L2 Annotations (Labels)
*   **Action**: `Reposition (Externalize)`
*   **Plan**: Remove `<Label>` from the chart slices. Create a `DataList` component below the chart.
*   **Action**: `Compensate (Number/Color)`
*   **Plan**: The list items will have a color indicator (dot/bar) matching the chart slice.
*   **Reasoning**: Externalizing labels prevents clutter. The list allows us to display the Value (e.g., "52") and the Percentage (calculated dynamically) side-by-side legibly.

### Step 4: L5 Interaction
*   **Action**: `Recompose (Replace)` (Hover -> Tap)
*   **Plan**: Implement an `activeIndex` state. Tapping a slice or a list item highlights it.
*   **Action**: `Reposition (Fix)` (Tooltip)
*   **Plan**: Instead of a floating tooltip, display the **Active Value** inside the center of the Donut.
*   **Reasoning**: Solves the "Fat-finger problem". The center of the donut is premium real estate for the "Focus" context.

### Step 5: Premium Aesthetics
*   **Palette**: Map the original Vega colors to a modern Tailwind palette (e.g., `amber-400`, `emerald-500`, `teal-400`, `rose-500`, `orange-400`, `blue-500`).
*   **Motion**: Add a scale-up animation on the active slice (`Recharts Cell` animation).
*   **UI**: Use a dark-mode friendly card with subtle borders and shadows.

## 5. Detailed Component Structure

**File:** `src/components/Visualization.tsx`

1.  **State Management**: `useState` for `activeIndex` (default to the largest slice, index 0).
2.  **Helper Functions**: Calculation for "Total" to derive percentages.
3.  **Layout**:
    *   **Header**: Title "Data Distribution" (Since original lacks a title, we provide a generic one).
    *   **Chart Section**:
        *   `ResponsiveContainer` -> `PieChart`.
        *   `Pie`: Data mapped to `Cell`s.
        *   `Label`: **Center Label** component showing the value of the `activeIndex`.
    *   **Legend/List Section**:
        *   Vertical list of items.
        *   Each item: Color Indicator | Value | Percentage bar/text.
        *   Clicking an item updates `activeIndex`.

This plan transforms the "visually complex" desktop Rose chart into a "clean, interactive, and readable" mobile Donut dashboard.