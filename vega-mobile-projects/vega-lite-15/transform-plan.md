# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization
The original visualization is a **Multi-series Line Chart** displaying stock prices for five major tech companies (AAPL, AMZN, GOOG, IBM, MSFT) over time (roughly 2000-2010).

**Desktop Characteristics:**
- **Layout**: Wide landscape aspect ratio.
- **Density**: 5 intersecting lines.
- **Styling**: Uses a "Halo" effect (white stroke behind colored lines) to distinguish overlapping lines.
- **Axes**: X-axis is temporal (dates), Y-axis is quantitative (price).
- **Legend**: Implicit (mapped to color), but the source code implies a legend is necessary to identify which color corresponds to which stock.

**Mobile Challenges (as seen in `desktop_on_mobile.png`):**
- **Overplotting**: With 5 lines confined to a narrow width, the lines will overlap significantly, making it impossible to trace a single stock's trajectory.
- **Label Crowding**: X-axis date labels will overlap or become illegible if simply shrunk.
- **Interaction**: The "Halo" effect is a static solution for separation. On mobile, we lack hover capabilities to inspect individual points, and fingers obscure the view.

## 2. Design Action Space & Transformation Strategy

I will apply the following actions from the `mobile-vis-design-action-space.md` to transform this into a premium mobile component.

### L0: Visualization Container
*   **Action: `Rescale`**: Change the aspect ratio from landscape (~16:9) to a taller format (e.g., 1:1 or 4:3) or a full-width card. This allows more vertical resolution for the price fluctuations.
*   **Action: `Reposition`**: Remove default Vega padding. The chart will span 100% of the card width.

### L1: Interaction Layer
*   **Action: `Recompose (Features) - Toggle Series`**: Instead of showing all 5 lines at full opacity constantly (which creates a "spaghetti chart" on mobile), I will implement **interactive filtering**. Users can toggle stocks on/off via chip buttons, or tapping a line/legend highlights it while dimming others.
*   **Action: `Feedback - Fix Tooltip Position`**: Instead of a floating tooltip that appears under the finger, I will use a **synchronized crosshair** with a **fixed readout header**. As the user drags across the chart, the values update in a fixed area above the chart (the "Externalize" strategy).

### L3: Axes (Coordinate System)
*   **Action: `Axis - Recompose (Remove Title)`**: Remove the "Price" Y-axis label and "Date" X-axis label to save space. The context will be provided by the main component title and subtitle.
*   **Action: `Ticks - Decimate`**: Drastically reduce X-axis ticks. Instead of showing every year, show only start, middle, and end, or 3-4 key intervals.
*   **Action: `Ticks - Format`**: Simplify date labels (e.g., "2000" instead of "Jan 1, 2000") and Price labels (e.g., "100" instead of "100.0").

### L2: Data Marks (The Lines)
*   **Action: `Emphases - Focus Mode`**: To replace the desktop "Halo" effect, I will use active state styling. When a specific stock is selected (or when dragging the crosshair), the active line becomes thicker and vibrant, while others become semi-transparent gray.
*   **Action: `Rescale (Stroke Width)`**: Increase the stroke width of the lines slightly for better visibility on high-DPI mobile screens.

### L3: Legend
*   **Action: `Reposition (Externalize)`**: Move the legend from the chart area (or right side) to a scrollable horizontal list or a grid of "Chips" below the chart. These chips will double as the interaction triggers for filtering.

## 3. Data Extraction Strategy

The original source uses an external CSV: `https://vega.github.io/editor/data/stocks.csv`.
Since the requirement is to **Codify Data** and use **Real Data**, I cannot rely on a runtime `fetch` to an external URL (which might be slow or blocked).

**Plan:**
1.  I will download/parse the CSV data for the 5 symbols (AAPL, AMZN, GOOG, IBM, MSFT).
2.  I will simplify the dataset to reduce bundle size while maintaining the curve shape (e.g., sampling 1 point per week instead of every day if the dataset is massive, though this specific dataset is likely small enough to keep fully).
3.  I will convert this data into a hardcoded JSON object or array within the component file (e.g., `const stockData = [...]`).
4.  Data structure will be normalized for Recharts:
    ```typescript
    // Transformation Target
    type DataPoint = {
      date: string; // ISO format
      AAPL?: number;
      AMZN?: number;
      GOOG?: number;
      IBM?: number;
      MSFT?: number;
    }
    ```

## 4. Implementation Steps

### Step 1: Setup & Data Preparation
- Extract the raw data from the Vega source URL.
- Create a `data` constant in the component containing the time-series data.
- Create a color palette map corresponding to the companies (using brand colors or a vibrant, distinct palette).

### Step 2: Container & Layout (Next.js/Tailwind)
- Create a main Card component with a "Glassmorphism" effect (backdrop-blur, semi-transparent background).
- Implement a Header section:
    - **Title**: "Tech Giants Tracker"
    - **Subtitle**: Dynamic text that changes based on user interaction (e.g., showing the date and values of the crosshair position).

### Step 3: The Chart (Recharts)
- Use `ResponsiveContainer` with a set height (e.g., `h-72`).
- Implement `LineChart` with `XAxis` (simplified dates) and `YAxis` (minimalist, no lines).
- Add `Tooltip` with `content={<CustomTooltip />}` but actually rely on the `onMouseMove` / `onTouchMove` state to update the Header readout (The "Fixed Tooltip" strategy).
- Render `Line` components dynamically.

### Step 4: Interactive Legend (The Controls)
- Create a section below the chart with toggleable "Chips" for each stock symbol.
- **State Management**:
    - `activeSeries`: Array of strings (symbols) that are currently visible.
    - `focusSeries`: String | null (the one currently being hovered/touched).
- **Interaction Logic**:
    - Clicking a chip toggles visibility.
    - Long-pressing a chip enters "Solo Mode" (hides others).

### Step 5: Refinement (UX & Aesthetics)
- **Typography**: Use standard mobile font sizes (14px/16px) for readability.
- **Animation**: Add transition durations to the lines so they fade in/out smoothly when toggled.
- **Grid**: Use minimal dotted grid lines or remove them entirely to reduce visual noise.

This plan ensures the density of 5 stock lines is manageable on a mobile screen through **interaction** (filtering) and **layout adaptation** (vertical expansion and externalized legends), satisfying the readability constraint.