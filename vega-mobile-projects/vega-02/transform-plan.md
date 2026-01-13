# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### 1.1 Source Overview
- **Type**: Interactive Scatter Plot.
- **Data Source**: External JSON (`normal-2d.json`), containing `u` (x-axis) and `v` (y-axis) coordinates. The visual shows a dense Gaussian-like distribution.
- **Desktop Features**:
    - **Layout**: X-axis on Top, Y-axis on Right.
    - **Interaction**: Physics-based Pan and Zoom (wheel/drag), Hover (changes color), Selection (changes size).
    - **Visuals**: Steelblue circles with opacity.
- **Issues on Mobile (Desktop on Mobile)**:
    - **Unreachable Controls**: Axis on Top/Right is non-standard and hard to read while holding a phone.
    - **Touch Targets**: Data points are too small (`size` variable in Vega is dynamic but generally small) for precise touch.
    - **Gestures**: Complex pan/zoom signals in Vega often conflict with native browser scrolling on mobile.
    - **Readability**: Axis text and tick density are calibrated for mouse pointers and large monitors.

### 1.2 Mobile Design Philosophy
The goal is to create a "Premium" interactive scatter plot. Instead of blindly porting the complex pan/zoom signals which feel clunky on mobile web, we will focus on **clarity**, **touchability**, and **fluid feedback**. We will move axes to standard positions, increase mark sizes, and use a dedicated "Touch Overlay" or specific Zoom state handling if necessary, but prioritize an "Auto-fit" view that looks good immediately.

---

## 2. Design Action Space Planning

Based on `mobile-vis-design-action-space.md`, here are the specific actions to transform the chart:

### L0: Visualization Container
- **Action: `Rescale`**: Set container width to `100%` and height to a fixed mobile-friendly value (e.g., `h-[400px]` or aspect ratio `1:1`) to maximize screen real estate.
- **Action: `Reposition`**: Add global padding (`p-4`) to ensure the chart doesn't touch screen edges.

### L1: Chart Components (General)
- **Action: `Reposition` (Layout)**: Move axes to standard mobile positions.
    - **Why**: The original "Top/Right" axes are awkward. Standard reading pattern and mobile chart libraries default to Bottom/Left.

### L2: Data Marks (The Points)
- **Action: `Rescale` (Mark Size)**: Increase the base radius of the scatter points.
    - **Why**: Mobile requires larger touch targets. A radius of ~2-3px is too small; we will aim for ~5-6px visually, with a larger invisible hit area if possible.
- **Action: `Recompose (Change Encoding)` (Color)**: Change "steelblue" to a vibrant theme color (e.g., Indigo/Violet gradient) with transparency.
    - **Why**: "Premium Aesthetics" requirement. Glassmorphism relies on subtle transparency.

### L2: Features & Triggers (Interaction)
- **Action: `Recompose (Replace)`**: Replace `Hover` triggers with `Touch/Click`.
    - **Why**: Hover doesn't exist on mobile.
- **Action: `Reposition (Fix)` (Feedback)**: Use a **Fixed Tooltip** (Info Card) at the top or bottom of the chart area instead of a floating tooltip.
    - **Why**: Floating tooltips are covered by the user's finger during touch. A fixed header displaying the selected point's coordinates (`u`, `v`) is a superior UX.

### L3/L4: Coordinate System (Axes)
- **Action: `Transpose` (Axis-Transpose)**: *Rejected*. Scatter plots need Cartesian coordinates.
- **Action: `Decimate Ticks`**: Reduce tick count on both axes (e.g., Max 4-5 ticks).
    - **Why**: Prevent label overlap on narrow screens.
- **Action: `Simplify Labels`**: Format numbers to be concise (e.g., remove trailing zeros if unnecessary).
- **Action: `Recompose (Remove)`**: Remove axis lines (keep ticks/labels) and use subtle gridlines.
    - **Why**: Reduces visual clutter ("Chart Junk") for a modern look.

---

## 3. Data Extraction Strategy

Since the data comes from an external URL (`https://vega.github.io/editor/data/normal-2d.json`), we must obtain this data to ensure "Real Data" is used.

1.  **Schema Identification**:
    - The Vega spec uses fields `u` and `v`.
    - `u` maps to the X-scale.
    - `v` maps to the Y-scale.
2.  **Extraction Method**:
    - Ideally, fetch the JSON during the build/render.
    - **Fallback (if fetch fails in environment)**: The data represents a 2D Normal Distribution. If the agent cannot access the internet, it must simulate a dataset that statistically mirrors the "normal-2d" dataset (approx. 200-300 points, Gaussian distribution centered at mean, standard deviation ~1).
    - **Hard Requirement**: The component must process an array of objects: `interface DataPoint { u: number; v: number; }`.

---

## 4. Implementation Steps

### Step 1: Component Structure (Next.js + Tailwind)
- Create `src/components/Visualization.tsx`.
- Use a `Card` container with `backdrop-blur` and a subtle border to achieve the "Glassmorphism" look.
- Header section: Title "Distribution Analysis" (Narrative Layer) and a dynamic "Info Display" area for selected points.

### Step 2: Data Handling
- Implement a `useEffect` to fetch the data or load the specific dataset.
- Calculate domains (Min/Max) for `u` and `v` to set the chart axis domains properly, adding padding so points aren't cut off at the edges.

### Step 3: Recharts Configuration
- **ComposedChart / ScatterChart**:
    - `margin={{ top: 20, right: 20, bottom: 20, left: 0 }}`.
- **XAxis**:
    - `dataKey="u"`, `type="number"`.
    - `tickLine={false}`, `axisLine={false}`.
    - `tick={{ fontSize: 12, fill: '#94a3b8' }}`.
    - Position: **Bottom**.
- **YAxis**:
    - `dataKey="v"`, `type="number"`.
    - `tickLine={false}`, `axisLine={false}`.
    - `tick={{ fontSize: 12, fill: '#94a3b8' }}`.
    - Position: **Left**.
- **Scatter**:
    - `name="Values"`, `data={data}`.
    - `fill="#8884d8"`. Use a custom `shape` or standard circle with `fillOpacity={0.6}`.
    - **Animation**: Enable `isAnimationActive` for the "Wow" factor on load.

### Step 4: Premium Mobile Interactions
- **Custom Tooltip/Feedback**:
    - Instead of the default Recharts tooltip (which is often janky on touch), use the `onClick` or `onMouseEnter` (mapped to touch start) event on the `<Scatter>` component to update a React state variable `selectedPoint`.
    - Render `selectedPoint` details in the fixed header area (L2 Reposition - Fix).
- **Zoom (Optional but Premium)**:
    - Add a simple "Reset Zoom" button (Lucide icon) in the corner.
    - Since complex pan/zoom is risky, we will default to a "Best Fit" view. If needed, we can use a `Brush` or simpler 2-finger gesture logic *if* time permits, but prioritizing a clean static view with selection is better than a broken zoom view.

### Step 5: Styling
- **Palette**: Slate-900 background (or white with heavy shadows).
- **Points**: `fill-indigo-500` with `opacity-60`. Active point: `fill-rose-500` (referencing the "firebrick" from original), scaled up.
- **Typography**: Sans-serif, legible sizes (>12px).

This plan ensures the original data and intent (distribution analysis) are preserved while fixing the usability issues inherent in the desktop-first Vega chart.