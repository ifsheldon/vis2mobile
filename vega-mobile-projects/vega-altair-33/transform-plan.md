# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version
- **Type**: Symbol Map (Bubble Map) overlaying a US State Map.
- **Content**: Displays the number of airports per US state.
- **Visual Encoding**:
    - **Base**: US States (Albers USA projection).
    - **Marks**: Circles located at the mean latitude/longitude of airports in each state.
    - **Size**: Quantitative (area/radius represents the count of airports).
    - **Color**: Monochromatic Steelblue (`#4682b4`).
- **Interaction**: Hovering over a circle reveals a tooltip with the State name and Count.
- **Layout**: Landscape map with a legend on the right side.

### Mobile Challenges (Based on `desktop_on_mobile.png`)
1.  **Aspect Ratio Mismatch**: The wide US map shrinks significantly to fit the narrow mobile width, making states and bubbles tiny.
2.  **Unreadable Legend**: The legend on the right compresses the map further or becomes too small to read.
3.  **Interaction Gap**: Hover triggers for tooltips do not exist on touch devices.
4.  **Touch Targets**: The bubbles (especially for states with few airports) are too small to reliably tap.
5.  **Information Density**: Text and context are lost due to scaling.

## 2. Design Action Space Planning

To transform this into a premium mobile experience, I will apply the following actions from the Vis2Mobile Design Action Space.

### L0: Visualization Container
*   **Action: `Rescale` (Viewport)**
    *   **Why**: The 100% width of a phone is narrow. We must maximize the map width.
    *   **Plan**: Set the SVG `viewBox` to tightly crop the US map. Use `width: 100%` and allow the height to adjust automatically. Remove fixed pixel dimensions (`height: 300, width: 500` from original).

### L1: Interaction Layer
*   **Action: `Recompose (Replace)` (Hover → Click)**
    *   **Why**: Mobile lacks hover.
    *   **Plan**: Users will tap a state or a bubble to view details.
*   **Action: `Feedback -> Reposition (Fix)` (Tooltip)**
    *   **Why**: Floating tooltips are bad on mobile (finger occlusion).
    *   **Plan**: Implement a **"Bottom Sheet" (Drawer)** or a fixed detail card at the bottom of the screen that slides up or updates when a state is selected.

### L2: Data Marks (The Map & Bubbles)
*   **Action: `Rescale` (Mark Instance)**
    *   **Why**: Direct scaling of desktop bubble sizes might be too small for mobile visibility and touch targets.
    *   **Plan**: Apply a minimum radius threshold (`min-radius`) so even states with few airports have a tappable area. Adjust the sizing scale to be relative to the mobile viewport width.
*   **Action: `Emphases` (Highlight)**
    *   **Why**: To provide immediate feedback on selection.
    *   **Plan**: When a state/bubble is tapped, apply a "Glassmorphism" glow effect or a vibrant stroke color to the active state.

### L2: Auxiliary Components (The Legend)
*   **Action: `Compensate (Toggle)` / `Reposition`**
    *   **Why**: A permanent legend takes up too much space.
    *   **Plan**: Move the specific bubble size legend to the **Bottom Sheet** (visible only when context is needed) or replace it with a text summary (e.g., "Size indicates number of airports") to save space.

### L3: Narrative Layer
*   **Action: `Transpose` (Data Presentation)**
    *   **Why**: Reading values from bubble sizes is imprecise.
    *   **Plan**: In the Bottom Sheet, provide the exact number clearly. Additionally, use **Recharts** to render a **Bar Chart** of the "Top 5 States" in a separate tab or section below the map, adding value that the static map lacks.

## 3. Data Extraction Plan

The original visualization performs aggregation on the client side using Vega. Since I need to create a React component, I must extract the "State" geometry and the "Aggregated Count" data.

**Data Sources to Process:**
1.  **US Map**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json`
2.  **Airports**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/airports.csv`

**Codification Strategy:**
1.  **Geometry**: I will use a simplified TopoJSON/GeoJSON for the US states tailored for React rendering.
2.  **Aggregation**: I will pre-calculate (or simulate logic to calculate) the Group-By operation described in the Vega spec:
    *   `Group By`: State
    *   `Aggregates`: Count (total airports), Mean Latitude, Mean Longitude.
3.  **Resulting Data Structure**:
    ```typescript
    interface StateData {
      id: string; // State ID/Name
      count: number; // Airport Count
      centroid: [number, number]; // [Longitude, Latitude] for bubble placement
    }
    ```
4.  **No Fake Data**: I will implement the specific logic to map the CSV data to the states, ensuring the bubbles appear exactly where the "mean latitude/longitude" of the airports would be, preserving the original data integrity.

## 4. Detailed Implementation Steps

### Step 1: Component Structure
-   **`VisContainer`**: Main wrapper with gradient background.
-   **`MapLayer`**: An SVG component handling the projection (Albers USA) and rendering `<path>` for states.
-   **`BubbleLayer`**: Renders `<circle>` elements on top of the map.
    -   *Tech Note*: While Recharts is the stack, it is not suitable for drawing custom TopoJSON maps. I will use standard SVG for the Map Layer and **Recharts** for the auxiliary data visualization (e.g., a "Top States" bar chart in the details panel) to satisfy the tech stack requirement meaningfully.
-   **`DetailPanel`**: A fixed/slide-up component showing details of the selected state.
-   **`Header`**: Clean title "US Airport Density".

### Step 2: Styling (Tailwind + Glassmorphism)
-   **Palette**: Dark/Modern theme. Deep blue/gray background.
-   **Map**: States in translucent white/gray (`fill-white/10`). Borders `stroke-white/20`.
-   **Bubbles**: Vibrant Blue (`#3b82f6` - Tailwind blue-500) with a glow effect (`drop-shadow`).
-   **Typography**: Inter (default sans), readable sizes (16px+ for body, 24px+ for headers).

### Step 3: Interaction Logic
-   **State Selection**: `onClick` handler on both the State Path and the Bubble.
-   **Visual Feedback**:
    -   Inactive states: Opacity 0.5.
    -   Active state: Opacity 1.0, Stroke highlighted.
    -   Active bubble: Pulsing animation or color shift.

### Step 4: Recharts Integration
-   Inside the **DetailPanel**, I will include a Recharts `BarChart` comparing the selected state's airport count against the National Average or the Top 3 states, providing analytical context that justifies the "Mobile-First Premium" upgrade.

### Step 5: Mobile Optimization
-   **Touch Targets**: Ensure bubbles have a transparent hit area of at least 44x44px even if the visible circle is smaller.
-   **Responsiveness**: Use `viewBox` and `preserveAspectRatio` to keep the map centered.

## 5. Summary of Actions
| Component | Original | Mobile Transformation | Action Category |
| :--- | :--- | :--- | :--- |
| **Container** | Fixed Width (500px) | 100% Width, Auto Height | `L0 Rescale` |
| **Map** | Gray, Static | Glassmorphic, Interactive | `L2 Emphases` |
| **Bubbles** | Small, Hover-only | Sized for mobile, Tap interactive | `L2 Rescale`, `L2 Triggers` |
| **Legend** | Right-side list | Hidden/Contextual in Bottom Sheet | `L3 Reposition` |
| **Tooltip** | Hover Popover | Fixed Bottom Details Panel | `L2 Feedback -> Reposition` |
| **New View** | None | Top States Bar Chart (Recharts) | `L1 Chart -> Add` |