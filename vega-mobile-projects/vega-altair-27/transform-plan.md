# Mobile Visualization Transformation Plan

## 1. Desktop Visualization Analysis

### Original Visualization Characteristics
- **Type**: Multi-series Line Chart (Smoothed/Basis interpolation).
- **Data**: Three series (Categories A, B, C) plotted over a continuous X-axis (0-99).
- **Y-Axis**: Range approx -20 to +15.
- **Interaction**: Hovering over the chart displays a vertical rule and a tooltip showing values for all three categories at that X coordinate.
- **Layout**: Chart takes up 80% width, Legend is placed on the right sidebar.
- **Visual Style**: Standard Vega-Lite styling with gridlines on both axes.

### Issues in Mobile Aspect Ratio
- **Compression**: The horizontal compression makes the lines appear much steeper and more erratic ("jagged"), making trend analysis difficult.
- **Legend Displacement**: The right-aligned legend consumes approximately 20-25% of the precious horizontal screen width, severely cramping the chart area.
- **Touch Usability**: The "Hover" interaction to see specific values is impossible on touch devices without specific handling. Floating tooltips often get covered by the user's finger.
- **Label Density**: X-axis labels (0, 5, 10...) might become too crowded on a narrow screen.

## 2. Design Action Plan

Based on the **Vis2Mobile Design Action Space**, I plan to execute the following actions to transform this into a premium mobile component.

### L0: Visualization Container
- **Action: `Rescale`**: Set width to 100% and height to a fixed comfortable viewing height (e.g., 350px or 40vh). This ensures the chart fills the width of the mobile device.
- **Action: `Reposition`**: Remove the default extensive margins. The chart should be the hero element.

### L1: Interaction Layer & Feedback
- **Action: `Recompose (Replace)` (Triggers)**: Replace `Hover` triggers with `Touch/Drag`. Users will drag their finger across the chart to inspect values.
- **Action: `Reposition (Fix)` (Feedback)**: instead of a floating tooltip that follows the finger (which gets blocked by the hand), I will **externalize** the tooltip data.
    - *Implementation*: Use a **"Sticky Information Header"** or a **"Data Display Area"** above the chart. When the user touches the chart, this area updates with the values for X, A, B, and C. This solves the "Fat-finger problem" and ensures readability.

### L2/L3: Legends & Auxiliary Components
- **Action: `Reposition`**: Move the Legend from the **Right** to the **Top**.
- **Action: `Compensate (Toggle)`**: Convert the Legend items into interactive "Pill" toggles.
    - *Why*: Mobile screens are small. If the user wants to focus on comparing 'A' and 'B', they should be able to toggle 'C' off to reduce visual clutter (`Recompose (Remove)`).
- **Action: `Transpose`**: Arrange legend items in a horizontal row (`flex-row`) instead of a vertical stack.

### L3/L4: Coordinate System (Axes & Ticks)
- **Action: `Decimate Ticks`**: Reduce the tick count on the X-axis. The desktop has a tick every 5 units. On mobile, I will reduce this (e.g., every 20 or 25 units) to prevent label overlap.
- **Action: `Recompose (Remove)` (Gridlines)**: Remove vertical gridlines to reduce visual noise. Keep horizontal gridlines but make them subtle (dashed/light gray) to aid in reading Y-values.
- **Action: `Recompose (Remove)` (Axis Titles)**: The context is usually clear from the title or data. Axis titles often take up too much space on mobile. If needed, units can be added to the tick labels.

### L2: Data Marks
- **Action: `Rescale`**: Increase the stroke width of the lines slightly (e.g., to 2.5px or 3px) to make them stand out more against a small screen, especially when using a "Glassmorphism" background.
- **Action: `Recompose (Change Encoding)`**: Ensure the interpolation remains "monotone" or "basis" to match the original smoothed look.

## 3. Detailed Implementation Plan

### Component Structure
1.  **`CardContainer`**: A main wrapper with `glassmorphism` styling (backdrop-blur, semi-transparent background, subtle border).
2.  **`Header`**:
    *   **Title**: "Category Trends" (or similar derived context).
    *   **Active Data Display**: A dynamic row showing the values of A, B, and C for the currently selected X index. If inactive, shows the Legend pills.
3.  **`ChartArea`**:
    *   Recharts `<ResponsiveContainer>` wrapping a `<LineChart>`.
    *   Custom `<Tooltip>` cursor (vertical line) but **no content tooltip** (content is moved to the Header).
    *   `onMouseMove` / `onTouchMove` handlers to update the state of the Header.
4.  **`ControlPanel`** (Optional): If not integrating legend into the header, place legend pills here.

### Data Transformation
The original data is in **Long Format** (Array of objects where each object is one point for one category).
Recharts requires **Wide Format** (Array of objects where each object has `x` and keys for `A`, `B`, `C`).

I will implement a transformation function:
1.  Group by `x`.
2.  Merge `y` values into a single object per `x`.
3.  Result: `[{ x: 0, A: 0.5, B: -0.14, C: 0.65 }, { x: 1, ... }]`.

### Styling Strategy (Tailwind)
-   **Palette**: Dark/Slate theme or clean White theme.
    -   Category A: Blue-500
    -   Category B: Orange-500
    -   Category C: Red-500 (Approximating the original Vega colors).
-   **Typography**: Inter or system-ui. Large numbers for the "Active Data Display" to ensure readability.
-   **Animations**: Smooth transitions when toggling lines on/off.

## 4. Data Extraction

I will extract the raw JSON data from the `spec.datasets` object in the HTML source.

**Extraction Logic**:
1.  Locate the script tag containing `var spec = ...`.
2.  Parse the JSON.
3.  Extract `spec.datasets['data-7c039fddadc746e6fe52e7403103ac2c']`.
4.  Transform this array into the **Wide Format** required for Recharts.

**Extracted Data Snippet (Pre-computation)**:
```json
// I will transform the provided long list:
// {"x": 0, "category": "A", "y": 0.5}, {"x": 0, "category": "B", "y": -0.14}, ...
// Into:
// [
//   { "x": 0, "A": 0.5, "B": -0.14, "C": 0.65 },
//   { "x": 1, "A": 2.02, "B": -0.37, "C": 0.41 },
//   ...
// ]
```

This plan ensures all information is retained (exact coordinates), but the UX is fundamentally shifted to accommodate touch interactions and small screen sizes.