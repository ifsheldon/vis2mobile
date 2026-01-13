# Vis2Mobile Transformation Plan: Penguin Body Mass Density Plot

## 1. Visualization Analysis & Design Strategy

### Original Desktop Visualization
- **Type**: Stacked Density Area Chart (KDE).
- **Data**: Distribution of body mass (g) across three penguin species (Adelie, Chinstrap, Gentoo).
- **Key Elements**:
    - **X-Axis**: Body Mass (g), range approx 2500g - 6500g.
    - **Y-Axis**: Density, range 0 - 0.002.
    - **Legend**: Vertical list on the right side.
    - **Colors**: Distinct blue (Adelie), orange (Chinstrap), red (Gentoo).
- **Issues in Mobile Ratio**:
    - **Layout Distortion**: The chart becomes vertically compressed, flattening the curves and making differences hard to distinguish.
    - **Space Efficiency**: The right-sided legend consumes ~20-30% of the screen width, severely cramping the chart data area.
    - **Readability**: Axis labels and tick values become microscopic when scaled down directly.

### Mobile-First Design Philosophy
We will transform this into a **"Species Mass Distribution Card"**. The focus will be on the *shapes* of the distribution to compare species sizes. We will maximize the chart width, move context (legends/titles) to the periphery, and use touch interaction to reveal precise data.

---

## 2. Design Action Space Plan

Based on the `mobile-vis-design-action-space.md`, here are the specific actions to be taken:

### **L0 Visualization Container**
*   **Action: `Rescale` (Aspect Ratio Adjustment)**
    *   *Why*: The desktop aspect ratio is too wide/short. We will change the aspect ratio to be taller (e.g., 4:3 or 1:1) to allow the density curves to have significant height, making the peaks distinct.
*   **Action: `Reposition` (Padding)**
    *   *Why*: Remove standard default margins and use the full width of the card, relying on internal padding only where text exists.

### **L3 Legend Block**
*   **Action: `Reposition` & `Transpose`**
    *   *Why*: The side legend is the biggest mobile blocker.
    *   *Plan*: Move the legend to the **Top** (below the title). Transpose it from a vertical list to a horizontal "Pill" layout. This frees up the full width for the chart.

### **L2 Coordinate System (Axes)**
*   **Action: `Recompose (Remove)` (Y-Axis)**
    *   *Why*: In density plots, the specific Y-value (e.g., 0.0012) is abstract to most users. The *relative* height is what matters.
    *   *Plan*: We will hide the Y-axis line and tick labels to save horizontal space. We will keep subtle horizontal gridlines for scale reference.
*   **Action: `Simplify labels` (X-Axis)**
    *   *Why*: To prevent overlapping text on narrow screens.
    *   *Plan*: Limit X-axis ticks to 4-5 key values (e.g., 3000, 4000, 5000, 6000) using `decimateTicks`.

### **L2 Data Marks (Area)**
*   **Action: `Interaction` (Scanning/Scrubbing)**
    *   *Why*: "Fat finger" problems make picking specific points hard.
    *   *Plan*: Implement a full-height vertical cursor (Custom Tooltip Cursor) that snaps to X-values. As the user drags across the chart, data updates.

### **L5 Feedback (Tooltip)**
*   **Action: `Reposition (Fix)`**
    *   *Why*: Standard floating tooltips cover the chart on mobile.
    *   *Plan*: Use a **Fixed Data Header** or a "Sticky Summary" at the top of the card that dynamically updates values as the user scrubs the chart. If no interaction, it shows the average or max values.

### **L2 Narrative Layer**
*   **Action: `Compensate (Annotations)`**
    *   *Why*: To make the chart "premium," we can add static markers for the "Peak Mass" of each species directly on the chart or in the summary, acting as a quick insight.

---

## 3. Data Extraction Plan

The original visualization calculates density (KDE) from raw data. Since we cannot run the Vega-Lite density transform in the React component easily without heavy libraries, we must codify the density curves into a static dataset for the `AreaChart`.

**Source Data Logic:**
The dataset contains three species. We need to construct an array of objects where each object represents a `mass` bin, and keys for the density of each species.

**Data Structure to Codify:**
```typescript
interface DataPoint {
  mass: number;      // The X-axis value (e.g., 2500, 2600...)
  Adelie: number;    // Density value
  Chinstrap: number; // Density value
  Gentoo: number;    // Density value
}
```

