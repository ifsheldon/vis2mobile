# Vis2Mobile Transformation Plan: Penguin Body Mass Distribution

## 1. Analysis of Original Visualization

### Desktop Version (Original)
*   **Type**: Stacked/Layered Area Chart (Density Plot).
*   **Data**: Distribution of body mass (g) for three penguin species (Adelie, Chinstrap, Gentoo).
*   **Encoding**:
    *   **X-Axis**: Body Mass (g), Quantitative, range approx 2500g - 6500g.
    *   **Y-Axis**: Density value (Probability density), Quantitative.
    *   **Color**: Nominal (Species).
*   **Layout**: Landscape orientation. Title on top. Legend on the right side.
*   **Visual Characteristics**: Smooth curves (density estimation), semi-transparent areas allowing visualization of overlap.

### Mobile Aspect Ratio Issues
*   **Squished X-Axis**: Directly rendering this on mobile (portrait) compresses the X-axis significantly. This makes the density curves look like sharp spikes, making it difficult to discern the shape of the distribution or the subtle overlaps between species.
*   **Legend Space**: The right-side legend takes up approx. 20-25% of the horizontal space. On a 360px wide screen, this leaves very little room for the actual data.
*   **Axis Crowding**: Standard X-axis ticks (2500, 3000, 3500...) might overlap or become too small on mobile.
*   **Y-Axis Relevance**: In density plots, the absolute Y-value (density) is often less important to the general audience than the relative shape and peak positions. The axis labels occupy valuable width.

## 2. Mobile Design Strategy

### High-Level Concept
The transformation will focus on **maximizing horizontal space** for the data curves. We will switch from a "Chart + Side Legend" layout to a **"Card-based Vertical Stack"** layout. The legend will be moved to the top header to reclaim horizontal pixels. We will simplify the axes to focus on the comparison of mass (X-axis) rather than exact density values (Y-axis).

### Design Action Space Mapping

| Level | Component | Action | Reasoning & Justification |
| :--- | :--- | :--- | :--- |
| **L0** | **Visualization Container** | `Rescale` | Set width to 100% and define a fixed aspect ratio (e.g., 3:2 or 4:3) that allows enough height for the curves without requiring scrolling, while filling the mobile width. |
| **L0** | **Container** | `Reposition` | Adjust global padding to `16px` (Tailwind `p-4`) to fit the "Card" aesthetic. |
| **L1** | **Data Model** | `Recompose (Aggregate)` | The original Vega-Lite spec performs a "density" transform on raw data. Since Recharts doesn't calculate KDE (Kernel Density Estimation) automatically, we must implement a lightweight KDE function in JS to transform the raw penguin instances into smooth density curves for the chart. |
| **L2** | **Title Block** | `Reposition` | Move Title inside a distinct header section of the component. |
| **L3** | **Legend Block** | `Reposition` | **Critical Action**: Move legend from `right` to `top` (below title) or make it inline. This eliminates the horizontal squeeze caused by the side legend. |
| **L3** | **Axes (Y)** | `Recompose (Remove)` | Remove the Y-axis line and tick labels. The exact "density" value is abstract; the visual *height* is sufficient for comparison. This frees up ~30-40px of width. |
| **L3** | **Axes (X)** | `Decimate Ticks` | Limit tick count to ~4 or 5. Reduce frequency to avoid label overlap on narrow screens. |
| **L4** | **Tick Label** | `Format Tick Label` | Format numbers (e.g., "3000" -> "3k" or just "3000" with reduced font size) to ensure readability. |
| **L5** | **Interaction (Tooltip)** | `Fix Tooltip Position` | Instead of a floating tooltip that might get blocked by a finger, use a fixed "Info Box" at the top of the chart or a custom styled tooltip that snaps to the top of the interaction area. |
| **L2** | **Data Marks (Area)** | `Rescale` | Ensure `fillOpacity` is tuned (e.g., 0.6) so overlapping species are clearly visible against a white/dark background. |

## 3. Data Extraction & Processing Plan

Since the original uses a Vega transform (`density`) on a raw URL, we cannot just scrape coordinates from the HTML. We must process the raw data.

1.  **Source**: Hardcode the raw data from `https://vega.github.io/editor/data/penguins.json` (or a representative subset if the file is too large, but for this plan, we assume we process the full dataset).
2.  **Transformation Logic (The "KDE" Step)**:
    *   We need to emulate the `transform: [{"density": "Body Mass (g)", "groupby": ["Species"]}]`.
    *   **Algorithm**:
        1.  Group data by `Species`.
        2.  Filter out null `Body Mass (g)` values.
        3.  Create a grid of X values from min (2500) to max (6500).
        4.  Apply a Gaussian Kernel to calculate density (Y) for each X.
    *   **Output Structure**: An array suitable for Recharts:
        ```typescript
        interface DataPoint {
          mass: number; // X axis
          Adelie: number; // Y value for Area 1
          Chinstrap: number; // Y value for Area 2
          Gentoo: number; // Y value for Area 3
        }
        ```
3.  **Colors**:
    *   Adelie: Blue/Teal
    *   Chinstrap: Orange/Red
    *   Gentoo: Green/Cyan
    *   *Note*: Use a modern, mobile-friendly palette based on the original intent but with better contrast (e.g., Tailwind colors).

## 4. Detailed Implementation Steps

1.  **Setup Component Shell**:
    *   Create `src/components/Visualization.tsx`.
    *   Import `ResponsiveContainer`, `AreaChart`, `Area`, `XAxis`, `Tooltip`, `CartesianGrid` from `recharts`.
    *   Import icons (Info, etc.) from `lucide-react`.

2.  **Data Processing Implementation**:
    *   Write a helper function `kernelDensityEstimator(kernel, X)` to process the raw penguin data.
    *   Generate the `chartData` array containing ~50-100 points along the X-axis to ensure smooth curves.

3.  **UI Construction (Mobile First)**:
    *   **Card Container**: Use a glassmorphism effect (`bg-white/90 backdrop-blur` or subtle shadow) with rounded corners (`rounded-xl`).
    *   **Header**:
        *   Title: "Penguin Body Mass" (Simplified).
        *   Subtitle/Legend: Flex container with colored dots indicating species.
    *   **Chart Area**:
        *   `ResponsiveContainer` with height ~250px.
        *   `AreaChart` with overlapping areas.
        *   `XAxis`: tick formatter `(val) => val`, minimal tick count.
        *   `YAxis`: Hidden (`hide={true}`).
        *   `Tooltip`: Custom content rendering current mass and density for active species.

4.  **Styling & Polish**:
    *   Use `defs` in SVG to create linear gradients for the Area fills (fade to transparent at bottom) for a premium look.
    *   Add animations (`isAnimationActive={true}`) for initial load.
    *   Ensure typography is legible (Tailwind `text-sm`, `text-xs` for axes).

5.  **Validation**:
    *   Check if the distribution shapes match the original `desktop.png`.
    *   Verify touch interaction works without obscuring data.