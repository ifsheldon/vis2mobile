# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization
*   **Source**: A Vega-Lite specification rendering a US Choropleth map.
*   **Content**: US Counties (geom) colored by unemployment rate (quantitative data).
*   **Current Desktop State**:
    *   **Aspect Ratio**: Wide landscape (~5:3).
    *   **Density**: 3,000+ tiny polygons (counties).
    *   **Interaction**: Likely hover-based tooltips (implied by standard web maps).
    *   **Legibility on Mobile**:
        *   **Scale**: When shrunk to mobile width, individual counties (especially on the East Coast) become sub-pixel or indistinguishable.
        *   **Interaction**: "Fat-finger" problem makes selecting specific counties impossible.
        *   **Context**: No text labels are visible; reliance on spatial knowledge is high.
        *   **Data Access**: Precise values are inaccessible.

## 2. Design Action Space Strategy

To transform this into a **premium mobile-first component**, we cannot simply render the map smaller. We must change the interaction model from "Hover to explore" to "Select and Drill-down".

### High-Level Actions

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | **Rescale / Reposition** | Use a full-screen vertical layout. The map will occupy the top portion (`h-1/2`), while the bottom portion (`h-1/2`) will be dedicated to data details (Context). |
| **L1** | **DataModel** | **Recompose (Aggregate)** | The raw county map is too noisy. We will aggregate data by **State** for an initial view or list, but keep the map interactivity. We will add a **Recharts** histogram to show the distribution of rates, which is missing in the original map. |
| **L1** | **Interaction** | **Drill-down / Zoom** | **Crucial Action**: Implement a "Zoom to State" feature. Tapping a state (or selecting from a list) zooms the map to that state, making counties large enough to tap. |
| **L2** | **Triggers** | **Recompose (Replace)** | Replace `Hover` with `Tap/Click`. Hover is non-existent on mobile. |
| **L2** | **Feedback** | **Reposition (Fix)** | Instead of a floating tooltip, use a **Fixed Bottom Sheet** or "Data Card" to display details of the selected county/state. |
| **L2** | **Auxiliary** | **Reposition (Legend)** | Move the color legend from a side floating element to a horizontal gradient bar integrated into the Data Card or top header. |
| **L3** | **Chart (Aux)** | **Add (Recharts)** | The original map shows spatial distribution. I will *add* a Recharts Bar Chart in the details panel to show "Top 5 Counties with Highest Unemployment" for the selected context (National or State). This solves the "Readability" issue by listing data explicitly. |

### Why these actions?
*   **Map Retention**: We keep the map (Native SVG) because spatial context is the core intent.
*   **Readability**: We add Recharts bar charts because reading specific values from a map color is hard, especially on small screens.
*   **Premium UX**: Glassmorphism data cards and smooth transitions (Zoom) create the "Wow" factor.

## 3. Data Extraction Plan

Since I cannot use "fake data", I must implement logic to fetch and parse the exact files referenced in the HTML `spec`.

1.  **Sources**:
    *   Topology: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json`
    *   Rates: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment.tsv`
2.  **Extraction Logic (in `useEffect` or utility)**:
    *   Fetch both URLs.
    *   Parse the TSV text into a JSON Map: `Record<FIPS_ID, Rate>`.
    *   Parse the TopoJSON into GeoJSON features (States and Counties).
    *   **Join**: Merge the Rate data into the GeoJSON properties using the ID.
3.  **Color Scale**: Calculate the Domain (Min/Max rate) dynamically from the data to generate the color gradient (Quantize scale).

## 4. Implementation Plan

### Step 1: Component Structure
*   `Visualization.tsx`: Main container.
    *   `MapContainer`: Handles the SVG map rendering and Zoom logic.
    *   `DataPanel`: A glassmorphism panel fixed at the bottom.
        *   `StatCard`: Displays current selection info (Name, Rate).
        *   `DistributionChart`: A **Recharts** Bar/Area chart showing the data trend/ranking.

### Step 2: The Map (Native SVG)
*   Since Recharts is not suitable for complex GeoJSON maps, I will build a standard React SVG map component.
*   **Projection**: Use `d3-geo` or pre-calculated path logic (Albers USA).
*   **Interaction**:
    *   Default view: Show States.
    *   Click State: Animate ViewBox to bound of State, reveal Counties.
    *   Click County: Update `DataPanel`.

### Step 3: The Data Panel (Recharts Integration)
*   **Mobile adaptation**: Instead of just showing the map, we show *analysis*.
*   **Visual**: Use Recharts `<BarChart>` (layout="vertical") to list the top 5 highest unemployment counties in the currently visible view (National or Selected State).
*   **Why**: Vertical bar charts are mobile-friendly (Action Space: `Transpose`). This ensures users can read the extreme values clearly.

### Step 4: Styling & Aesthetics (Tailwind)
*   **Theme**: Dark mode default for "Premium" feel.
*   **Palette**: Deep slate background. Map scale: Yellow -> Red or Blue -> Purple (accessible).
*   **Glassmorphism**: `bg-opacity-20 backdrop-blur-lg` for the Data Panel.

### Step 5: Readability Check
*   **Typography**: Large numbers for rates (e.g., "4.5%"). Readable labels for County names.
*   **Touch Targets**: Ensure bars in the chart and states on the map have sufficient padding/size.

## Summary of Transformed Experience
The user sees a sleek US map. They tap "California". The map smoothly zooms in. The bottom panel slides up showing "California Avg Rate: 5.2%" and a Bar Chart listing "Imperial County" as having the highest rate. This is far superior to a static shrunk desktop image.