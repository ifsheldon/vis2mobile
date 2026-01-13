# Mobile Visualization Transformation Plan

## 1. Desktop Visualization Analysis

### Source Overview
The original visualization is a **Multi-Line Chart** created with Vega-Lite showing the rise of Carbon Dioxide (CO2) in the atmosphere over several decades.

- **Data**: CO2 concentration (ppm) vs. Date.
- **X-Axis**: "Year into Decade" (0 to 10). This effectively overlays every decade on top of each other to compare the rate of increase and seasonal cycles.
- **Y-Axis**: CO2 concentration in ppm (Non-zero baseline, roughly 310-420 range).
- **Marks**:
    - **Lines**: Multiple lines, one per decade.
    - **Color Encoding**: Magma color scheme mapped to the `decade` field.
    - **Text Labels**: Years (e.g., "1960", "2018") placed at the *start* and *end* of each line to identify the decade.
- **Narrative**: It shows two trends simultaneously: the seasonal oscillation (zigzag) and the secular trend of increasing CO2 levels (lines stacking upwards).

### Mobile Challenges
1.  **Label Overcrowding (Clutter)**: The desktop version labels the start and end of *every* decade line. On a narrow mobile screen, these text labels will overlap significantly, rendering them unreadable.
2.  **Aspect Ratio**: The wide aspect ratio of the desktop chart makes the vertical rise (the main story) less dramatic when squashed horizontally.
3.  **Touch Interaction**: Hovering to isolate a specific decade is impossible on touch screens.
4.  **Tooltip Occlusion**: Standard tooltips following the finger will be blocked by the user's hand.

## 2. Vis2Mobile Transformation Plan

Based on the `mobile-vis-design-action-space.md`, here is the transformation plan.

### High-Level Strategy
I will transform this into a **Scrollable Vertical Layout** containing a square or portrait-oriented interactive chart. The primary interaction model will shift from "passive viewing with labels" to "active exploration" via touch.

### Detailed Actions by Layer

#### **L0: Visualization Container**
*   **Action**: `Rescale` (Aspect Ratio).
    *   *Reasoning*: Change from landscape (wide) to Square (1:1) or Portrait (4:5). This increases the vertical resolution, allowing the distinct gap between decades (the Y-axis rise) to be more visible.
*   **Action**: `Reposition` (Margins).
    *   *Reasoning*: Minimize side margins to maximize chart width (data-ink ratio).

#### **L1: Data Model**
*   **Action**: `Recompose (Aggregate/Transform)` (Preserve Logic).
    *   *Reasoning*: I must replicate the "Year into Decade" logic (`year % 10 + month/12`). This is crucial for the "overlay" effect. I will not aggregate data (e.g., to yearly averages) because the seasonal fluctuation is part of the narrative.

#### **L2: Narrative & Interaction (Triggers/Feedback)**
*   **Action**: `Recompose (Replace)` Triggers.
    *   *Reasoning*: Replace `Hover` with `Touch/Drag`.
*   **Action**: `Reposition (Fix)` Feedback.
    *   *Reasoning*: **Fixed Tooltip/Header**. Instead of a floating tooltip near the finger, I will use a **Dynamic Header** or a specific "Active Data" area above the chart that displays the Year, Month, and CO2 Value of the currently touched line.
*   **Action**: `Focus` (New Action).
    *   *Reasoning*: When a user drags across the chart, the "closest" decade line should highlight (increase opacity/stroke width) while others fade slightly. This solves the "Spaghetti plot" issue.

#### **L3: Coordinate System (Axes)**
*   **Action**: `Recompose (Remove)` Gridlines.
    *   *Reasoning*: Remove vertical gridlines to reduce visual noise. Keep horizontal lines subtle.
*   **Action**: `Adjust Ticks` (X-Axis).
    *   *Reasoning*: The X-axis represents 0-10 years. On mobile, labeling 0, 1, 2...10 is too crowded. I will `Decimate Ticks` to show only even numbers (0, 2, 4, 6, 8, 10) or just Start/Mid/End.

#### **L4: Data Marks & Labels**
*   **Action**: `Recompose (Remove)` & `Compensate (Interaction)`.
    *   *Reasoning*: The original static text labels (1960, 1970...) at line ends are the biggest issue. I will **remove** most intermediate static labels.
    *   *Compensation*:
        1.  Permanently label only the **First** (1958) and **Last** (Current) decade lines to frame the context.
        2.  Use the **Dynamic Header** (Interaction) to reveal the specific year of any other line when touched.
*   **Action**: `Rescale` Stroke Width.
    *   *Reasoning*: Use slightly thinner lines (e.g., 1.5px) for the non-active decades to accommodate the high density, and thicker (3px) for the active/touched line.

#### **L5: Legend**
*   **Action**: `Recompose (Remove)`.
    *   *Reasoning*: The color gradient (Magma) is intuitive (dark to light = old to new). A discrete legend with 7+ items takes too much space. The interactive labeling replaces the need for a separate legend.

## 3. Data Extraction & Processing

I will create a utility function to fetch and process the CSV data, mirroring the Vega transformations.

**Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/co2-concentration.csv`

**Processing Logic (TypeScript/JS)**:
1.  **Fetch**: Retrieve CSV.
2.  **Parse**: Convert string dates to Date objects.
3.  **Transform**:
    *   `year`: `date.getFullYear()`
    *   `decade`: `Math.floor(year / 10) * 10` (Note: Original spec logic `floor(year/10)` results in just the decade prefix like 196, 197. I will normalize this to 1960, 1970 for better readability).
    *   `scaled_date`: `(year % 10) + (month / 12)`. This creates the X-axis coordinate (0.0 to 9.99).
4.  **Grouping**: Group data by `decade` to form separate series for Recharts.
5.  **Colors**: Generate an array of hex codes approximating the "Magma" scheme based on the number of decades.

## 4. Implementation Steps

1.  **Setup Component Structure**:
    - `src/components/Visualization.tsx`: Main container.
    - `src/utils/data-processing.ts`: Data fetching and transformation logic.
    - `src/components/ui/chart-tooltip.tsx`: Custom feedback component.

2.  **Implement Data Logic**:
    - Write the `processData` function to replicate the `scaled_date` logic exactly.
    - Ensure data is sorted by `scaled_date` for correct line drawing.

3.  **Develop Chart Layout (L0, L3)**:
    - Initialize `ResponsiveContainer` and `ComposedChart`.
    - Configure XAxis (`type="number"`, domain `[0, 10]`, formatter for ticks).
    - Configure YAxis (domain `['auto', 'auto']` or specific range to mimic zero=false).

4.  **Implement Marks (L2, L4)**:
    - Map through the grouped decades and render a `<Line />` for each.
    - Apply the "Magma" color palette.
    - Add `activeDot` prop to handle the touch feedback visual.

5.  **Add Mobile Interaction (L1, L5)**:
    - Implement a custom `Tooltip` that **does not** float. Instead, it updates a React state `activePayload`.
    - Render the content of `activePayload` in a fixed `<div>` above the chart (The Title/Narrative block).
    - This effectively moves the specific data values out of the crowded chart area.

6.  **Refine Aesthetics**:
    - Apply Glassmorphism to the container/header.
    - Use Lucide icons for context (e.g., `TrendingUp` icon).
    - Ensure font sizes are at least 12px for axis ticks and 16px for key data points.

7.  **Final Review**: Check against "Desktop on Mobile" issues (crowding, readability) to ensure they are solved.