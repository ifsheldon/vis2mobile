# Vis2Mobile Transformation Plan: Seattle Weather Dual-Axis Chart

## 1. Analysis of Original Visualization

### Source Overview
- **Type**: Dual-Axis Combination Chart (Area + Line).
- **Context**: Weather data for Seattle (Monthly).
- **X-Axis**: Time (Months, Jan-Dec).
- **Y-Axis (Left)**: Average Maximum Temperature (°C) - Represented by a green area.
- **Y-Axis (Right)**: Average Precipitation (inches) - Represented by a blue line.
- **Narrative**: Comparing temperature trends against rainfall to show the correlation (e.g., higher temps correlate with lower rainfall in Seattle).

### Mobile Constraints & Issues (Desktop vs. Mobile)
1.  **Dual Axes Clutter**: On a narrow mobile screen, having labels on both the left and right sides significantly compresses the actual chart area (`drawing area`). It creates visual noise.
2.  **Touch Interaction**: The original relies on visual correlation. On mobile, precise value reading via hovering is impossible; "Fat-finger" problems will obscure data points if standard tooltips are used.
3.  **Label Readability**: Axis titles ("Avg. Temperature (°C)", "Precipitation (inches)") are rotated and small. They will be unreadable on mobile.
4.  **Data Overlap**: The overlapping Area and Line marks might become indistinguishable if the aspect ratio is too squat.

## 2. Design Action Space Mapping

To transform this into a premium mobile component, I will apply the following actions based on the `mobile-vis-design-action-space.md`:

### **L0: Visualization Container**
*   **Action**: `Rescale`
    *   **Reason**: The chart must adapt to the full width of the mobile device (`w-full`) while maintaining a taller aspect ratio (e.g., 3:4 or 1:1) than the desktop version to allow vertical breathing room for the two variables.
*   **Action**: `Reposition`
    *   **Reason**: Increase margins slightly to ensure the edge data points (Jan/Dec) aren't cut off.

### **L1: Data Model**
*   **Action**: `Recompose (Aggregate)`
    *   **Reason**: The original spec performs an aggregation (`average`) on the raw daily weather CSV. We must perform this aggregation in the data preparation phase to result in exactly 12 data points (one per month).

### **L2: Title Block**
*   **Action**: `Add` (Not present in original visual, but implied in spec)
    *   **Reason**: Add a clear Title ("Seattle Weather") and Subtitle ("Temperature vs. Precipitation") to provide immediate context without relying on rotated axis labels.

### **L3: Axes (Coordinate System)**
*   **Action**: `Recompose (Remove)` (Right Axis)
    *   **Reason**: **Crucial Decision**. Displaying two vertical axes on a mobile screen is bad UX. I will **remove the visual Y-axis for Precipitation (Right)** and potentially the left axis lines, keeping only minimal Left ticks for Temperature.
*   **Action**: `Recompose (Remove)` (Axis Titles)
    *   **Reason**: Remove "Avg. Temperature" and "Precipitation" rotated text. These will be moved to the Legend/Header area.
*   **Action**: `Simplify` (X-Axis)
    *   **Reason**: Ensure Month labels are short ("Jan", "Feb") to prevent overlap.

### **L3: Legend & Narrative**
*   **Action**: `Reposition`
    *   **Reason**: Instead of relying on axis color to identify data, place a **Custom Legend/Header** at the top. This header will show the value keys (e.g., a Green dot for Temp, Blue line for Rain).

### **L1: Interaction (Feedback & Triggers)**
*   **Action**: `Recompose (Replace)` (Hover -> Drag/Touch)
    *   **Reason**: Enable a drag gesture across the chart area.
*   **Action**: `Reposition (Fix)` (Tooltip)
    *   **Reason**: Implement a **"Heads-Up Display" (HUD)** or **Fixed Summary Card**. When the user touches the chart, instead of a floating tooltip near the finger (obscuring data), update the values in the Header/Legend area or a fixed overlay at the top. This solves the "missing axis" problem by showing exact values on demand.

