# Mobile Visualization Transformation Plan

## 1. Analysis of Desktop Visualization & Mobile Challenges

**Original Visualization**:
The desktop visualization is a "Binned Scatterplot" (or 2D Histogram) using circles.
- **X-Axis**: IMDB Rating (Binned). Range approx 1.0 to 9.0.
- **Y-Axis**: Rotten Tomatoes Rating (Binned). Range 0 to 100.
- **Mark**: Circles.
- **Encoding**: Size of the circle represents the `count` of records in that bin.
- **Layout**: Large whitespace, axes titles outside the chart, legend on the right.

**Mobile Challenges (based on `desktop_on_mobile.png`)**:
1.  **Aspect Ratio Distortion**: The square grid becomes a tall, narrow rectangle, distorting the correlation visualization (Slope=1 is harder to see).
2.  **Screen Real Estate**: The Y-axis title "Rotten Tomatoes Rating (binned)" is rotated 90 degrees and takes up valuable horizontal width (approx 20-30px).
3.  **Legend**: The legend on the right squeezes the chart area further, making the data points tiny.
4.  **Touch Targets**: Small circles (representing low counts) are difficult to tap for details.
5.  **Text Readability**: Axis ticks and titles scale down poorly.

## 2. Vis2Mobile Design Action Space Plan

To transform this into a premium mobile component, I will apply the following actions from the design space:

### **L0: Visualization Container**
-   **Action: `Rescale`**: Set container width to 100% and calculate height dynamically to maintain a roughly 1:1 or 4:5 aspect ratio for the grid, ensuring the correlation angle remains intuitive.
-   **Action: `Reposition`**: Remove default Vega margins. Use Tailwind's spacing system to maximize the chart area within the card.

### **L1: Data Model**
-   **Action: `Recompose (Aggregate)`**: The source uses raw `movies.json`. I need to replicate the aggregation logic:
    1.  Fetch/Import data.
    2.  Bin `IMDB Rating` (Step size ~1.0).
    3.  Bin `Rotten Tomatoes Rating` (Step size ~10).
    4.  Count records per bin `(x, y)`.
    - *Reason*: Recharts requires pre-aggregated data for this type of scatter/bubble view.

### **L2: Title Block**
-   **Action: `Recompose (Replace)`**:
    -   Combine separate Axis Titles into a cohesive Header.
    -   *Old*: X Title "IMDB...", Y Title "Rotten Tomatoes..."
    -   *New*: Main Title "Movie Ratings Correlation", Subtitle "IMDB vs. Rotten Tomatoes".
-   **Action: `Reposition`**: Move all context (what the axes represent) to the top header to free up chart boundary space.

### **L3: Coordinate System (Axes)**
-   **Action: `Recompose (Remove)` (Axis Titles)**: Remove the `label` prop from X and Y axes in Recharts. The Header explains the dimensions.
-   **Action: `Rescale` (Tick Labels)**: Keep tick labels but reduce font size (e.g., `text-xs`).
-   **Action: `Decimate Ticks`**: Ensure ticks don't overcrowd. X-axis: 1, 3, 5, 7, 9. Y-axis: 0, 20, 40, 60, 80, 100.

### **L3: Legend Block**
-   **Action: `Reposition`**: Move legend from Right -> Top (below title) or Bottom.
-   **Action: `Transpose`**: Change layout from Vertical List -> Horizontal Flex row.
-   **Action: `Simplify`**: Instead of a discrete scale (0, 50, 100, 150), use a smooth visual guide or 3 representative sizes (Small, Medium, Large) labeled "Volume".

