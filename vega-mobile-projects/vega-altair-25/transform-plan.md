# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Original Desktop Version
- **Structure**: Vertical arrangement of two charts.
    - **Top (Heatmap/Scatter Hybrid)**: A 2D binned plot comparing "IMDB Rating" vs. "Rotten Tomatoes Rating".
        - Background: Rectangles colored by total record count (GreenBlue scheme).
        - Foreground: Circles sized by "Records in Selection" (grey).
        - Interaction: Brushing/Selecting a range on the X-axis filters the bottom chart.
        - Legend: Placed on the right side.
    - **Bottom (Bar Chart)**: Distribution of "Major Genre".
        - X-Axis: Genre (Categorical).
        - Y-Axis: Count of Records.
        - Labels: Vertical text for genres (hard to read).
        - Color: Grey base, Steelblue for selected data.

### Mobile Constraints & Issues (Desktop on Mobile)
- **Aspect Ratio**: The 2D heatmap becomes too small to distinguish individual bins or tap them accurately.
- **Readability**:
    - The vertical X-axis labels on the Bar Chart ("Black Comedy", "Concert/Performance") will be unreadable or overlap significantly on a narrow screen.
    - The Legend on the right squeezes the main chart area, making the data ink ratio poor for mobile.
- **Interaction**:
    - The "Brush" interaction (dragging a box to select a range) is notoriously difficult on mobile touchscreens ("Fat-finger problem").

## 2. Design Action Space & Reasoning

### L0: Visualization Container
*   **Action: `Rescale` (Fit width)**
    *   **Reasoning**: Mobile screens are narrow. The container must occupy 100% of the width with appropriate padding.
*   **Action: `Reposition` (Vertical Stack)**
    *   **Reasoning**: Keep the vertical stacking of the two charts but increase vertical spacing to ensure distinct touch areas.

### Chart 1: Rating Correlation (Heatmap/Scatter)
*   **L3 Legend: `Reposition` (Move to Bottom/Top)**
    *   **Reasoning**: The side legend consumes ~20% of horizontal space. Moving it to the top (as a summary header) or bottom allows the heatmap to expand to full width.
*   **L5 Tooltip: `Reposition (Fix)`**
    *   **Reasoning**: Hover is not available. Tooltips should appear in a fixed location (e.g., top of the card) or a modal upon clicking a cell.
*   **L2 Interaction: `Recompose (Replace)` (Drag -> Tap)**
    *   **Reasoning**: Replace the complex "Brush" (drag selection) with a simpler "Tap to Filter" or simply remove the cross-filtering if it degrades UX too much. *Plan: Allow tapping a specific bin to see details, rather than dragging a range.*

### Chart 2: Genre Distribution (Bar Chart)
*   **L2 Coordinate System: `Transpose` (Vertical -> Horizontal)**
    *   **Reasoning (CRITICAL)**: Vertical bar charts with long categorical labels (Genres) are terrible on mobile. By transposing to a **Horizontal Bar Chart**, we give the text ample horizontal space to be read naturally from left to right.
*   **L4 Axis: `Recompose (Remove)` (X-Axis)**
    *   **Reasoning**: In a horizontal bar chart, the numeric axis (now bottom) takes up space. We can remove the axis line/ticks and place the **Data Label (Value)** directly inside or at the end of the bar.
*   **L4 Axis Title: `Recompose (Remove)`**
    *   **Reasoning**: "Count of Records" is implied by the title or context. Removing it saves vertical space.

### General UI/UX
*   **L1 Data Model: `Codify Data`**
    *   **Reasoning**: Extract the raw JSON (`movies.json`). Do not use the pre-calculated view. We need to calculate bins and counts dynamically to support responsive resizing or custom binning if necessary.

## 3. Detailed Implementation Steps

### Step 1: Data Extraction & Processing
1.  **Fetch Data**: Retrieve `movies.json` from the provided Vega dataset URL.
2.  **Process Data (Transformation)**:
    *   **Binning**: Create a utility function to bin "IMDB Rating" and "Rotten Tomatoes Rating".
    *   **Aggregation (Heatmap)**: Group data by these bins to calculate `count` (for rect color) and `selection_count` (for circle size).
    *   **Aggregation (Bar Chart)**: Group data by "Major Genre" to calculate total counts.
    *   **Sorting**: Sort genres by count descending to make the horizontal bar chart easier to read.

### Step 2: Component Architecture (Next.js)
1.  **Container**: Create a `Visualization` component with a responsive grid/flex layout.
2.  **State Management**:
    *   Use React `useState` to hold the "Selection" state (if preserving interactivity).
    *   *Simplification*: Instead of a drag-brush, we might simply show the global distribution to ensure a high-quality static view first. If interaction is added, it will be tapping a Genre to highlight that genre's position in the Heatmap (Reverse interaction is easier on mobile).

### Step 3: Top Chart - Heatmap (Recharts `ScatterChart` customized)
1.  **Composition**:
    *   Use `ScatterChart` or a custom SVG Grid. Given Recharts limitations with heatmaps, a customized **Grid Layout** using Tailwind Grid or SVG might be cleaner than forcing Recharts.
    *   *Decision*: Use **Recharts `ScatterChart`** with `Customized` shapes.
        *   Layer 1: Rectangles (The Heatmap background).
        *   Layer 2: Circles (The Scatter overlay).
2.  **Styling**:
    *   X-Axis: IMDB Rating.
    *   Y-Axis: Rotten Tomatoes.
    *   Map color intensity to the `count`.

### Step 4: Bottom Chart - Horizontal Bar Chart (Recharts `BarChart`)
1.  **Composition**:
    *   `layout="vertical"` in Recharts.
    *   `XAxis type="number" hide`.
    *   `YAxis type="category" dataKey="genre" width={100}` (Adjust width for readability).
2.  **Styling**:
    *   Bars: Rounded corners, gradient fill (Premium Aesthetic).
    *   Labels: Render value labels to the right of the bars.

## 4. Data Extraction Plan

**Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`

**Processing Logic**:
1.  **Clean Data**: Filter out records where `IMDB Rating`, `Rotten Tomatoes Rating`, or `Major Genre` is null.
2.  **Heatmap Data Structure**:
    ```typescript
    interface HeatmapCell {
      xBin: number; // IMDB Rating rounded down
      yBin: number; // Rotten Tomatoes rounded down
      count: number;
      movies: Movie[]; // Keep reference for tooltip
    }
    ```
3.  **Bar Chart Data Structure**:
    ```typescript
    interface GenreStat {
      genre: string;
      count: number;
    }
    ```
4.  **Binning Logic**:
    *   IMDB: Bin size 1.0 (0-10).
    *   Rotten Tomatoes: Bin size 10 (0-100).

## 5. Mobile Readability Assurance (Hard Requirement Check)

*   **Font Size**: All text (Axis labels, Tooltips) will be at least `12px` (Tailwind `text-xs` or `text-sm`).
*   **Contrast**: Use adequate contrast for text against the glassmorphism background.
*   **Touch Targets**: The "Transpose" action on the bar chart ensures genre names are readable without rotation.
*   **Spacing**: Add gap between the two charts so the user knows they are distinct but related.