### **L2: Data Marks**
*   **Action**: `Rescale`
    *   **Reason**:
        *   Thicken the Precipitation Line (Stroke width 3px -> 4px).
        *   Ensure the Temperature Area has a gradient fill (Glassmorphism) rather than flat opacity for a premium feel.

## 3. Data Extraction Plan

The original visualization uses a URL data source (`weather.csv`) and filters for "Seattle". Since I need to provide the component with **real data**, I will perform the aggregation conceptually here to guide the implementation.

**Source Data Logic**:
1.  Dataset: `weather.csv`
2.  Filter: `location == 'Seattle'`
3.  Group By: `month(date)`
4.  Calculate: `mean(temp_max)` and `mean(precipitation)`

**Extracted Data Structure for Component**:
The implementation must use a static array derived from this logic.
*   *Note*: Seattle typically has a wet winter and dry/warm summer.
*   **Data Shape**:
    ```typescript
    type WeatherData = {
      month: string; // "Jan", "Feb"...
      temp: number;  // Avg Max Temp (°C)
      precip: number; // Avg Precip (Inches)
    }[]
    ```

## 4. Implementation Steps

### Step 1: Component Structure & Layout (Next.js/Tailwind)
*   Create a container using a "Glassmorphic" card style (dark background, slight transparency, backdrop blur) to meet the "Premium Aesthetics" requirement.
*   Implement a **Header Section** containing the Title and a dynamic "Status Bar".
    *   *Default State*: Shows Legend (Green Dot: Temp, Blue Line: Rain).
    *   *Active State (Touch)*: Shows specific values for the selected month (e.g., "Aug: 26°C | 0.8 in").

### Step 2: The Visualization (Recharts)
*   Use `<ComposedChart>`.
*   **X-Axis**: `<XAxis>` with `dataKey="month"`, `tickLine={false}`, `axisLine={false}`, `interval={0}` (or 1 if crowded).
*   **Y-Axis (Left)**: `<YAxis>` for Temperature. Hide the axis line (`axisLine={false}`), keep minimal tick numbers.
*   **Y-Axis (Right)**: `<YAxis>` for Precipitation. **Hide completely** (`hide={true}`) but keep the `yAxisId="right"` to scale the data correctly.
*   **Marks**:
    *   `<Area>` for Temperature: Use `yAxisId="left"`. Add a `<defs>` linear gradient (Green to transparent) for a modern look.
    *   `<Line>` for Precipitation: Use `yAxisId="right"`. Color: Blue. Smooth curve (`type="monotone"`). Add a drop shadow filter to the line for depth.

### Step 3: Mobile-First Interaction
*   Use Recharts `<Tooltip>` with a custom `content` prop.
*   **Crucial**: The custom tooltip will **not** render a floating bubble. instead, it will invoke a callback (`onMouseMove` / `activePayload`) to update the **Header Section** state defined in Step 1.
*   Add a `<CartesianCursor>` that highlights the vertical slice but doesn't block the view.

### Step 4: Styling & Polish
*   Typography: Use Tailwind's tabular nums (`tabular-nums`) for the data values in the header to prevent jitter during scrubbing.
*   Colors:
    *   Temp: Emerald/Teal spectrum (`#34d399` to transparent).
    *   Precip: Sky/Blue spectrum (`#38bdf8`).
    *   Background: Dark slate/Zinc (`bg-zinc-900`).

## 5. Justification for "Missing" Actions
*   I am not using **Small Multiples (Facet)** because comparing the *intersection* of high rain and low temp is the specific narrative purpose of this chart. Splitting them breaks the immediate visual correlation.
*   I am essentially using **Compensate (Number/Value)** by moving the exact reading of values to the interaction layer (Header), allowing me to remove the cluttered secondary axis.

This plan ensures high readability (no small rotated text), premium UX (interactive scrubbing), and mobile optimization (full width, touch-friendly).