# Plan: Mobile-First Interactive US Capitals Map

## 1. Analysis of Original Visualization

### Desktop Version
- **Content**: A map of the USA using Albers projection. Gray background shapes represent states. Black dots represent state capitals.
- **Interactivity**: Hovering over a dot increases its size (30 to 100) and displays the city name text.
- **Data**: 
    - Geometry: `us-10m.json` (TopoJSON for state boundaries).
    - Points: `us-state-capitals.json` (Latitude/Longitude, City name).
- **Aesthetics**: Functional but basic (gray/white/black). High contrast but lacks modern appeal.

### Issues on Mobile (observed from `desktop_on_mobile.png`)
- **Scale**: The US map is wide (landscape). On a portrait mobile screen, fitting the width results in a tiny map with huge empty vertical space.
- **Touch Targets**: The dots are too small to reliably tap with a finger.
- **Interaction**: The "Hover" effect (showing labels) is impossible on touch devices.
- **Readability**: If all labels were shown permanently, they would overlap significantly due to the high density of states on the East Coast.
- **Information Access**: Users cannot easily find a specific capital without randomly pecking at small dots.

## 2. High-Level Design & Reasoning

My approach focuses on **hybrid navigation**. Since a map on mobile is often too small to explore detailed clusters (like the Northeast US), I will pair the map with a **Search/List interface** and a **Detail View**.

The visualization will transform from a passive "hover-to-see" image into an **interactive explorer**.

### Key Design Decisions
1.  **Replace Hover with Tap & Bottom Sheet**: Instead of a fleeting tooltip, tapping a city (or selecting from a list) will open a glassmorphism bottom sheet/card containing the city details.
2.  **Search & List Integration**: To solve the "fat finger" problem on small maps, I will add a search bar and a scrollable list of states. Selecting an item from the list will highlight it on the map.
3.  **Premium Aesthetics**: Move from "Gray/Black" to a "Cyber/Dark Mode" aesthetic. Dark blue ocean/background, subtle glass state shapes, and glowing neon points for capitals.
4.  **Tech Stack Adaptation**: While Recharts is excellent for statistical charts, it is ill-suited for drawing complex TopoJSON map projections. **Justification**: To ensure the "Premium Aesthetics" and "Mobile-First UX" requirements, I will use **standard React SVG with `d3-geo`** for the map rendering. This ensures crisp rendering and proper projection, which Recharts cannot natively handle for custom geometries.

## 3. Design Action Space Planning

Based on the `mobile-vis-design-action-space.md`, here are the specific actions:

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | `Rescale` (Aspect Ratio) | The map is naturally landscape. On mobile, we will force a fixed aspect ratio container (e.g., aspect-video) but allow the user to pan/zoom or simply use the width effectively. |
| **L0** | **Container** | `Reposition` | Move the "Title" and controls outside the SVG to a dedicated React header to save graphical space for the map itself. |
| **L1** | **Interaction** | `Recompose (Replace)` | **Replace Hover with Click**: Mobile users cannot hover. Tapping a dot triggers the feedback loop. |
| **L2** | **Features** | `Add Feature (Search)` | **Compensate**: Since dots are hard to hit, add a "Search City/State" input (Lucide Icon) to programmatically select a capital. |
| **L2** | **Feedback** | `Reposition (Fix)` | **Fix Tooltip Position**: Instead of a tooltip appearing *at* the dot (blocked by finger), display details in a **Fixed Bottom Card** or Sheet. |
| **L2** | **Data Marks** (Dots) | `Rescale` | **Increase Size**: The visual dot can remain distinct, but the invisible SVG "hit area" (`pointer-events`) must be at least 44x44px for accessibility. |
| **L2** | **Data Marks** (Dots) | `Recompose (Encoding)` | **Color & Glow**: Change black dots to a primary brand color (e.g., Cyan or Amber) with a CSS drop-shadow glow to make them pop against a dark map. |
| **L2** | **Annotations** | `Recompose (Remove)` | **Remove on-map Labels**: Do not try to show text labels on the map itself (too cluttered). Show text only in the Bottom Card when selected. |
| **L3** | **Title** | `Reposition` | Move title from inside the Vega spec to a styled HTML header above the map. |

## 4. Data Extraction Plan

We need real data to ensure the map is accurate. I will not fake the coordinates.

1.  **Source URLs**:
    -   Topography: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json`
    -   Capitals: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-state-capitals.json`
2.  **Extraction Method**:
    -   The component will utilize a `useEffect` or server-side fetch to retrieve these JSON files.
    -   **Fallback**: Since these are static datasets, I will recommend hardcoding the *Capitals* data (only ~50 items) directly into the component code to ensure it works offline and loads instantly. The *Topography* is larger, so we will fetch it or use a simplified version.
    -   **Coordinate Processing**: The source data provides `lat` and `lon`. We need to use `d3-geo`'s `geoAlbersUsa` to project these `[lon, lat]` coordinates into `[x, y]` SVG coordinates matching the state shapes.

## 5. Implementation Steps

### Step 1: Data Preparation & Utilities
-   Create a helper file `data/us-map-data.ts`.
-   Copy the content of the capitals JSON into a constant `CAPITALS`.
-   Create a utility function using `d3-geo` to project coordinates.

### Step 2: Component Architecture
-   **`Visualization.tsx`**: The main container.
    -   **`MapContainer`**: An SVG wrapper.
    -   **`StatePaths`**: Renders the `us-10m.json` features.
    -   **`CapitalMarkers`**: Renders the dots.
    -   **`ControlPanel`**: A UI layer on top (Search bar).
    -   **`InfoCard`**: The bottom sheet displaying selected city details.

### Step 3: Visual Styling (Tailwind)
-   **Container**: `relative w-full overflow-hidden bg-slate-900 rounded-xl shadow-2xl`.
-   **Map**: `fill-slate-800 stroke-slate-700`.
-   **Dots**: `fill-cyan-400 hover:fill-cyan-200 transition-colors`. Add a pulsating animation for the *selected* dot.
-   **InfoCard**: `absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg`.

### Step 4: Interaction Logic
-   State: `selectedCapital` (Capital Object | null).
-   Event: `onClick` on a circle sets `selectedCapital`.
-   Event: `onChange` on Search Input filters list; selecting an item sets `selectedCapital`.
-   Effect: When `selectedCapital` changes, the map could optionally "zoom" or simply highlight the dot.

### Step 5: Readability Assurance
-   Ensure the map scales to `width: 100%`.
-   Add a subtle "pinch to zoom" or simpler "Zoom In/Out" buttons using `d3-zoom` logic if the map feels too small, OR rely on the Search/List feature as the primary navigation method for small screens. *Decision: Start with static scale fitted to width, but ensure points are large enough.*

## 6. Mobile Readability Checklist
-   [ ] Are touch targets > 44px? (Will use invisible padding around dots).
-   [ ] Is text legible? (All text moved to HTML overlays, none inside SVG).
-   [ ] Is the contrast high enough? (Dark mode with bright accents).
-   [ ] Does it fit vertical screens? (Aspect ratio handled via container).