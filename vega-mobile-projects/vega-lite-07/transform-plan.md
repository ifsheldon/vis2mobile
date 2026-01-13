# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization
*   **Source**: A Vega-Lite chart showing a **Layered Cumulative Histogram**.
*   **Data**: Movie dataset (IMDB Ratings).
*   **Desktop View**:
    *   **X-Axis**: IMDB Rating (Binned).
    *   **Layer 1 (Background)**: Bar chart representing the **Cumulative Count** (total movies up to that rating).
    *   **Layer 2 (Foreground)**: Yellow Bar chart representing the **Count** (frequency) of movies in that specific rating bin.
*   **Mobile Issues (Desktop aspect ratio on mobile)**:
    *   **Crowding**: X-axis labels (ratings) are small and hard to read.
    *   **Visual Overlap**: The yellow transparency over the blue bars might become muddy on smaller, lower-contrast screens.
    *   **Interaction**: Hover-based tooltips in Vega-Lite are unusable on touch devices (fat-finger problem).
    *   **Height**: The default aspect ratio is too wide; mobile users prefer a squarer or taller aspect ratio to utilize vertical scroll.

## 2. Vis2Mobile Design Action Space Plan

To transform this into a premium mobile component, I will apply the following actions from the design space:

### **L0 Visualization Container**
*   **Action: `Rescale`**: Set width to `100%` and allow height to be defined by a mobile-friendly aspect ratio (e.g., 1:1 or 4:5) rather than the wide desktop ratio.
*   **Action: `Reposition`**: Adjust global padding to ensure the chart sits comfortably within a mobile card container ("Glassmorphic" card).

### **L1 Data Model**
*   **Action: `Recompose (Aggregate)`**: The raw data (individual movies) needs to be processed on the client or server side to replicate the Vega `bin` -> `aggregate (count)` -> `window (cumulative sum)` transformation.
    *   *Reason*: We cannot use the raw JSON directly in Recharts without preprocessing.

### **L2 Coordinate System**
*   **Action: `Transpose` (Rejected)**: While transposing to horizontal bars is often good for mobile, histograms representing a distribution (Rating 0-10) are conventionally read left-to-right. We will keep the **Vertical Layout** but optimize the axes.

### **L3 Axes & Ticks**
*   **Action: `Decimate Ticks` (L5)**: On the X-Axis (IMDB Rating), we will not show every single bin label. We will reduce ticks to integers (e.g., 2, 4, 6, 8, 10) to prevent `Cluttered text`.
*   **Action: `Recompose (Remove)` (L4)**: Remove the Y-axis line and ticks entirely.
    *   *Reason*: Exact values on the Y-axis are hard to read on mobile. We will rely on **Gridlines** (subtle) and **Interactive Feedback** (Tooltip/Card) to show values.

### **L2 Data Marks (The Layered Bars)**
*   **Action: `Rescale` (L4)**: The desktop view has thin bars. On mobile, we will make bars wider to utilize available width.
*   **Action: `Recompose (Change Encoding)` (L2)**:
    *   Instead of two overlapping bars which can be visually heavy, I will use a **Composed Chart**:
        1.  **Cumulative Count**: Rendered as a **Stepped Area** or a Faint/Glassy Bar in the background. This implies "Total volume".
        2.  **Frequency Count**: Rendered as a solid, vibrant Bar in the foreground.
    *   *Justification*: This creates a clearer visual hierarchy. The "Count" is the immediate data, "Cumulative" is the context.

### **L3 Legend**
*   **Action: `Reposition`**: Move legend items to the top of the card (Header) or integrate them into the interaction state.
*   **Action: `Compensate (Toggle)`**: Provide a segmented control (toggle) to switch the view between "Combined", "Just Count", or "Just Cumulative" if the screen is too small, though I plan to make the "Combined" view work via smart opacity handling.

### **L5 Interaction & Feedback**
*   **Action: `Reposition (Fix)`**: Instead of a floating tooltip that follows the finger (which obscures data), I will use a **Fixed Legend/Tooltip Header**. When a user touches the chart, the values for that specific bin will display prominently at the top of the component.
*   **Action: `Recompose (Replace)`**: Replace `Hover` triggers with `Touch/Click` active states. Use a `Cursor` (vertical line) to indicate the active bin.

## 3. Data Extraction & Processing Strategy

Since we need **Real Data**, I will perform the following steps in the implementation:

1.  **Fetch**: Retrieve `https://vega.github.io/editor/data/movies.json` (as referenced in the spec).
2.  **Process (Transform)**:
    *   Filter out `null` IMDB Ratings.
    *   **Binning**: Round ratings to the nearest `0.5` or `1.0`. (Looking at the source image, the bins seem to be around 0.5-1.0 width. I will use 0.5 for granularity).
    *   **Aggregation**: Count occurrences per bin.
    *   **Cumulative**: Sort bins ascending, then iterate to calculate `cumulative_count` (running total).
3.  **Resulting Structure**:
    ```typescript
    interface ChartData {
      bin: number;       // e.g., 6.5
      binDisplay: string; // e.g., "6.5-7.0"
      count: number;     // e.g., 150
      cumulative: number;// e.g., 1200
    }
    ```

## 4. Implementation Steps

### Step 1: Data Utility (`utils/processData.ts`)
*   Create a function to fetch the movies JSON.
*   Implement the binning and cumulative logic using standard array methods (`reduce`, `sort`, `map`).
*   Return clean data ready for Recharts.

### Step 2: Component Structure (`src/components/Visualization.tsx`)
*   **Container**: A `div` with `w-full`, rounded corners, `backdrop-blur` (glassmorphism), and a dark gradient background.
*   **Header**: Title ("IMDB Rating Distribution") and a dynamic area that shows the "Total Movies" or the specific values when a bar is touched.
*   **Chart Area**:
    *   `ResponsiveContainer` from Recharts.
    *   `ComposedChart` with `XAxis` (Ratings) and hidden `YAxis`.
    *   `Tooltip` (Custom, `cursor={{fill: 'transparent'}}`, using `active` state to update the Header instead of rendering a popup).
    *   `Bar` for "Count" (Vibrant Color, e.g., Neon Amber).
    *   `Area` or `Bar` for "Cumulative" (Subtle Color, e.g., White/Blue with low opacity).

### Step 3: Styling (Tailwind)
*   Use a "Dark Mode" aesthetic for premium feel.
*   Colors:
    *   Background: Deep Slate/Black gradient.
    *   Count Bar: `amber-400` or `yellow-400` (referencing original yellow).
    *   Cumulative: `blue-500/20` (glassy blue).
*   Typography: Sans-serif, legible sizes (minimum 12px for axes).

### Step 4: Refinement
*   Ensure the `XAxis` ticks are decimated (show only integers) to avoid overlap.
*   Add a "Reset" interaction (clicking outside clears the selection).

This plan ensures all information from the desktop version (Distribution + Cumulative trend) is preserved but reformatted for the constraints and ergonomic needs of a mobile device.