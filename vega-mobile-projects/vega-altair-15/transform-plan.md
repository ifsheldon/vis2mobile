# Vis2Mobile Transformation Plan: US State Capitals

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Content**: A geographic map of the United States using the Albers USA projection.
- **Marks**:
    - **Geoshape**: Light gray background shapes representing US states.
    - **Points**: Black dots representing state capitals.
    - **Text**: City names that appear near the dots (hidden by default, appear on interaction).
- **Interaction**:
    - **Hover**: Hovering over a dot enlarges it (size 30 -> 100) and reveals the city name.
    - **Selection**: A `nearest` selection mechanism tracks the pointer.
- **Issues for Mobile**:
    - **Aspect Ratio Mismatch**: The Albers USA projection is naturally wide (landscape). On a portrait mobile screen, this results in the map being extremely small with excessive white space above and below (as seen in `desktop_on_mobile.png`).
    - **Interaction Failure**: "Hover" does not exist on touch devices. The interactive reveal of city names is inaccessible.
    - **Touch Targets**: The capital dots are too small to be accurately tapped with a finger, especially in the dense Northeast region.
    - **Text Legibility**: If labels were displayed permanently, they would overlap significantly due to the reduced screen width.

## 2. Design Action Space & Transformation Plan

### High-Level Strategy
The goal is to preserve the geographical context (the map) while solving the "fat finger" problem and legibility issues. We will transform the layout from a "Hover-to-Explore" interface to a **"Select-and-Read"** interface.

We will use a **Hybrid Layout**: A pannable/zoomable map on the top half, and a fixed "Detail Card" (Bottom Sheet) on the bottom to display the specific data of the selected capital.

### Applied Actions from Design Action Space

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | **Rescale (Viewport)** | Use `width: 100%` and `height: 50vh` for the map container to maximize available width while reserving space for details below. |
| **L0** | **Container** | **Reposition** | Remove global margins (`margin: 0`) to use the full edge-to-edge screen width. |
| **L1** | **Interaction** | **Recompose (Replace)** | **L2 Triggers**: Replace `hover` with `click` (tap). Mobile users tap to select. <br> **L2 Feedback**: Replace the floating tooltip/text label with a **Fixed Bottom Card** (`Reposition (Fix)`). This prevents the user's hand from obscuring the data they are trying to read. |
| **L2** | **Annotations** | **Reposition (Externalize)** | Instead of showing "Albany" next to the dot in New York (which would overlap with Hartford, Trenton, etc.), we move the text to the external Detail Card at the bottom. |
| **L2** | **Data Marks** | **Rescale** | Increase the visual radius of the dots for visibility, but more importantly, increase the transparent **hit area** (padding) around dots to 44px minimum for touch accessibility. |
| **L2** | **Features** | **Compensate (Search/List)** | *Action not explicitly in diagram but related to "Features"*: Since clicking the exact pixel for "Providence, RI" is hard on a phone, we will add a **Select/Combobox** or a horizontal scrollable list of states below the map. This provides an alternative way to select a capital without relying solely on map interaction. |
| **L3** | **Axes/Grid** | **Recompose (Remove)** | Maps do not require axes or gridlines. These remain hidden/non-existent. |
| **L3** | **Legend** | **Recompose (Remove)** | The title "US State Capitols" is self-explanatory. We will move the title to a clean header component (`L2 TitleBlock`). |

### Deviation Justification
**Tech Stack Adjustment**: The requirements list **Recharts**. However, Recharts is designed for statistical charts (Bar, Line, Scatter) and has very poor support for complex TopoJSON/GeoJSON projections like Albers USA.
*   **Justification**: Forcing a map into Recharts `ScatterChart` requires projecting coordinates manually and losing the state polygon shapes (the context).
*   **Solution**: I will use **D3-geo** combined with standard React **SVG** elements. This allows us to render the `us-10m.json` state shapes correctly and project the lat/lon of capitals accurately. This is the industry standard for custom maps in React and ensures the "Premium Aesthetics" requirement is met.

## 3. Data Extraction Plan

We need to extract two distinct datasets from the original HTML/Vega spec:

1.  **State Shapes (Background)**:
    *   **Source URL**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json`
    *   **Method**: Fetch this JSON client-side or during build. It contains TopoJSON data. We need to convert the `objects.states` into GeoJSON features using `topojson-client`.
2.  **Capital Cities (Data Points)**:
    *   **Source URL**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-state-capitals.json`
    *   **Method**: Fetch this JSON. It contains an array of objects: `{ "city": "Montgomery", "state": "Alabama", "lat": 32.361538, "lon": -86.279118 }`.
    *   *Note*: The original vega spec calculates the projection. We will need `d3-geo`'s `geoAlbersUsa()` to translate these `lat/lon` values into `x/y` SVG coordinates.

## 4. Implementation Steps

### Step 1: Project Setup & Dependencies
- Initialize the component structure.
- Install `d3-geo` and `topojson-client` to handle the map projection and data parsing.
- Use `clsx` and `tailwind-merge` for dynamic styling.

### Step 2: Data Fetching Hook
- Create a `useUSData` hook that fetches both JSON files.
- Parse TopoJSON into GeoJSON features for rendering `path` elements.
- Return `{ mapFeatures, capitals, loading }`.

### Step 3: The Map Component (Upper Half)
- Create a responsive SVG container using `viewBox`.
- Use `d3-geo` `geoAlbersUsa` to create a projection path generator.
- **Render Layer 1 (States)**: Map over GeoJSON features and render `<path>` elements with a sleek glassmorphic style (e.g., `fill-white/10 stroke-white/20`).
- **Render Layer 2 (Capitals)**: Map over the capitals data.
    - Project `[lon, lat]` to `[x, y]`.
    - Render a `<circle>` for the visual dot.
    - Render a larger transparent `<circle>` on top to act as the touch target.
    - Add `onClick` handlers to set the `selectedCapital` state.
- **Add Zoom/Pan**: Implement a basic SVG transform (scale/translate) wrapper to allow users to zoom into the Northeast.

### Step 4: The Detail View (Lower Half)
- Create a fixed or sticky container at the bottom.
- **State: Empty**: "Tap a city to view details".
- **State: Selected**: Display:
    - City Name (Large Typography)
    - State Name (Subtext)
    - Lat/Lon coordinates (Data details).
- **Navigation**: Add "Next/Prev" buttons or a horizontal list to cycle through capitals without touching the map.

### Step 5: Visual Polish
- **Glassmorphism**: Use `backdrop-blur-md`, `bg-white/10`, and delicate borders.
- **Animation**: Use `framer-motion` (or standard CSS transitions) to animate the dot size when selected and the bottom sheet sliding up.
- **Palette**: Dark modern theme (Deep Blue/Black background) with cyan/neon accents for the active capital to create a "Wow" factor.

### Step 6: Responsive Logic
- Ensure the SVG `viewBox` automatically fits the width of the device.
- Handle loading states gracefully (skeleton loader).