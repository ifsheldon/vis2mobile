# Mobile Visualization Plan: Binned Movie Ratings

## 1. Analysis of Original Visualization

### **Source Overview**
- **Type**: Binned Scatterplot (or Bubble Heatmap).
- **Data Source**: `https://vega.github.io/editor/data/movies.json` (Movies dataset).
- **Axes**:
    - **X-Axis**: IMDB Rating (Quantitative, Binned, maxbins: 10). Range approx 1-10.
    - **Y-Axis**: Rotten Tomatoes Rating (Quantitative, Binned, maxbins: 10). Range 0-100.
    - **Mark**: Circle size represents the `count` of movies in that specific bin.
- **Narrative**: Shows the correlation between critical reviews (Rotten Tomatoes) and audience reviews (IMDB). The cluster along the diagonal suggests a general correlation, but variances exist.

### **Desktop vs. Mobile Issues**
1.  **Aspect Ratio Distortion**: The `desktop_on_mobile.png` shows the chart squished horizontally. A 10x10 grid becomes very narrow rectangular cells, making the circles look like ovals if not handled correctly (though SVG usually handles aspect ratio, the layout density is the issue).
2.  **Small Click Targets**: The bubbles in the lower density areas are tiny. On mobile, these are impossible to tap reliably.
3.  **Axis Label Overlap**: With 10 bins on the X-axis (IMDB), labels like "2, 3, 4..." might be readable, but if intermediate ticks exist, they will overlap.
4.  **Hover Interaction**: The desktop version relies on tooltips via hover (standard Vega behavior) to see the exact count. Mobile has no hover.

---

## 2. Vis2Mobile Design Action Plan

### **High-Level Strategy**
The goal is to transform this into a **Square Aspect Ratio Interactive Bubble Grid**. Unlike standard scatter plots, this is a binned aggregation. We will retain the matrix structure but optimize it for a vertical scrolling feed by making the chart container square (1:1 aspect ratio), which utilizes the full width of the mobile screen while preserving the geometry of the correlation.

### **Specific Actions & Reasoning**

#### **L0 Container**
*   **Action: `Rescale` (1:1 Aspect Ratio)**
    *   **Why**: The data represents a correlation matrix. Squeezing it into a landscape mobile view makes it too small; squeezing it into a portrait rectangle distorts the visual logic of the bins. A square container (`width: 100vw`, `height: 100vw`) ensures the 10x10 grid cells are large enough to interact with.
*   **Action: `Reposition` (Margins)**
    *   **Why**: Maximize screen real estate. Move padding inside the glassmorphic card rather than outside.

