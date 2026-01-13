# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Description
The original visualization is a **Time-Series Area Chart** defined in Vega-Lite.
- **Data**: Unemployment statistics across industries (sourced from `vega-datasets`).
- **Visual Encoding**:
    - **X-Axis**: Date (Year-Month).
    - **Y-Axis**: Aggregate Sum of Unemployment Count.
    - **Mark**: Area (`goldenrod` color).
    - **Layers**: Two layers are defined. One with 0.3 opacity (background) and one fully opaque (foreground).
- **Interaction**: A "Brush" interval selection (`select: interval`). When the user drags across the chart, the selected area remains opaque, while the unselected area fades, effectively highlighting a specific time range.

### Mobile Challenges (Desktop vs. Mobile)
- **Aspect Ratio**: The desktop version is wide, allowing the long time series (spanning ~10 years) to breathe. On mobile (portrait), this will be severely compressed.
- **Interaction**: The "Brush/Interval Select" interaction (click and drag a box) is poor on mobile devices due to conflict with vertical scrolling and "fat finger" issues.
- **Readability**: 
    - X-axis labels (Dates) will overlap if not decimated/rotated.
    - Y-axis labels take up valuable horizontal screen real estate.
    - Tooltips that follow the cursor will be obstructed by the user's finger.

## 2. Design Action Plan

Based on the **Vis2Mobile Design Action Space**, I plan to take the following actions to transform this into a premium mobile component.

### **L0: Visualization Container**
*   **Action: `Rescale` (Viewport)**
    *   **Reasoning**: The fixed width of the desktop site (800px) must be converted to `width: 100%` with a fixed height (e.g., 300px-400px) to fit mobile screens.
*   **Action: `Reposition` (Margins)**
    *   **Reasoning**: Remove default body padding and maximize chart width. We will push labels inside or minimize margins to prevent "wasted whitespace".

### **L1: Data Model**
*   **Action: `Recompose (Aggregate)`**
    *   **Reasoning**: The raw data contains unemployment by industry. The Vega spec performs a `sum` aggregation on the fly. We must perform this aggregation in JavaScript *before* passing data to Recharts to ensure performance and correct rendering.

### **L1: Interaction Layer**
*   **Action: `Recompose (Replace)` (Trigger)**
    *   **Reasoning**: The "Brush interval" interaction is not native to mobile usage flows for simple trend viewing. I will replace the **Brush** interaction with a **Touch/Scrub** interaction. Users can drag their finger across the chart to read specific values.
*   **Action: `Disable Hover`**
    *   **Reasoning**: Hover states don't exist on touch screens. Active states will be triggered by touch.

### **L2: Features / Feedback**
*   **Action: `Reposition (Fix)` (Tooltip)**
    *   **Reasoning**: Instead of a floating tooltip next to the cursor (which gets blocked by the finger), I will use a **Fixed Legend/Info Block** at the top of the card that dynamically updates as the user scrubs the chart. This ensures the data is always readable.

### **L3: Coordinate System (Axes)**
*   **Action: `Recompose (Remove)` (Gridlines)**
    *   **Reasoning**: To create a "Premium" and clean aesthetic, I will remove standard gridlines and axis lines (`Axis Line`), relying on the area shape and a minimal number of ticks for context.
*   **Action: `Decimate Ticks` (X-Axis)**
    *   **Reasoning**: The dataset spans many years. I will reduce the tick count (e.g., show only every 2 years or 5 ticks max) to prevent overlapping text.
*   **Action: `Format Tick Label`**
    *   **Reasoning**: 
        - X-Axis: "2005", "2010" (Short format).
        - Y-Axis: Convert raw numbers (e.g., 5,000,000) to readable notation (e.g., "5M") to save horizontal space.

### **L2: Data Marks (Area)**
*   **Action: `Rescale` / Aesthetic Upgrade**
    *   **Reasoning**: The original uses a flat `goldenrod` color. For the "Premium" look, I will use a `<defs>` linear gradient in SVG. The top of the area will be the solid `goldenrod` color, fading to transparent at the bottom. This adds depth and modernity (Glassmorphism style).

## 3. Data Extraction Plan

Since I cannot run the Vega-Lite runtime environment, I must emulate the data processing described in the spec.

1.  **Source URL**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment-across-industries.json`
2.  **Schema Analysis**:
    The JSON structure is likely an array of objects:
    ```json
    [
      {"series": "Agriculture", "year": 2000, "month": 1, "count": 100, ...},
      ...
    ]
    ```
    *Note: The Vega spec uses a `date` field. The raw JSON might separate year/month or have a date string. I need to inspect and parse it.*
3.  **Processing Logic (Codification)**:
    - **Fetch** the JSON.
    - **Group By** Date (Year-Month).
    - **Aggregate**: Sum the `count` field for all entries sharing the same Year-Month.
    - **Sort**: Ensure the array is sorted chronologically.
    - **Output**: An array compatible with Recharts:
      ```typescript
      type ChartData = {
          date: string; // ISO or timestamp
          displayDate: string; // "Jan 2000"
          count: number; // Total unemployment
      }[];
      ```

## 4. Implementation Steps

1.  **Setup Component Structure**: Create `UnemploymentAreaChart.tsx` with a responsive wrapper.
2.  **Data Fetching Hook**: Implement a `useEffect` to fetch the data from the CDN, aggregate it by date, and store it in state.
3.  **Layout**:
    - Create a Card container with a slight glassmorphism effect (backdrop-blur, semi-transparent background).
    - Add a Header section for the Title ("Unemployment Trends") and the Dynamic Data Display (the "Fixed Tooltip").
4.  **Chart Configuration (Recharts)**:
    - Use `<AreaChart>` and `<Area>`.
    - Define `<linearGradient>` in `<defs>` for the Goldenrod fade effect.
    - Configure `<XAxis>` with `tickFormatter` (years only) and `minTickGap`.
    - Configure `<YAxis>` with `tickFormatter` (millions shorthand) and `width={40}`.
    - Use `<Tooltip>` with a custom `content` render function that triggers the Dynamic Data Display update, but returns `null` to render nothing near the cursor (or render a simple vertical cursor line).
5.  **Refinement**:
    - Add loading skeletons.
    - Ensure typography uses Tailwind's readable defaults (e.g., `text-sm`, `text-muted-foreground`).
    - Verify touch responsiveness (remove default browser touch actions on the chart area if necessary).

## 5. Justification for Deviation (if any)
*   **Interaction**: I am deviating from the "Brush" interaction (highlight range) to a "Scrub" interaction (view specific point).
    *   *Justification*: The "Brush" is a desktop-centric pattern used for filtering cross-views or zooming. On a standalone mobile chart, "Scrubbing" provides better immediate information retrieval without the complex gesture overhead of defining a start and end point with a finger. The "Premium" mobile experience prioritizes fluidity over complex tool manipulation.