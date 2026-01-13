# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization
*   **Source:** Vega-Lite Heatmap (Binned Scatterplot).
*   **Data Content:** Correlation between "IMDB Rating" (X-axis) and "Rotten Tomatoes Rating" (Y-axis) for a Movies dataset.
*   **Visual Encoding:**
    *   **Mark:** Rectangles (Heatmap cells).
    *   **X:** Quantitative (Binned), Range ~1.6 - 9.0.
    *   **Y:** Quantitative (Binned), Range 0 - 100.
    *   **Color:** Count of records (Density), Scale: Light Yellow to Dark Blue.
*   **Desktop Issues on Mobile:**
    *   **Touch Targets:** The grid is approximately 60x40. On a mobile screen, individual cells would be ~5-8 pixels wide, making them impossible to tap individually.
    *   **Layout:** The wide aspect ratio squashes the Y-axis range.
    *   **Legibility:** Axis labels and the legend title "Count of Records" become unreadable when scaled down.
    *   **Space:** The legend on the right consumes valuable horizontal width (`~15-20%`), compressing the chart further.

## 2. High-Level Design & Action Plan

### **L0: Visualization Container**
*   **Action: `Rescale` (Aspect Ratio)**
    *   *Reason:* The desktop version is wide. On mobile, vertical space is cheap, but horizontal space is expensive.
    *   *Plan:* Change the aspect ratio from Landscape to **Square (1:1)** or slightly Portrait (4:5). This gives the Y-axis (Rotten Tomatoes 0-100) enough height to be granular and legible.
*   **Action: `Reposition` (Padding)**
    *   *Reason:* Maximize screen width usage.
    *   *Plan:* Remove default heavy margins. Use a "Card" layout with `w-full`.

### **L1: Data Model**
*   **Action: `Recompose` (Binning Logic)**
    *   *Reason:* Recharts does not natively support Vega-Lite's auto-binning.
    *   *Plan:* We must implement a data processing function to bucket the raw Movie data into the X/Y grid (IMDB bins vs RT bins) and calculate counts. We will use the raw data from the JSON source.

### **L2: Coordinate System**
*   **Action: `Transpose` (Legend Position)**
    *   *Reason:* The right-side legend compresses the chart width (Design Action Space: L3 Legend Block).
    *   *Plan:* Move the Legend to the **Top** (Header) or **Bottom**. A horizontal gradient bar is more space-efficient than a vertical list.

### **L3: Axes & Ticks**
*   **Action: `Decimate Ticks` (X & Y Axes)**
    *   *Reason:* To prevent "Cluttered text".
    *   *Plan:*
        *   **X-Axis:** Show fewer ticks (e.g., every 1.0 or 2.0 units instead of every 0.8).
        *   **Y-Axis:** Show ticks every 20 units (0, 20, 40... 100).
*   **Action: `Recompose (Remove)` (Gridlines)**
    *   *Reason:* In a dense heatmap, gridlines create visual noise. The cells themselves form the grid.
    *   *Plan:* Remove chart gridlines (`cartesianGrid`).

### **L5: Interaction & Feedback (Critical for Mobile)**
*   **Action: `Reposition (Fix)` (Tooltip)**
    *   *Reason:* Tooltips following the finger are blocked by the hand (The "Fat-finger problem").
    *   *Plan:* Use a **Fixed Feedback Area**. When a user touches or drags across the heatmap, display the specific bin details (IMDB Range, RT Range, Count) in a fixed panel above the chart or at the very bottom.
*   **Action: `Recompose (Replace)` (Trigger)**
    *   *Reason:* Desktop relies on hover.
    *   *Plan:* Implement a **Touch/Drag Focus**. Since individual cells are too small to tap reliably, we will use a "Cursor/Crosshair" interaction. As the user slides their finger, the nearest cell is highlighted, and the Fixed Feedback Area updates.

## 3. Data Extraction Strategy
We will not fake data. We will fetch and process the real `movies.json` provided in the source URL.

1.  **Source:** `https://vega.github.io/editor/data/movies.json`
2.  **Processing Logic (Client-side):**
    *   Filter entries where `IMDB Rating` and `Rotten Tomatoes Rating` are not null.
    *   Define Bin Size:
        *   IMDB (X): Range roughly 1-10. Bin step ~0.2 or 0.5 (to match the visual density of ~40-60 bins).
        *   RT (Y): Range 0-100. Bin step 5 or 2.5.
    *   **Aggregation:** Iterate through valid records, calculate which bin `(x, y)` they fall into, and increment a `count` map.
    *   **Normalization:** Convert the map into an array of objects `[{ x: 3.5, y: 60, count: 12, fill: color }]` for Recharts.

## 4. Implementation Details

### **Component Structure**
*   **`MovieHeatmapCard`**: Main container with Glassmorphism effect (blur background, delicate border).
*   **`Header`**: Contains Title ("IMDB vs Rotten Tomatoes") and the Color Legend (Gradient Bar).
*   **`ChartArea`**:
    *   Library: `recharts` -> `ScatterChart`.
    *   Why Scatter? Recharts doesn't have a grid heatmap. We will simulate it using `Scatter` points with a custom shape (`<Rectangle />`) that matches the bin size.
    *   **XAxis/YAxis**: Styled with Lucide styling (minimalist).
*   **`InteractionLayer`**: A custom transparent overlay or Recharts' `onMouseMove`/`onTouchMove` to capture coordinates and snap to the nearest bin.
*   **`InfoPanel`**: A fixed component at the bottom displaying the active bin's stats.

### **Styling (Premium/Mobile-First)**
*   **Palette:** Use the original Yellow-Green-Blue scale but refined for dark/light mode contrast.
    *   Example: `scaleLinear().domain([0, maxCount]).range(["#f7feae", "#0c2c84"])`.
*   **Typography:** Tailwind `text-sm` for axes, `text-lg` for headers.
*   **Animation:** Smooth transitions on load.

### **Readability Check**
*   **Font Size:** Axis labels set to minimum 12px equivalent.
*   **Contrast:** Ensure the lightest yellow is visible against the background, or add a slight border to cells.
*   **Data Density:** By using the "Touch/Drag" interaction with a fixed readout, we solve the issue of cells being too small to see/tap individually. The user scans with their finger, and the UI tells them the value.

## 5. Summary of Differences
| Feature | Desktop (Original) | Mobile (Plan) |
| :--- | :--- | :--- |
| **Aspect Ratio** | Landscape (Wide) | Square / Portrait |
| **Legend** | Right sidebar | Top Gradient Bar |
| **Interaction** | Hover for Tooltip | Touch/Drag with Fixed Detail Panel |
| **Axis Ticks** | Dense | Decimated (Sparse) |
| **Binning** | Auto (Vega) | Calculated (Custom JS) |
| **Gridlines** | Visible? | Removed (Cleaner) |