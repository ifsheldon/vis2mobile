# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Content
The original visualization consists of two vertically concatenated charts (`vconcat`) powered by Vega-Lite:
1.  **Top Chart (Ratings Heatmap)**: A binned scatterplot/heatmap.
    *   **X-Axis**: IMDB Rating (Quantitative).
    *   **Y-Axis**: Rotten Tomatoes Rating (Quantitative).
    *   **Layer 1 (Background)**: A rectangular heatmap where color represents the total count of records (GreenBlue scheme).
    *   **Layer 2 (Foreground)**: Points representing records filtered by the bottom chart selection. Size represents count, color is fixed grey.
2.  **Bottom Chart (Genre Distribution)**: A vertical bar chart.
    *   **X-Axis**: Major Genre (Nominal).
    *   **Y-Axis**: Count of records (Quantitative).
    *   **Interaction**: Selecting a bar highlights it in "steelblue" and filters the top chart. Unselected bars are grey.

### Mobile & Desktop Issues
*   **Aspect Ratio**: The square-ish heatmap looks okay on mobile width, but the vertical bar chart (bottom) has too many categories ("Major Genre") to fit horizontally on a narrow mobile screen. Labels will overlap or be unreadable.
*   **Interaction**: The brushing/linking mechanism (clicking a bar to filter) is excellent but needs to be touch-optimized.
*   **Legibility**: Axis titles and ticks in the standard Vega-Lite render are often too small for mobile.
*   **Space Efficiency**: Vertically stacking them is correct, but the vertical bar chart consumes vertical space inefficiently if labels are rotated.

## 2. High-Level Design Strategy

My strategy centers on **Transposition** and **Touch-First Interaction**.

1.  **Genre Chart (Controller)**: Transform the vertical bar chart into a **Horizontal Bar Chart**. This allows long genre names to be readable without rotation and makes the bars easier to tap (larger vertical hit area).
2.  **Ratings Chart (Detail View)**: Maintain the Heatmap/Scatter structure but ensure it scales responsively. Use a "Card" layout to separate it visually.
3.  **Interaction Flow**: The Genre chart becomes the primary filter.
    *   *Default State*: "All Genres" selected (showing total distribution).
    *   *Active State*: User taps a Genre bar -> Top Heatmap updates its overlay layer to show distribution for that specific genre.

## 3. Action Plan (Mapped to Design Action Space)

### L0: Visualization Container
*   **Action: `Rescale`**: Set container width to 100% and allow height to grow naturally (scrollable layout).
*   **Action: `Reposition`**: Add global padding (Tailwind `p-4`) to prevent edge-to-edge crowding.

### L1: Data Model
*   **Action: `Recompose (Aggregate)`**:
    *   The raw data (individual movies) needs to be aggregated twice:
        1.  Group by `Major Genre` for the Bar Chart.
        2.  Bin by `IMDB` and `Rotten Tomatoes` ratings (e.g., 0.5 or 1.0 step) for the Heatmap.
    *   **Justification**: Recharts doesn't do auto-binning like Vega-Lite; we must pre-calculate bins in the parent component.

### L1: Interaction Layer
*   **Action: `Recompose (Replace)` (Trigger)**: Replace the `param` selection (brushed point) with a clear `onClick` state on the Genre bars.
*   **Action: `Feedback`**: When a bar is tapped, change its visual state (e.g., opacity or border) and update the "overlay" layer data in the Heatmap.

### L2: Coordinate System (Genre Chart)
*   **Action: `Transpose Axes`**: Convert the Genre chart from Vertical Bars to **Horizontal Bars**.
    *   **Why**: "Major Genre" labels are text-heavy. Horizontal bars allow labels to be horizontal and readable on narrow screens.
*   **Action: `Rescale`**: Calculate the height of the Genre chart dynamically based on the number of genres (e.g., `height = numGenres * 40px`). This ensures touch targets are large enough.

### L2: Data Marks (Heatmap)
*   **Action: `Recompose (Change Encoding)`**:
    *   Recharts doesn't have a native "Rect" mark for heatmaps. I will use a `ScatterChart` with a **Custom Shape** (rectangle) for the background layer.
    *   The "Foreground" (selected genre) will be a second `Scatter` layer with circular shapes overlaid on top.
*   **Action: `Rescale`**: Adjust the size of the heatmap "cells" so they touch each other (mimicking a grid) on mobile widths.

### L3/L4: Axes & Ticks
*   **Action: `Recompose (Remove)` (Axis Line)**: Remove the axis lines for a cleaner look, keeping only grid lines (faint) and labels.
*   **Action: `Simplify Labels`**:
    *   Genre Chart: Hide X-Axis (Count) numbers if we place the count *value* inside or next to the bar (Direct Labeling).
    *   Ratings Chart: Keep X (IMDB) and Y (Rotten Tomatoes) but reduce tick count (e.g., every 2 units) to prevent overcrowding.

### L3: Legend
*   **Action: `Reposition`**: Move legend info to a dedicated "Status Bar" or Title area above the chart (e.g., "Showing: Action Movies").
*   **Action: `Recompose (Remove)`**: Remove the gradient legend for "Total Records". Instead, use a subtitle "Darker squares indicate more movies."

### L2: Tooltips
*   **Action: `Fix Tooltip Position` (Feedback)**: On mobile, floating tooltips obscure data. I will render a fixed summary area (or a specialized distinct tooltip component) that appears when tapping a specific heatmap cell, or rely on the aggregate visualizations. For the Genre chart, the label and value will be visible, so tooltip is less critical.

## 4. Data Extraction Plan

1.  **Source**: Fetch data from `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`.
2.  **Processing (in `src/components/Visualization.tsx`)**:
    *   **Step 1: Clean Data**: Filter out null ratings or genres.
    *   **Step 2: Generate Genre Data**:
        *   Map: `{ genre: string, count: number }`.
        *   Sort by count descending (Pareto principle for better UI).
    *   **Step 3: Generate Heatmap Data (Binned)**:
        *   Define bin size (e.g., IMDB step 1.0, RT step 10).
        *   Create a grid matrix.
        *   Map: `{ x: imd_bin, y: rt_bin, totalCount: number, selectedCount: number }`.
        *   `selectedCount` updates whenever the user interacts with the Genre chart.

## 5. Implementation Steps

1.  **Setup & Fetch**: Create the component, add `useEffect` to fetch the JSON data.
2.  **Data Processing Logic**: Implement the binning function and grouping function.
3.  **Component Structure**:
    *   `<Header>`: Title and current filter state.
    *   `<RatingsHeatmap>`:
        *   Use `Recharts.ScatterChart`.
        *   `XAxis`: IMDB (0-10). `YAxis`: Rotten Tomatoes (0-100).
        *   `Scatter` 1: Background (Total Records). Shape: Square. Color: Interpolated GreenBlue based on count.
        *   `Scatter` 2: Foreground (Selected Records). Shape: Circle. Size: Scale with `selectedCount`. Color: Grey/Black.
    *   `<GenreBarChart>`:
        *   Use `Recharts.BarChart` with `layout="vertical"`.
        *   `XAxis`: Type="number" (hide). `YAxis`: Type="category" (Genre names), width=100.
        *   `Bar`: Custom shape or standard bar. onClick handler updates state.
4.  **Styling**:
    *   Apply Tailwind classes for glassmorphism containers.
    *   Ensure typography is legible (text-sm or text-xs for axes, text-lg for titles).
    *   Add transitions for smooth data updates.