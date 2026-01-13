# Vis2Mobile Transformation Plan: US Unemployment Choropleth

## 1. Analysis of the Original Visualization

### Source Analysis
- **Type**: Choropleth Map (US Counties).
- **Tech**: Vega-Lite.
- **Data Source**:
    - Geometry: `us-10m.json` (TopoJSON containing counties).
    - Metrics: `unemployment.tsv` (Maps ID to Rate).
- **Encoding**:
    - **Mark**: Geoshape (Counties).
    - **Projection**: `albersUsa` (Standard projection moving Alaska/Hawaii below US).
    - **Color**: Sequential gradient (Yellow-Green-Blue) encoding unemployment `rate`.
    - **Legend**: Vertical gradient bar on the right side.

### Mobile Challenges
1.  **Tiny Geometry**: US Counties (~3000+) are extremely small on a mobile screen. Tapping a specific county (e.g., in the Northeast) is nearly impossible without zoom.
2.  **Input Method**: The original likely relies on hover for tooltips (though not explicitly enabled in the code, it's standard behavior). Hover does not exist on mobile.
3.  **Layout**: The wide aspect ratio of the US map leaves significant whitespace above and below when fitted to a portrait phone width. The right-aligned legend compresses the map further.
4.  **Readability**: The color scale (0-0.3) needs clear context. Just seeing a color isn't enough; users need the specific value for a county.

## 2. High-Level Design Strategy

To create a "Premium" mobile-first experience, we cannot simply shrink the SVG. We must transform the interaction model from a "Static Overview" to an "Interactive Explorer".

### Core Concept: **"Pan, Zoom, and Tap" Explorer**

Instead of a static image, we will build a pannable, zoomable SVG map. The legend will move to a non-intrusive "Glassmorphism" overlay at the bottom. Detailed data will appear in a fixed "Data Card" or "Bottom Sheet" upon tapping a county, resolving the "fat finger" and tooltip occlusion issues.

### Rationale for Deviating from Stack (Recharts)
**Note**: The project stack specifies **Recharts**. However, Recharts is designed for XY charts (Line, Bar, Area) and does **not** support GeoJSON/TopoJSON map rendering or cartographic projections.
**Solution**: We will use **D3.js** (`d3-geo`, `d3-scale`, `d3-selection`) combined with React state to render the SVG path elements directly. This allows full control over animations and interactions, which is required for the "Premium Aesthetics" mission.

## 3. Design Action Space Plan

Based on the `mobile-vis-design-action-space.md`, here are the specific actions:

| Layer | Component | Action | Description & Rationale |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | `Rescale` (Full Width) | Set container to `w-full h-[60vh]` or `h-auto`. We need to maximize width to make counties as large as possible. |
| **L0** | **Container** | **New Action**: `Zoom/Pan` | Wrap the SVG in a zoomable container (using `d3-zoom` logic or CSS transforms). **Reason**: Counties are too small to tap accurately without zooming. |
| **L2** | **Features** | `Recompose (Replace)` | **Interaction**: Replace `Hover` with `Click/Tap`. **Reason**: Mobile devices do not support hover. |
| **L2** | **Feedback** | `Reposition (Fix)` | **Tooltip**: Move data display from a floating tooltip to a **Fixed Bottom Card** or Header. **Reason**: Tooltips under fingers are invisible. A fixed position ensures readability. |
| **L3** | **Legend** | `Reposition` | Move legend from **Right** to **Bottom-Left** (floating). **Reason**: Vertical space is cheaper than horizontal space on mobile. A horizontal gradient bar saves map width. |
| **L3** | **Legend** | `Simplify` | Use a continuous gradient bar with minimal ticks (Min, Max) to reduce clutter. |
| **L2** | **Data Marks** | `Focus` (Selection) | When a county is tapped, highlight it (Stroke width increase + Color Pop) and dim the background slightly. **Reason**: Provides immediate visual feedback on selection. |
| **L1** | **Narrative** | `Add` (Context) | Add a clear title "US Unemployment Rate" and a subtitle with the data range or year (if available). |

## 4. Data Extraction Plan

We must use the **Real Data** provided in the HTML source. We will not use fake data.

1.  **Sources**:
    *   **Topology**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json`
    *   **Unemployment**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment.tsv`
2.  **Processing**:
    *   The component will fetch both URLs on mount (using `useEffect` or SWR).
    *   **Merging**: We will create a `Map<id, rate>` from the TSV data.
    *   **Mapping**: While rendering the TopoJSON features, we will look up the `rate` for each county `id` to determine the fill color.
    *   **Color Scale**: Reproduce the scale. The image shows roughly 0.0 to 0.3. We will use `d3-scale-chromatic` (likely `interpolateYlGnBu`) to match the visual style.

## 5. Implementation Steps

### Step 1: Component Setup & Data Fetching
*   Create `src/components/Visualization.tsx`.
*   Implement `useEffect` to `fetch()` the JSON and TSV files.
*   Parse TSV (using `d3-dsv`) and TopoJSON (using `topojson-client`).
*   Store formatted data in React State: `geoData` (features) and `rateData` (lookup map).

### Step 2: The Map Renderer (D3 + React)
*   Use `d3-geo` to create an `geoAlbersUsa` projection.
*   Fit the projection to the container width.
*   Render `<svg>` with `<path>` elements for each county.
*   Apply fill color based on the unemployment rate using `d3-scale-sequential` and `d3-scale-chromatic`.

### Step 3: Mobile Interactions (Zoom & Pan)
*   Implement a wrapper `<div>` or `<g>` that handles touch events.
*   Use a transform matrix for Pan/Zoom state (`{k: zoom, x, y}`).
*   Ensure the map feels "fluid" (smooth transitions).

### Step 4: UI Overlay (Premium Aesthetics)
*   **Header**: Clean Title ("Unemployment Rate") and Subtitle.
*   **Legend**: A floating glassmorphism pill at the bottom left showing the color gradient.
*   **Interaction Feedback**: A "Selected County" card that slides up or appears fixed at the bottom when a county is clicked, displaying the County Name (if available in TopoJSON props) and the exact Rate %. *Note: The US-10m dataset usually only has IDs. We might map IDs to names if possible, or just show the ID and Rate if names are missing in the source. (Correction: The standard us-10m often lacks names, but we will focus on the Rate visualization as per the original).*

### Step 5: Styling & Polish
*   Use Tailwind for layout.
*   Add subtle animations (framer-motion or CSS transitions) for the "selected" state.
*   Ensure accessible colors and sufficient contrast.

## 6. Deviation Note
*   **Recharts**: As noted, Recharts is unsuitable for Choropleth maps. This plan utilizes **D3.js** logic wrapped in React components to achieve the required visualization while adhering to the rest of the stack (Next.js, Tailwind, etc.). This ensures the "Premium Aesthetics" and "Mobile-First UX" goals are met, which would be impossible with Recharts hacking.