# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Symbol Map (Proportional Symbol Map).
- **Content**: US States background (Albers USA projection) with superimposed circles representing aggregated airport counts per state.
- **Data Channels**:
    - **Spatial**: State location (Mean Latitude/Longitude of airports).
    - **Size**: Number of airports (Count).
    - **Color**: Static `steelblue`.
    - **Tooltip**: State name and Count.
- **Aesthetics**: Clean, minimalist, gray background, blue circles.
- **Issue with "Direct Port" to Mobile**:
    - **Aspect Ratio Mismatch**: The US map is wide (landscape). A phone screen is tall (portrait). Simply fitting the map to screen width leaves ~60% of the screen vertical space empty.
    - **Readability**: Bubbles for smaller states (like in the Northeast) will become microscopic and untappable when the map is shrunk to mobile width.
    - **Comparison Difficulty**: Comparing area sizes (circles) is cognitive-heavy, especially when bubbles are small.
    - **Interaction**: Hover tooltips do not work on touch devices.

### Mobile Vision
To create a **premium, mobile-first** experience, we cannot rely solely on the map. We must adopt a **Hybrid Layout**:
1.  **Top (Pinned/Sticky)**: The Map. Acts as a spatial reference and a visual anchor.
2.  **Bottom (Scrollable)**: A Ranked List/Bar Chart. This solves the readability and comparison issues by listing states from highest to lowest airport count.
3.  **Interaction**: Bi-directional linking. Clicking a state on the map scrolls to the list item; clicking a list item highlights the state on the map.

## 2. Design Action Space & Strategy

### L0: Visualization Container
*   **Action: `Rescale` (Match Viewport)**
    *   **Why**: The container must adapt to full screen width.
*   **Action: `Serialize layout` (Vertical Stack)**
    *   **Why**: Instead of a single view, we split the container into two vertical sections:
        *   **Section A (Map)**: Fixed height (e.g., 35% of screen).
        *   **Section B (Details)**: Scrollable area (65% of screen) containing the ranked data.

### L1: Data Model & Interaction
*   **Action: `Recompose (Aggregate)` (Preserve Logic)**
    *   **Why**: The original Vega spec performs an aggregation (`groupby: ["state"]`, `op: count`). We must replicate this logic in our data processing to ensure "Real Data" is used.
*   **Action: `Recompose (Replace)` (Hover $\to$ Click)**
    *   **Why**: Touch screens lack hover. We replace the hover tooltip with a "Selected State" state in React.
*   **Action: `Feedback` (Sync Views)**
    *   **Why**: When a user taps a bubble, the corresponding item in the list below should highlight or scroll into view.

### L2: Coordinate System (The Map)
*   **Action: `Rescale` (Fit Width)**
    *   **Why**: The map must fit within the mobile width (approx 350-400px).
*   **Action: `Reposition` (Centering)**
    *   **Why**: Center the Albers USA projection within the top container to maximize usable pixels.

### L2: Data Marks (Bubbles on Map)
*   **Action: `Rescale` (Minimum Size Threshold)**
    *   **Why**: In the original desktop view, small counts result in tiny pixels. On mobile, we must set a `min-radius` (e.g., 4px) to ensure dots are visible and tappable.
*   **Action: `Emphases` (Active State)**
    *   **Why**: Use a glassmorphism effect or a vibrant color change (e.g., `steelblue` $\to$ `amber-500`) to indicate the currently selected state.

### L3: Auxiliary Components (The List View - *New*)
*   **Action: `Transpose` (Spatial $\to$ Linear)**
    *   **Why**: A map is poor for ranking. We add a **Recharts BarChart** (layout: 'vertical') or a styled list of progress bars below the map.
    *   **Implementation**: Sort states by count descending. This allows users to easily see "Which state has the most airports?" which is hard to discern from just looking at overlapping bubbles on a tiny map.

## 3. Implementation Steps

### Step 1: Data Acquisition & Processing
1.  **Fetch TopoJSON**: Retrieve `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json`.
2.  **Fetch CSV**: Retrieve `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/airports.csv`.
3.  **Process Data**:
    *   Convert TopoJSON to GeoJSON features (States).
    *   Parse CSV.
    *   **Aggregation**: Group airports by State ID/Name.
    *   Calculate `count` per state.
    *   Calculate `mean_latitude` and `mean_longitude` per state.
    *   *Result*: A clean array `StateData[]` merging geometry and airport stats.

### Step 2: Component Structure (React)
*   **Container**: `div` with `h-screen w-full flex flex-col bg-slate-50`.
*   **Map Section**:
    *   Use `svg` with `viewBox` adjusted for the US Map.
    *   Render States: `<path>` elements using D3 geoPath (AlbersUsa). Style: `fill-slate-200 stroke-white`.
    *   Render Bubbles: `<circle>` elements at projected [long, lat]. Radius scaled by `sqrt(count)`.
    *   *Note*: While Recharts is the preferred library, standard SVG is superior for the map background layer. We will overlay the data points manually or use Recharts `ScatterChart` with a custom background if strictly necessary, but pure SVG is cleaner for this specific projection.
*   **List Section**:
    *   Use `Recharts` -> `BarChart` (layout="vertical").
    *   Y-Axis: State Name (Abbreviated if needed).
    *   X-Axis: Airport Count.
    *   Tooltip: Custom glassmorphism tooltip.
    *   Interaction: `onClick` updates the shared `selectedState` state.

### Step 3: Styling & Premium Aesthetics
*   **Palette**:
    *   Map Background: `bg-slate-100`.
    *   States: `fill-slate-300 stroke-white`.
    *   Bubbles (Inactive): `fill-blue-500` (opacity 0.6).
    *   Bubbles (Active): `fill-indigo-600` (animate radius pulse).
    *   List Items: Glassmorphism cards with a progress bar indicating relative count.
*   **Typography**: Use system sans-serif (Inter/SF Pro). Large numbers for the "Count" in the list view.
*   **Motion**: `framer-motion` for smooth layout transitions when sorting or selecting.

## 4. Data Extraction Plan

Since the source is a Vega-Lite spec referencing external URLs, the implementation agent must write a utility to fetch and aggregate this data at runtime or build time.

**Source Data URLs**:
1.  **Map Geometry**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json`
    *   *Target Key*: `objects.states`
2.  **Airport Data**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/airports.csv`
    *   *Columns*: `id`, `name`, `city`, `state`, `country`, `latitude`, `longitude`.

**Logic to Replicate**:
```javascript
// Pseudo-code for Agent
const airports = fetchCSV(...);
const grouped = _.groupBy(airports, 'state');
const data = Object.keys(grouped).map(state => {
  const points = grouped[state];
  return {
    state: state,
    count: points.length,
    latitude: mean(points.map(p => p.lat)),
    longitude: mean(points.map(p => p.lon))
  };
});
```

This ensures we fulfill the requirement: "Codify Data... No fake data allowed."