# Vis2Mobile Transformation Plan

## 1. Analysis of Original & Mobile Issues

### Original Visualization (Desktop)
*   **Type:** Faceted Density Plot (Ridgeline Plot) created with Vega-Lite.
*   **Data Structure:** Tidy data representing penguin measurements (Beak Length, Beak Depth, Flipper Length).
*   **Layout:** Three vertically stacked area charts.
*   **Key Visual Characteristic:** All three charts share a **single continuous X-Axis domain** (roughly 0 to 240).
*   **Flaw in Desktop View:** Because "Beak Depth" (~15mm) and "Flipper Length" (~200mm) are on the same scale, the Beak distributions are squashed into thin spikes on the left, and Flipper Length is a blob on the right. There is massive wasted whitespace.

### Mobile Rendering Issues (`desktop_on_mobile.png`)
1.  **Unreadable Axes:** The shared x-axis labels will be microscopic.
2.  **Vertical Text:** The row labels ("Measurement Type", "Beak Depth", etc.) are rotated 270 degrees on the left. This requires users to tilt their heads to read on mobile.
3.  **Wasted Space:** The "Shared Axis" approach is catastrophic for mobile width. 70% of the screen width is empty white space in every row.
4.  **Interaction:** Hover-based density details are impossible on touch screens.

## 2. High-Level Design Strategy

The core strategy is **"Deconstruct & optimize Resolution"**.

Instead of treating this as one monolithic chart with a shared axis, we will treat it as a **Dashboard of 3 Independent Cards**, one for each measurement.

### Key Design Decisions:
1.  **Independent Axes (Crucial):** We must break the shared x-axis. "Beak Depth" should range from ~10-25mm, and "Flipper Length" from ~170-230mm. This allows the *shape* of the distribution to fill the mobile width, making the data actually visible.
2.  **Layout Serialization:** Move row labels from the left (vertical) to the top of each chart (horizontal).
3.  **Interactive Scrubbing:** Replace passive tooltips with an active "Touch & Drag" scrubber that highlights the specific value and density at the finger's position.
4.  **Premium Aesthetics:** Use a glassmorphic card design with vibrant gradients (e.g., Teal to Blue) to make the density curves pop against a dark/light mode background.

## 3. Vis2Mobile Action Space Mapping

Based on `mobile-vis-design-action-space.md`, here are the specific actions:

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | Container | **Rescale (Fit Width)** | Ensure charts expand to fill the device width (`w-full`) rather than a fixed pixel width. |
| **L1** | Chart Component | **Serialize Layout** | The vertical stack is good, but we will treat them as distinct cards with independent spacing (`gap-6`) rather than a single connected grid. |
| **L2** | Title Block | **Reposition** | Move the specific measurement name (e.g., "Beak Length") from the Y-axis/Row Header to a prominent Card Title above the chart. |
| **L2** | Title Block | **Simplify** | Remove the generic "Measurement Type" label entirely; the individual titles explain themselves. |
| **L3** | Axes | **Recompose (Change Domain)** | **Critical Action:** Switch from a shared global domain `[0, 240]` to independent domains based on the min/max of each metric. This solves the "wasted space" issue. |
| **L3** | Axes | **Recompose (Remove Y-Axis)** | The absolute "Density" float value (e.g., 0.04) is abstract and less important than the *shape*. We will remove the Y-axis lines/ticks to save horizontal space and just show the shape. |
| **L3** | Ticks | **Decimate Ticks** | Reduce X-axis tick count to 4-5 to prevent label overlap on narrow screens. |
| **L5** | Interaction | **Trigger (Replace Hover)** | Replace `hover` with `Touch/Drag` (Recharts `activeDot` and `CategoricalChartState`) to view specific values. |
| **L5** | Feedback | **Reposition (Fix Tooltip)** | Instead of a floating tooltip covering the finger, display the active value in a fixed summary area within the Card Header. |

## 4. Data Extraction & Processing Plan

The source HTML contains the raw data in a JSON object inside `datasets`. The Vega-Lite spec performs a transform (Fold -> Density) *at runtime*. Recharts does not calculate density (KDE) automatically; it only plots points.

**I must implement a Kernel Density Estimation (KDE) function.**

1.  **Extraction:** Copy the `datasets['data-783f637a646b8ff8439f6e7d741cecf0']` array from the source.
2.  **Cleaning:** Filter out `null` values for the relevant keys.
3.  **Transformation (The KDE Step):**
    *   Create a simple Gaussian Kernel function.
    *   For each measurement type (Beak Length, Beak Depth, Flipper Length):
        *   Extract the array of numbers.
        *   Determine min/max and create a linear scale (the "bins").
        *   Run the KDE function to generate `[{ x: value, density: computed_density }]` for ~50-100 points along the range.
    *   This transformed data will be passed to Recharts `<AreaChart />`.

## 5. Implementation Steps

### Step 1: Project Setup & Components
*   Initialize `src/components/Visualization.tsx`.
*   Import `AreaChart`, `Area`, `XAxis`, `ResponsiveContainer`, `Tooltip`, `ReferenceLine` from `recharts`.
*   Import Lucide icons (`Ruler`, `Activity`, `Info`).

### Step 2: Data Processing Logic
*   Paste the raw JSON data into a constant.
*   Implement `kernelDensityEstimator(kernel, X)` and `epanechnikov(bandwidth)` or Gaussian helper functions.
*   Write a `useMemo` hook to process the raw data into three separate arrays (one for each metric), calculating density curves dynamically.

### Step 3: Layout Structure (Mobile First)
*   Create a main container with `flex flex-col gap-6 p-4`.
*   Create a reusable `DensityCard` component. This component will accept a title, color theme, and the specific data subset.
*   **Header:** Title + Icon (e.g., "Flipper Length") + Current Value Indicator (placeholder for interaction).

### Step 4: Chart Implementation
*   Inside `DensityCard`, place `<ResponsiveContainer width="100%" height={160}>`.
*   Use `<AreaChart>` with the calculated KDE data.
*   **Styling:** Use `defs` for SVG Linear Gradients (fade from top to bottom) to give a premium glass look.
*   **Axes:** Render `<XAxis>` with `type="number"`, `domain={['auto', 'auto']}` (or specific calculated range), and minimal ticks. Hide YAxis.

### Step 5: Interaction & Polish
*   Implement a custom `CustomTooltip` that is hidden but updates a state variable in the parent `DensityCard` to show the "Active Value" in the card header (Action: **Reposition Feedback**).
*   Add entry animations using Tailwind `animate-in` or Framer Motion (if available, otherwise CSS transitions).
*   Ensure typography uses distinct weights (Bold for values, subtext for units).

This plan ensures we don't just "shrink" the desktop chart, but fundamentally "reflow" it for a superior mobile experience while strictly adhering to the real data.