**Extraction Strategy**:
1.  Sample the X-axis (Body Mass) from 2500g to 6500g in steps of 100g.
2.  Estimate the Y-value (density) for each species curve based on the visual peaks in the source image:
    *   **Adelie (Blue)**: Peak around 3700g. Range ~2800-4600.
    *   **Chinstrap (Orange)**: Peak around 3700g (lower than Adelie). Range ~2700-4800.
    *   **Gentoo (Red)**: Peak around 5000g. Range ~3900-6300.
3.  Normalize values to match the visual proportions (Adelie is highest, Gentoo is widest/flatter).

---

## 4. Implementation Steps

### Step 1: Component Structure (`src/components/Visualization.tsx`)
1.  **Container**: A `Card` component with glassmorphism effects (`bg-white/90`, `backdrop-blur`).
2.  **Header**:
    *   **Title**: "Penguin Mass Distribution".
    *   **Subtitle**: "Density of body mass (g) by species".
    *   **Legend**: Flex-row of colored dots and text labels (Adelie, Chinstrap, Gentoo).
3.  **Chart Area**:
    *   `Recharts.ResponsiveContainer` (Height: 300px).
    *   `Recharts.AreaChart` with the codified data.
    *   **Gradients**: Define `<defs>` for linear gradients to fill the areas (fade from opaque color to transparent at bottom) for a premium look.
    *   **Areas**: Three `<Area>` components with `stackId="1"` (The original is stacked).
        *   *Correction*: Looking closely at the image, the areas overlap but the logic says "stacked". The Vega spec says `stack: zero` for y encoding, but `density` transform often implies layering. However, the image shows Blue completely *under* Orange in the middle? No, the image shows stacking (Blue + Orange + Red accumulates height). *Correction*: The Vega spec says `"stack": "zero"`. This means they are overlaid (layered on top of each other), NOT stacked cumulatively. **Wait, looking at the desktop PNG**: The colors mix. This implies opacity and layering (overlay), OR it's a streamgraph. The Vega spec says `"mark": "area"`. Usually, density plots are layered with opacity to compare shapes. However, if I use `stackId="1"`, they pile up. If I use no stackId, they overlap. The image looks like **Layered (Overlapping)** with opacity, because the Y axis is small (0.002). If stacked, it would be higher.
        *   *Decision*: Use **Layered** (no stackId) with `fillOpacity={0.6}` to allow comparison of shapes, as is standard for density distribution comparisons.
4.  **Interaction Layer**:
    *   `Tooltip`: Custom content. Instead of a floating box, we can use a callback on `onMouseMove` to update a state variable, which renders details in a "highlight box" above the chart.
    *   If standard Tooltip is used, set `position={{ y: 0 }}` to fix it at top, preventing occlusion.

### Step 2: Styling (Tailwind)
-   **Typography**: `font-sans`, dark gray for text (`text-slate-700`), lighter gray for axes (`text-slate-400`).
-   **Colors**:
    -   Adelie: `#4C78A8` (Blue)
    -   Chinstrap: `#F58518` (Orange)
    -   Gentoo: `#E45756` (Red)
-   **Effects**:
    -   Soft shadows on the card `shadow-xl`.
    -   Rounded corners `rounded-2xl`.

### Step 3: Refinement
-   **X-Axis**: Hide axis line (`axisLine={false}`), hide tick lines (`tickLine={false}`), style tick labels small.
-   **Animation**: Enable Recharts default animation for "wow" factor on load.

### Step 4: Data Codification (Manual Estimation for Planner)
I will provide the approximate data points in the code to ensure the shapes match the `desktop.png`.

*Self-Correction*: The prompt implies "Codify Data" means I should provide the data in the plan or instructions.
*Data Instruction*:
Create a dataset with ~20 points representing the bell curves.
- **Adelie**: Normal dist centered at 3700, sigma 400.
- **Chinstrap**: Normal dist centered at 3750, sigma 450 (lower peak).
- **Gentoo**: Normal dist centered at 5000, sigma 500.
Calculate these generic normal distribution values into the JSON array.

## Summary of Changes
| Feature | Desktop | Mobile Premium | Action Taken |
| :--- | :--- | :--- | :--- |
| **Layout** | Wide, Legend Right | Vertical Card, Legend Top | `Transpose`, `Reposition` |
| **Y-Axis** | Visible, Abstract numbers | Hidden, Visual only | `Recompose (Remove)` |
| **X-Axis** | Standard ticks | Simplified, minimal ticks | `Simplify labels` |
| **Interaction** | Hover Tooltip | Scrubbing + Fixed Header | `Reposition (Fix)`, `Trigger (Touch)` |
| **Aesthetics** | Flat, Default Vega | Glassmorphism, Gradients | `Premium Aesthetics` |