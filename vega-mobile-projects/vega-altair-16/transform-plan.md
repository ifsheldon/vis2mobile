# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Bubble Chart (Scatter Plot) / 2D Distribution.
- **Axes**:
    - **X-Axis**: Year (Temporal, 1900-2017). Broad horizontal span.
    - **Y-Axis**: Entity (Disaster Type). Nominal categories (e.g., Earthquake, Flood), sorted by total deaths.
    - **Mark**: Circle.
        - **Size**: Number of Deaths (Quantitative).
        - **Color**: Entity (Redundant with Y-axis position, used for distinction).
- **Interactions**: Hover tooltips showing specific year, entity, and death count.
- **Layout**: Wide aspect ratio. Labels for disaster types are on the left Y-axis.

### Mobile Issues (Desktop on Mobile)
- **Aspect Ratio Mismatch**: The wide temporal X-axis gets crushed on a portrait mobile screen, making individual years indistinguishable.
- **Overplotting**: Bubbles overlap significantly when compressed horizontally.
- **Readability**: Y-axis labels (Disaster names) occupy too much horizontal space, reducing the data area.
- **Interaction**: Hover-based tooltips are inaccessible on touch devices. Small bubbles are hard to tap ("Fat-finger problem").

## 2. Mobile Design Strategy

To ensure readability and a "Premium Mobile-First" experience, we cannot simply shrink the desktop chart. We must leverage the vertical scrolling nature of mobile devices.

**Core Concept: Transposed Swimlane Timeline**

Instead of reading Time left-to-right (which is limited by screen width), we will flow Time **top-to-bottom**. This allows the chart to be as long as necessary to separate the data points without overlapping.

1.  **Transpose Axes**: Swap X and Y.
    -   **New Y-Axis (Vertical)**: Time (1900 - 2017).
    -   **New X-Axis (Horizontal)**: Disaster Entities.
2.  **Columnar Layout**: Each Disaster Entity gets a dedicated vertical "Swimlane" (column).
3.  **Header Optimization**: Replace text labels for Disaster types with **Icons** in a sticky header to save horizontal space.
4.  **Interaction**: Replace hover with a "Tap" interaction that opens a **Bottom Sheet** or **Drawer** with detailed metrics for that event.

## 3. Design Action Space Mapping

Based on `mobile-vis-design-action-space.md`, here are the specific actions:

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | `Rescale` | Set width to 100% and allow `height` to be auto-expanding (scrollable). |
| **L2** | **CoordSys** | **`Transpose Axes`** | **CRITICAL ACTION.** Rotate the chart 90°. Time becomes vertical (infinite scroll), Entities become horizontal columns. This solves the width constraint. |
| **L2** | **CoordSys** | `Reposition` | Implement a **Sticky Header** for the X-axis (Disaster Icons) so context is lost while scrolling down. |
| **L3** | **Axes (Time)** | `setRange` | Expand the vertical range significantly (e.g., 1500px+) to reduce bubble overlap. |
| **L3** | **Axes (Time)** | `decimateTicks` | Show distinct decade markers (1900, 1910...) on the left or sticky-positioned. |
| **L4** | **AxisTitle** | `Recompose (Remove)` | Remove explicit "Year" label; the decade numbers are self-explanatory. |
| **L4** | **TickLabel (Entity)**| `Recompose (Replace)` | Replace full text names (e.g., "Extreme temperature") with Lucide Icons or 2-letter codes to fit 7-8 columns on a 375px screen. |
| **L3** | **MarkSet** | `rescaleMark` | Adjust bubble size scale. `r` should be relative to the column width (max width ~40px). |
| **L1** | **Interaction** | `Recompose (Replace)` | `Hover` -> `Click`. Tapping a bubble triggers a detail view. |
| **L2** | **Feedback** | `Reposition (Fix)` | Tooltips moved to a fixed **Bottom Sheet/Card** to avoid occlusion by the finger. |

## 4. Data Extraction Plan

The original HTML uses a Vega dataset URL. I will fetch and process this real data.

**Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/disasters.csv`

**Processing Steps**:
1.  **Fetch**: Retrieve CSV data.
2.  **Filter**: Remove rows where `Entity === "All natural disasters"` (matching the original spec's filter).
3.  **Extract Fields**: `Entity`, `Year`, `Deaths`.
4.  **Sort (Columns)**: Calculate "Total Deaths" per Entity and sort the columns (X-axis) from left to right by highest impact (matching the original's Y-axis sorting logic).
5.  **Sort (Rows)**: Ensure data is sorted by Year.

## 5. Implementation Steps

1.  **Setup & Utilities**:
    -   Initialize `lucide-react` for disaster icons (Waves for Flood, Thermometer for Temp, Activity for Quake, etc.).
    -   Create a color palette map for each disaster type.

2.  **Data Component**:
    -   Create a function to load the `disasters.csv` data (simulated or fetched).
    -   Process data: Group by Entity to determine column order.

3.  **Layout Construction (The Swimlane)**:
    -   **Header**: A fixed `div` row containing Icons for each Disaster Type.
    -   **Timeline Body**: A scrollable `div`.
    -   **Grid System**: Use CSS Grid. Rows = Years, Columns = Entities.
        -   *Alternative Implementation*: Use absolute positioning based on Year scale (scaleLinear) for smoother vertical placement than discrete grid rows.

4.  **Visual Components**:
    -   **Y-Axis (Time)**: Render decade markers on the left edge.
    -   **Bubbles**: Render circles at `(Column_Center, Year_Y)`.
    -   **Sizing**: Map `Deaths` to `Circle Radius` (Scale `sqrt` for area accuracy).

5.  **Interaction Layer**:
    -   Implement `selectedEvent` state.
    -   Render a **Glassmorphic Detail Card** fixed at the bottom of the screen when a bubble is tapped.
    -   Card shows: Full Disaster Name, Year, Death Count (formatted), and a "Close" button.

6.  **Refinement**:
    -   Add subtle grid lines (horizontal for decades, vertical for swimlanes).
    -   Ensure touch targets are large enough (add invisible padding around small bubbles).
    -   Apply Tailwind classes for a modern, clean look (slate/zinc colors, rounded corners).

This plan transforms a "Wide Desktop Chart" into a "Vertical Mobile Timeline," perfectly suiting the device's constraints while keeping all data points.