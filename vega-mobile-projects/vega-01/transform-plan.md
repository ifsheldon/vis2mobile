# Vis2Mobile Plan: Interactive Cross-Filtering Flights Dashboard

## 1. Analysis of Original Visualization

### Source Details
*   **Type:** Interactive Multi-View Histogram (Cross-filter).
*   **Narrative:** The visualization explores flight data across three dimensions: **Arrival Delay**, **Departure Time**, and **Travel Distance**.
*   **Data Source:** `https://vega.github.io/editor/data/flights-200k.json` (Large dataset ~200k records).
*   **Mechanism:**
    *   **Aggregation:** Data is binned into histograms based on configurable step sizes.
    *   **Cross-filtering:** Selecting a range (brushing) on one chart filters the data shown in the other two.
    *   **Controls:** Three range sliders at the top control the bin step size (`delayStep`, `timeStep`, `distStep`).

### Mobile Render Issues (Desktop on Mobile)
*   **Touch Targets:** The native Vega "brush" handles are too thin for fingers.
*   **Controls:** The HTML range inputs for "Step" are tiny and clustered, making them hard to manipulate precisely on touch.
*   **Layout:** While vertical stacking works for mobile, the fixed pixel heights (implied by the Vega spec `chartHeight: 100`) might be too small or too large depending on the device density.
*   **Text:** Axis labels (14px) are decent, but tick labels might overlap if the width is constrained without tick decimation.
*   **Viewport:** The charts require the user to see the correlation between views. If one chart is off-screen while interacting with another, the "cross-filtering" feedback loop is broken.

## 2. Vis2Mobile Design Action Space Reasoning

Based on the `mobile-vis-design-action-space.md`, here is the transformation strategy:

### L0: Visualization Container
*   **Action: `Rescale` (Width: 100%)**
    *   *Reasoning:* The original has a fixed width of 500px. Mobile screens vary (320px - 430px). The container must be fluid.
*   **Action: `Reposition` (Padding)**
    *   *Reasoning:* Add standardized mobile margins (e.g., `px-4`) to prevent content from touching screen edges.

### L1: Data Model
*   **Action: `Recompose (Aggregate)`**
    *   *Reasoning:* The raw data (200k records) cannot be rendered as individual points. We must replicate the "Binning" logic from the Vega spec in React. We will use `d3-array` (specifically `bin`) to aggregate the raw JSON data into histograms based on the dynamic step sizes.

### L1: Interaction Layer
*   **Action: `Recompose (Replace)` Triggers**
    *   *Reasoning:* Desktop "Brush" (click & drag on chart area) is error-prone on mobile (fingers obscure the data).
    *   *Plan:* Replace the on-chart brush with a **dual-thumb range slider** placed immediately *below* each chart. This separates the interaction touch target from the visual data display.
*   **Action: `Compensate (Toggle)` Features**
    *   *Reasoning:* The "Step Size" sliders (delayStep, etc.) are secondary controls. They clutter the view.
    *   *Plan:* Move these controls into a "Settings" drawer/sheet (using a gear icon), implementing the **Compensate** strategy to save screen real estate.

### L3: Coordinates & Axes
*   **Action: `Decimate Ticks`**
    *   *Reasoning:* On narrow screens, X-axis labels (e.g., 0, 6, 12, 18, 24 for Time) fit okay, but Delay (-60 to 180) might crowd. We need to dynamically calculate tick count based on screen width.
*   **Action: `Recompose (Remove)` Axis Lines**
    *   *Reasoning:* To achieve a "Premium" look, we remove the solid axis lines and rely on subtle gridlines or just the alignment of bars to imply the baseline.

### L2: Data Marks (Bars)
*   **Action: `Rescale` (Bar Width)**
    *   *Reasoning:* Bars need to be responsive. We will use a responsive container (Recharts `ResponsiveContainer`) so bar width adjusts automatically.
*   **Action: `Emphasize` (Active State)**
    *   *Reasoning:* The original uses "Steelblue" for the global background and purely changes the bar height for the filtered view? No, looking closely at the Vega spec:
        *   Background bars (gray/steelblue) show the *total* distribution.
        *   Foreground bars (highlighted) show the *filtered* distribution.
    *   *Plan:* We must maintain this **Layered Mark** approach. Render two bars per bin: a "Total" bar (background, lower opacity) and a "Filtered" bar (foreground, vibrant color) on top.

## 3. Implementation Plan

### Step 1: Data Extraction & Processing Logic
1.  **Fetch Data:** Create a utility to fetch `flights-200k.json` once on mount.
2.  **State Management:**
    *   `filters`: `{ delay: [min, max], time: [min, max], distance: [min, max] }`
    *   `steps`: `{ delay: 10, time: 1, distance: 100 }`
3.  **Binning Engine:**
    *   Create a memoized function that takes the raw data + current filters + current steps.
    *   It must output three arrays (one for each chart).
    *   **Crucial Logic:** For *Chart A*, the "Filtered" bars must represent data filtered by ranges on *Chart B and C*, but NOT A (or filtered by all, depending on standard cross-filter behavior. Vega usually filters by *all active brushes*).
    *   *Correction:* In cross-filtering, the background gray bars usually show "Unfiltered Global Data", and the colored bars show "Data satisfying ALL current filters".

### Step 2: Component Architecture
*   `FlightDashboard.tsx`: Main container, holds state and data fetching.
*   `SettingsDrawer.tsx`: A slide-over or modal containing the "Bin Size" sliders.
*   `FilterChart.tsx`: A reusable card component containing:
    *   Title (e.g., "Arrival Delay").
    *   **Recharts ComposedChart**:
        *   `Bar` 1: Global distribution (Light/Glassy color).
        *   `Bar` 2: Selected distribution (Vibrant color).
    *   **RangeSlider**: A custom dual-thumb slider synced with the X-axis domain to control the filter for this dimension.

### Step 3: UI/UX & Styling (Mobile First)
*   **Layout:** Vertical flex column.
*   **Theme:** Dark mode glassmorphism.
    *   Background: Deep gradient (Slate/Zinc).
    *   Cards: White/Black with low opacity + blur.
*   **Typography:** Lucide icons for metadata. Large, readable numbers for the "Active Filter Range" display.
*   **Feedback:** When sliding the range, the other charts should animate their updates smoothly (Recharts handles animation, but we need to ensure the state update isn't too laggy with 200k rows. We might need `useDebounce` for the slider interaction).

## 4. Data Extraction Strategy

Since we cannot use "fake data", we will perform **Real-time Client-side Extraction**.

1.  **Source:** `https://vega.github.io/editor/data/flights-200k.json`
2.  **Fields Needed:**
    *   `delay`: Arrival delay in minutes.
    *   `time`: Local departure time in hours (float).
    *   `distance`: Travel distance in miles.
3.  **Processing:**
    *   We will NOT hardcode coordinates.
    *   We will load the JSON.
    *   We will use `d3-array`'s `bin()` functionality.
    *   **Domain Configuration (from Spec):**
        *   Delay Extent: `[-60, 180]`
        *   Time Extent: `[0, 24]`
        *   Distance Extent: `[0, 2400]`

## 5. Summary of Actions
1.  **Transform:** Desktop stacked histograms -> Mobile Cards with detached Range Sliders.
2.  **Codify:** Fetch live JSON -> `d3.bin` aggregation -> React State.
3.  **UX:** Remove hover, add touch-optimized sliders, move config to drawer.
4.  **Aesthetics:** Glassmorphism, Neon accents on filtered data, "Ghost" bars for context.