### **L2: Data Marks (Circles)**
-   **Action: `Rescale`**: Adjust the radius range (`z` axis in Recharts Scatter) to be mobile-friendly. Minimum 4px (visibility), Maximum ~15-20px (avoid overcrowding but clearly show hotspots).
-   **Action: `Redundant Encoding`**: Add a slight color gradient (Data Density) in addition to size. Darker/More Opaque blue for larger circles. This helps visibility on small screens where size differences might be subtle.
-   **Action: `Disable Hover` / `Replace Trigger`**:
    -   Desktop: Hover for count.
    -   Mobile: Tap to activate a custom tooltip. Use a "Crosshair" cursor interaction or a fixed Tooltip at the top/bottom of the chart (`L2 Feedback: Reposition (Fix)`).

## 3. Data Extraction & Processing Plan

Since the source is a Vega-Lite spec referencing an external URL, I cannot scrape the SVG coordinates directly. I must perform the **Data Transformation** step in the component logic (or a utility file) to generate the "Real Data".

**Source**: `https://vega.github.io/editor/data/movies.json`

**Processing Logic (TypeScript)**:
1.  **Interface**:
    ```typescript
    interface MovieData {
      IMDB_Rating: number;
      Rotten_Tomatoes_Rating: number;
      // ... other fields irrelevant for this specific chart
    }
    interface BinnedPoint {
      x: number; // Bin center for IMDB
      y: number; // Bin center for Rotten Tomatoes
      count: number; // Size
    }
    ```
2.  **Binning Algorithm**:
    -   Filter invalid data (`null` ratings).
    -   **X-Binning**: `Math.floor(d.IMDB_Rating) + 0.5` (Bins: 1.5, 2.5... or just floor to integer). Looking at the desktop chart, it seems to center on integers or half-integers. I will use standard binning: `bin = floor(value / step) * step`.
    -   **Y-Binning**: `Math.floor(d.Rotten_Tomatoes_Rating / 10) * 10`.
    -   **Aggregation**: Use a Map or Object to count occurrences of unique `(binX, binY)` keys.
3.  **Output**: A flat array `BinnedPoint[]` ready for Recharts `<ScatterChart>`.

## 4. Implementation Steps

### Step 1: Setup & Data Utility
-   Create `src/utils/processMovieData.ts`.
-   Implement the fetching and binning logic described above.
-   Ensure the data is cached or memoized to prevent re-calculation on every render.

### Step 2: UI Shell (The "Card")
-   Create `src/components/Visualization.tsx`.
-   Use a "Glassmorphism" effect: `bg-white/10 backdrop-blur-md border border-white/20`.
-   **Header Section**:
    -   Title: "Rating Distribution" (Bold, `text-white` or high contrast).
    -   Subtitle: "IMDB (X) vs. Rotten Tomatoes (Y)" (`text-gray-400 text-sm`).
    -   Legend: A compact horizontal row showing 3 circles of increasing size (`Counts: Low • Med • High`).

### Step 3: The Chart (Recharts)
-   Use `<ResponsiveContainer width="100%" height={350} >`.
-   Use `<ScatterChart>`.
-   **X Axis**: Type number, domain `[0, 10]`, hide axis line, keep ticks.
-   **Y Axis**: Type number, domain `[0, 100]`, hide axis line, keep ticks.
-   **Z Axis**: (For size). Range `[50, 400]` (pixel area) maps to data count.
-   **Scatter**:
    -   `data={processedData}`.
    -   `shape="circle"`.
    -   Fill: Use a variable blue palette (Tailwind `text-blue-500`).
    -   Animation: `isAnimationActive={true}` with a gentle pop-in effect.

### Step 4: Mobile Refinement
-   **Tooltip**: Use `<Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomMobileTooltip />} />`.
    -   *CustomMobileTooltip*: A small floating card that appears above the finger, showing "IMDB: 7-8, RT: 80-90, Count: 142".
-   **Typography**: Ensure all text is at least 12px (`text-xs` or `text-sm`) and high contrast.

### Step 5: Final Polish
-   Add a subtle grid (`<CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />`) to maintain the "bin" feel without clutter.
-   Ensure padding matches the design system (e.g., `p-4` or `p-6`).

This plan transforms the "squished" desktop chart into a native-feeling mobile app component, preserving the statistical insight while fixing usability issues.