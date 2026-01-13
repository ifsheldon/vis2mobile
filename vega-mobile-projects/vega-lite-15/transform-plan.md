# Vis2Mobile Transformation Plan

## 1. Analysis of Desktop Visualization

### Source Analysis
- **Type**: Multi-series Line Chart.
- **Data Content**: Stock prices over time (2000-2010) for 5 companies (AAPL, AMZN, GOOG, IBM, MSFT).
- **Layout**: Rectangular landscape aspect ratio.
- **Legend**: Located on the **right side**, listing full ticker names vertically.
- **Axes**:
    - X-Axis: Temporal (Years), roughly 10 ticks.
    - Y-Axis: Quantitative (Price 0-800), gridlines present.
- **Visual Encoding**: Distinct colors for each line.

### Mobile Issues (Desktop on Mobile)
1.  **Horizontal Compression**: The right-side legend consumes approximately 20-25% of the width. On a mobile screen (e.g., 375px wide), this squeezes the chart area significantly, making the slopes of the lines steeper and harder to read.
2.  **Occlusion**: With 5 series intersecting frequently (especially at the bottom range), fingers will cover the data points when trying to tap specific lines.
3.  **Small Text**: Axis labels and legend text become illegible when scaled down directly.
4.  **Hover Interaction**: The desktop version likely relies on mouse hover to distinguish lines or read specific values, which doesn't exist on mobile.

## 2. High-Level Design Strategy

The core strategy is **Space Reclamation & Interaction Conversion**.

1.  **Layout Transformation**: We must move the legend out of the horizontal flow to reclaim the full width of the mobile screen for the data.
2.  **Interaction Model**: Shift from "hover to inspect" to "scrub to inspect" and "tap to filter".
3.  **Focus Management**: Since 5 lines are cluttered on a small screen, we will implement an interactive legend that allows users to toggle series visibility or highlight specific ones.

## 3. Detailed Actions (Based on Action Space)

### L0: Visualization Container
*   **Action: `Rescale`**: Change the aspect ratio from landscape to a taller format (e.g., 1:1 or 4:3).
    *   *Reasoning*: Mobile screens scroll vertically. Giving the chart more height allows for better Y-axis resolution.
*   **Action: `Reposition`**: Remove standard margins and utilize full width (bleed layout) or card-based layout with minimal padding.

### L3: Legend Block (Critical Change)
*   **Action: `Reposition`**: Move legend from **Right** to **Bottom** or **Top**.
*   **Action: `Transpose`**: Change layout direction from `column` to `row` (flex-wrap).
*   **Action: `Interaction (Filter)`**: Turn legend items into "Filter Chips".
    *   *Reasoning*: The "Action Space" mentions `Recompose (Remove)` for clutter. By making the legend interactive, users can tap "GOOG" to hide others or highlight it. This solves the "Overplotting" issue without permanently deleting data.

### L3/L4: Axes & Ticks
*   **Action: `Decimate Ticks` (X-Axis)**: Reduce tick count from ~10 to 4-5.
    *   *Reasoning*: Avoid horizontal label overlap.
*   **Action: `Format Tick Label` (X-Axis)**: Shorten years (e.g., "2000" -> "'00").
    *   *Reasoning*: `Simplify labels` action to save horizontal space.
*   **Action: `Recompose (Remove)` (Y-Axis Line)**: Hide the vertical axis line, keep only gridlines and labels.
    *   *Reasoning*: Reduces visual noise (`L4 Axis Line`).
*   **Action: `Reposition` (Y-Axis Labels)**: Move labels inside the grid or to the far left with minimal width.

### L1: Interaction Layer & Feedback
*   **Action: `Reposition (Fix)` (Tooltip)**: Instead of a floating tooltip near the finger (which obscures data), use a **Fixed Info Block** (Title/Subtitle area) that updates dynamically as the user scrubs across the chart.
    *   *Reasoning*: Solves the "Fat-finger problem" and occlusion.
*   **Action: `Recompose (Replace)` (Triggers)**: Replace `hover` with `touch/drag` (Scrubbing). Recharts `activeDot` and `Cursor` will be tuned for touch.

## 4. Data Extraction Plan

The original HTML sources data from `https://vega.github.io/editor/data/stocks.csv`.

**Strategy**:
1.  **Fetch**: I will use a hardcoded JSON representation of this data to ensure the component is self-contained and does not rely on external fetches during the React render cycle for this demo.
2.  **Structure**:
    ```typescript
    type DataPoint = {
      date: string; // "Jan 2000"
      AAPL: number;
      AMZN: number;
      GOOG: number;
      IBM: number;
      MSFT: number;
    };
    ```
3.  **Transformation**: The original CSV is "long" format (symbol, date, price). I need to pivot this to "wide" format (date, AAPL_price, AMZN_price...) to work natively with Recharts.

## 5. Implementation Steps

1.  **Data Preparation**:
    *   Parse the provided CSV logic into a static JSON array.
    *   Ensure dates are formatted for easy parsing.

2.  **Component Skeleton**:
    *   Create a Card container with a glassmorphism header.
    *   Header contains the Chart Title and the "Fixed Tooltip" area (showing current date and prices when scrubbing).

3.  **Chart Construction (Recharts)**:
    *   `ResponsiveContainer` (width 100%, height 350px).
    *   `LineChart` with 5 `Line` components.
    *   Custom `XAxis` with formatted ticks.
    *   `Tooltip` set to custom content (or handled via `onMouseMove` state lifting to the header).

4.  **Styling & Aesthetics**:
    *   Define a vibrant color palette (Tailwind).
    *   Apply lucide-react icons for trend indicators (up/down arrows) in the summary.
    *   Style the Legend as a scrollable/wrappable row of buttons below the chart.

5.  **Interaction Logic**:
    *   Implement state `activeSeries`: If null, show all. If set, dim others (opacity 0.2) and highlight the active one.
    *   Implement state `currData`: Updates on chart hover/touch to show specific values in the header.

6.  **Mobile Optimization Verification**:
    *   Check font sizes (min 12px).
    *   Check touch targets for legend buttons (min 40px height).