# Vis2Mobile Transformation Plan: US State Capitals Map

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Geospatial Symbol Map (US States + Capitals).
- **Encoding**:
    - **Geoshape**: US States background (Albers USA projection).
    - **Points**: State capitals marked with black circles.
    - **Text**: City names labeled next to points.
    - **Interaction**: Hovering triggers a `nearest` selection.
- **Data**: 
    - TopoJSON for state boundaries (`us-10m.json`).
    - JSON for capital coordinates and names (`us-state-capitals.json`).

### Mobile Issues (Observed in `desktop_on_mobile.png`)
1.  **Illegible Typography**: When scaled to mobile width, the city labels are microscopically small (L5 TickLabel/MarkLabel issue).
2.  **Overlapping Labels**: In the Northeast (dense area), labels pile up, making them unreadable ("Cluttered text").
3.  **Touch Targets**: The capital points are too small for accurate finger tapping (Fat-finger problem).
4.  **Aspect Ratio**: The Albers USA projection is landscape (wide). On a portrait mobile screen, this results in significant whitespace at the top and bottom if fitted by width, or requires scrolling if fitted by height.
5.  **Interaction**: Desktop relies on `pointerover` (hover), which does not exist on touch devices.

## 2. Vis2Mobile Design Action Space Plan

To transform this into a premium mobile experience, I will adopt a **"Clean Interactive Map + Detail Card"** strategy. The map will serve as a spatial index, while the text data will be externalized to a UI card or list to ensure readability.

### L0: Visualization Container
*   **Action**: `Rescale` (Fit Width)
    *   **Reasoning**: The map must span the full width of the mobile device. We will adjust the SVG `viewBox` to minimize internal margins.
*   **Action**: `Reposition` (Global Padding)
    *   **Reasoning**: Remove the large default margins seen in the desktop HTML to maximize screen real estate.

### L1: Interaction Layer & L2: Features
*   **Action**: `Recompose (Remove)` - **Disable Hover**
    *   **Reasoning**: Mobile users cannot hover. The `mouseover` behavior from the original Vega spec must be removed.
*   **Action**: `Recompose (Replace)` - **Hover → Click**
    *   **Reasoning**: Map interactions will be triggered by tapping a state or a capital marker.

### L2: Annotations (Labels)
*   **Action**: **CRITICAL: `Recompose (Remove)`**
    *   **Reasoning**: The static text labels (City names) are the primary cause of clutter and unreadability on mobile. Displaying 50 labels on a 375px wide screen is impossible without overlap.
*   **Action**: **`Reposition (Externalize)`**
    *   **Reasoning**: Instead of labeling the map directly, we will move the selected state's Capital and City Name to a **Fixed Bottom Card** or a **Scrollable List** below the map. This ensures typography is legible (16px+).

### L2: Data Marks (Points)
*   **Action**: `Rescale`
    *   **Reasoning**: The circle radius (`r`) for the capitals will be increased.
*   **Action**: `Compensate (Interaction Area)` (Not strictly in doc, but related to L2 Triggers)
    *   **Reasoning**: We will render invisible larger circles behind the visible dots to increase the hit area for touch events, solving the "fat-finger" issue.

### L2: Feedback (Tooltips)
*   **Action**: `Reposition (Fix)`
    *   **Reasoning**: Instead of a floating tooltip (which is blocked by the finger), clicking a capital will update a **Fixed Info Panel** at the bottom of the viewport containing the Capital Name, State, and potentially Lat/Lon coordinates.

### L3: Legend/Title
*   **Action**: `Recompose (Remove)` (Subtitle) / `Reposition` (Title)
    *   **Reasoning**: The title "US State Capitols" will be moved to the app's navigation header or a clean H1 above the map, styled with Tailwind rather than embedded in the SVG.

## 3. Data Extraction Strategy

I will extract the real data from the URLs provided in the Vega spec.

**Source 1: State Boundaries**
*   **URL**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json`
*   **Format**: TopoJSON.
*   **Extraction Method**: I will fetch this data or use a simplified pre-converted GeoJSON version if the TopoJSON parsing adds too much overhead. For the purpose of this component, fetching the TopoJSON and converting to GeoJSON client-side (using `topojson-client`) is the most accurate approach.

**Source 2: Capital Cities**
*   **URL**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-state-capitals.json`
*   **Format**: JSON array.
*   **Data Structure**:
    ```json
    [
      {"lon": -112.0738, "lat": 33.4484, "city": "Phoenix", "state": "Arizona"},
      ...
    ]
    ```
*   **Extraction Method**: Since there are only 50 capitals, I will likely codify this directly into a TypeScript constant (`src/data/capitals.ts`) to ensure the component works offline and loads instantly without an extra fetch request.

## 4. Implementation Steps

### Step 1: Data Codification
1.  Create `src/data/us-capitals.ts`: Hardcode the array of 50 capitals extracted from the source URL.
2.  Setup utility to handle the US map projection. Since `Recharts` is listed in the stack but is not suitable for Albers USA projections (it is for charts, not complex geoshapes), I will use **standard SVG with `d3-geo`** logic for the projection and path generation. This complies with the "Visualization" requirement by utilizing React's rendering capability for the "View" layer while using D3 for the "Math" layer.

### Step 2: Component Structure (`src/components/Visualization.tsx`)
1.  **Layout**: A flex container (Column direction).
    *   **Header**: Title "US State Capitals".
    *   **Main**: The Interactive Map (SVG).
    *   **Footer/Overlay**: Details Card (Glassmorphism style).
2.  **State Management**:
    *   `selectedCapital`: Store the currently tapped capital object (or null).

### Step 3: The Map Implementation
1.  Use `d3-geo` to create an `geoAlbersUsa` projection.
2.  Scale the projection to fit the mobile screen width (dynamic calculation based on container width).
3.  Render `<path>` elements for states (Gray fill, White stroke).
4.  Render `<circle>` elements for capitals.
    *   **Style**: Vibrant color (e.g., Indigo/Purple) to replace the boring black dots.
    *   **Animation**: Add a `framer-motion` or CSS pulse effect to the selected capital.

### Step 4: The Interaction Layer
1.  **State Selection**: Clicking a state shape finds the corresponding capital and selects it.
2.  **Capital Selection**: Clicking a dot directly selects it.
3.  **Details Panel**:
    *   Render a fixed panel at the bottom using Tailwind (Glassmorphism: `backdrop-blur-md bg-white/30`).
    *   Display `city` (Large text), `state` (Subtext), and coordinates.

### Step 5: Styling & Polish
1.  Apply Tailwind classes for typography and layout.
2.  Ensure dark mode compatibility (optional but good for "Premium Aesthetics").
3.  Add a "Reset" button to clear selection.

**Justification for not using Recharts for the Map**: Recharts is built for statistical charts (Bar, Line, Pie). While it has a ScatterPlot, mapping a TopoJSON geometry into Recharts' Cartesian grid is inefficient and results in poor code quality compared to a native SVG approach using `d3-geo`, which is the industry standard for React maps. I will focus on the *result* being a premium React component.