#### **L1 Data Model**
*   **Action: `Recompose (Aggregate)`**
    *   **Why**: The raw data is individual movie records. The visualization requires *binned* data. I must implement the aggregation logic in JavaScript (replicating Vega's `bin` transform) to calculate the `count` for every (IMDB bin, RT bin) pair.
    *   **Action Space Validation**: This is essential. Without aggregation, we just have a messy scatter plot with thousands of dots (Overplotting).

#### **L2 Data Marks (Bubbles)**
*   **Action: `Rescale` (Bubble Size)**
    *   **Why**: Mobile requires larger visual cues. I will set a minimum radius for visibility and scale the maximum radius so the largest bubbles almost fill their grid cells, maximizing data ink.
*   **Action: `Recompose (Change Encoding)` (Color + Size)**
    *   **Why**: The original uses only Size. To enhance the "Premium Aesthetics", I will add a redundant Color encoding (Sequential Gradient based on Count or Rating) to make the visualization pop on a glassmorphic background.

#### **L3 Coordinates & Axes**
*   **Action: `Decimate Ticks` (Ticks)**
    *   **Why**: The X-axis (IMDB) has ~10 bins. Displaying every number (1, 2, 3...10) might crowd the edges. I will display every other number or just the min/max/mid if it gets too crowded, though 10 digits usually fit on mobile width if font is small.
*   **Action: `Recompose (Remove)` (Axis Lines/Gridlines)**
    *   **Why**: The grid structure of the bubbles implies the grid. Heavy gridlines add visual noise. We will use very subtle gridlines or remove them entirely, relying on the alignment of the bubbles.

#### **L4 Interaction & Feedback**
*   **Action: `Recompose (Replace)` (Trigger: Hover -> Click)**
    *   **Why**: Mobile users cannot hover. Tapping a bubble (or the grid cell area) will trigger the feedback.
*   **Action: `Reposition (Fix)` (Tooltip)**
    *   **Why**: Instead of a floating tooltip that might appear under a finger, clicking a bubble will update a **fixed info panel** at the top or bottom of the card, or open a Drawer containing the summary of that bin (e.g., "75 Movies rated 7-8 IMDB & 70-80% RT").

#### **L3 Legend**
*   **Action: `Reposition` & `Simplify`**
    *   **Why**: A size legend takes up space. I will place a simplified "Size = Movie Count" indicator in the header or footer of the component, rather than a bulky side legend.

---

## 3. Data Extraction & Processing

The original file uses Vega-Lite which processes data at runtime. We cannot "extract" coordinates from the HTML source text. We must **fetch and process the raw data**.

**Steps to Codify Data:**
1.  **Fetch Data**: `fetch('https://vega.github.io/editor/data/movies.json')`
2.  **Clean Data**: Filter out entries where `IMDB Rating` or `Rotten Tomatoes Rating` is null.
3.  **Binning Algorithm**:
    *   **IMDB (X)**: Range 0-10. `maxbins: 10` implies a bin step of 1.
        *   Formula: `binX = Math.floor(movie.IMDB_Rating)`
    *   **Rotten Tomatoes (Y)**: Range 0-100. `maxbins: 10` implies a bin step of 10.
        *   Formula: `binY = Math.floor(movie.Rotten_Tomatoes_Rating / 10) * 10`
4.  **Aggregation**:
    *   Create a map/dictionary key: `${binX}-${binY}`.
    *   Iterate through all movies, incrementing the count for each key.
5.  **Formatting for Recharts**:
    *   Convert the map back to an array:
        ```javascript
        [
          { x: 2.5, y: 25, r: 10, count: 5, xRange: "2-3", yRange: "20-30" },
          // Use center of bin for x/y coordinates in ScatterPlot
          ...
        ]
        ```

---

## 4. Implementation Steps

### **Component Structure**
*   **`Visualization.tsx`**: The main container.
    *   **State**: `data` (processed), `selectedBin` (for interaction), `isLoading`.
    *   **Header**: Title ("Ratings Correlation") and Subtitle ("IMDB vs Rotten Tomatoes").
    *   **ChartContainer**: A square `div` containing the Recharts instance.
    *   **InfoPanel**: A glassmorphic overlay or section below the chart displaying details of the selected bin.

### **Tech Specs**
*   **Library**: `recharts` -> `ScatterChart`.
*   **X-Axis**: Type `number`, domain `[0, 10]`, ticks `[0, 2, 4, 6, 8, 10]`.
*   **Y-Axis**: Type `number`, domain `[0, 100]`, ticks `[0, 20, 40, 60, 80, 100]`.
*   **Z-Axis (Size)**: Range `[50, 400]` (pixel area) mapped to `count`.
*   **Styling**:
    *   Background: Dark gradient (Deep Blue/Purple) to make bubbles glow.
    *   Bubbles: Cyan/Teal with opacity to show density/overlap slightly, though they are binned so they won't overlap much.
    *   Font: Inter/Sans-serif, small sizes (10px-12px) for axis labels.

### **Detailed Actions (Implementation View)**

1.  **Setup**: Initialize ScatterChart with `responsiveContainer` (width 100%, aspect 1).
2.  **Data Processing Hook**: `useEffect` to load JSON, perform the binning logic described in Section 3, and set state.
3.  **Axis Configuration**:
    *   `XAxis`: `dataKey="x"`, `type="number"`, `domain={[0, 10]}`, `hide` axis line (L4 Action), keep ticks.
    *   `YAxis`: `dataKey="y"`, `type="number"`, `domain={[0, 100]}`, `hide` axis line.
4.  **Interaction**:
    *   `Scatter`: `onClick={(data) => setSelectedBin(data)}`.
    *   `Cursor`: Custom cursor or active shape to highlight selected bin.
5.  **Aesthetics**:
    *   Apply a `fill` with a gradient or transparency.
    *   Add a custom `Tooltip` that is manually controlled by the `selectedBin` state (appearing at the bottom of the card) rather than the default floating tooltip.

This plan ensures the visualization is readable (square layout), interactive (touch-friendly), and accurate (real data processing) while maintaining a premium mobile aesthetic.