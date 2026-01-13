# Mobile Visualization Plan

## 1. Analysis of Original Visualization

### Desktop Version Characteristics
*   **Visual Type**: Time-series Area Chart.
*   **Data Source**: Unemployment count over time (monthly), aggregated (summed) across all industries.
*   **X-Axis**: Temporal (Year-Month), ranging from approx. Jan 2000 to Jan 2010.
*   **Y-Axis**: Quantitative (Sum of count), range 0 to ~16,000.
*   **Visual Encodings**:
    *   **Mark**: Area.
    *   **Color**: "Goldenrod" (Yellow-Orange).
    *   **Opacity**: Layered opacity (likely for highlighting/brushing interaction in the original Vega spec).
*   **Interaction**: The original spec includes a `param` for interval selection (brushing) to filter/highlight time ranges.
*   **Gridlines**: Full grid (vertical and horizontal).
*   **Labels**: Standard axis titles ("date (year-month)", "Sum of count") and tick labels.

### Issues on Mobile (Desktop_on_Mobile)
*   **Aspect Ratio**: The vertical orientation compresses the X-axis time series, making trends steeper and harder to read.
*   **Touch Targets**: The "Brushing/Interval Selection" feature from the desktop spec is extremely difficult to use on a small touch screen (Fat-finger problem).
*   **Label Readability**: Axis titles ("date (year-month)") are redundant and occupy valuable vertical space. Tick labels might overlap if not decimated.
*   **Data Density**: 10 years of monthly data compressed into a mobile width can result in "Overplotting" or jagged lines that obscure the trend.
*   **Tooltip**: Standard hovering tooltips block the finger and the data being viewed.

## 2. Vis2Mobile Design Plan

I propose transforming this into a **"Finance-Style" Interactive Area Chart**. This style is common in mobile banking/stock apps (e.g., Robinhood) because it handles time-series data elegantly on narrow screens.

### Design Actions & Reasoning

#### L0: Visualization Container
*   **Action**: `Rescale` (Fit to Width)
    *   **Reasoning**: Use `width: 100%` and a fixed height (e.g., `h-64` or `h-80`) to maximize the usage of the narrow mobile screen width.
*   **Action**: `Reposition` (Margins)
    *   **Reasoning**: Remove default Recharts margins/padding to allow the area chart to "bleed" to the edges or fill the container smoothly, maximizing data-ink ratio.

#### L1: Interaction Layer & L2: Features
*   **Action**: `Recompose (Replace)` (Trigger: Hover → Touch/Drag)
    *   **Reasoning**: Replace the desktop "Interval Selection" (Brushing) with a **"Touch Scrubbing"** interaction. Users drag their finger across the chart area to activate a specific time point.
*   **Action**: `Recompose (Replace)` (Filter Mechanism)
    *   **Reasoning**: Since precise brushing is hard, I will add **Time Range Tabs** (e.g., "All", "5Y", "1Y") above the chart. This filters the `DataModel` to zoom in on specific periods, solving the data density issue.

#### L2: Feedback (Tooltips)
*   **Action**: `Reposition (Fix)` (Tooltip Position)
    *   **Reasoning**: Instead of a floating tooltip near the finger, I will implement a **Header Summary Card**. When the user touches/scrubs the chart, the Title (Total Count) and Date in the header update dynamically. This avoids occlusion.

#### L3: Axes & Gridlines
*   **Action**: `Recompose (Remove)` (Axis Titles)
    *   **Reasoning**: "date (year-month)" and "Sum of count" are obvious from context and the header. Removing them saves L0 vertical space.
*   **Action**: `Recompose (Remove)` (Vertical Gridlines)
    *   **Reasoning**: Vertical lines add noise on a narrow screen. I will keep minimal Horizontal Gridlines for value estimation.
*   **Action**: `Recompose (Remove)` (Axis Lines)
    *   **Reasoning**: Remove the hard axis lines (`stroke: none`) for a cleaner, modern look.

#### L4 & L5: Ticks & Labels
*   **Action**: `Decimate Ticks` (X-Axis)
    *   **Reasoning**: Limit `tickCount` to 3 or 4.
*   **Action**: `Simplify Label` (Formatting)
    *   **Reasoning**:
        *   **X-Axis**: Convert "January 2000" → "2000" or "'00".
        *   **Y-Axis**: Convert "16,000" → "16k" (`abbreviateText`).

#### L2: Data Marks (Aesthetics)
*   **Action**: `Rescale` (Encoding)
    *   **Reasoning**: Use a **Gradient Fill** (Goldenrod to transparent) instead of a flat color. This adds depth and looks "Premium" (Glassmorphism style).
*   **Action**: `Recompose (Change Encoding)` (Focus)
    *   **Reasoning**: When "Scrubbing", display a vertical cursor line (Action: `Focus Mode`) and a dot on the active data point to guide the eye.

## 3. Data Extraction Strategy

The original HTML sources data from a URL. I will fetch and process this real data.

1.  **Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/unemployment-across-industries.json`
2.  **Schema Analysis**: The raw data contains fields: `series` (industry), `year`, `month`, `count`, `date`.
3.  **Aggregation Logic**:
    *   The raw data is granular (per industry).
    *   The Desktop Spec uses `aggregate: "sum", field: "count"`.
    *   **Extraction Step**: I must group the raw data by `date` and sum the `count` values to create a single array of objects: `{ date: string, count: number }`.
4.  **Formatting**: Convert `date` strings into JS Date objects or timestamps for Recharts to handle time-scales correctly.

## 4. Implementation Plan

### Step 1: Data Utility
*   Create a function to fetch the JSON.
*   Implement `processData`: Group by Year-Month, Sum Counts.
*   Sort by date ascending.

### Step 2: Component Structure
*   **Header**:
    *   **Main Display**: Large text showing the "Current Value" (defaults to latest, updates on scrub).
    *   **Sub-text**: "Current Date" (defaults to range end, updates on scrub).
*   **Controls**: Segmented Control (Tabs) for Time Range (All, 5Y, 1Y).
*   **Chart Container**:
    *   Recharts `ResponsiveContainer`.
    *   `AreaChart` with gradient definition.
    *   `XAxis` (Time scale).
    *   `YAxis` (Numeric, Right-aligned or hidden if header is sufficient, but I will keep right-aligned small ticks).
    *   `Tooltip` (custom, invisible trigger for state updates).

### Step 3: Styling (Tailwind)
*   Use a `amber-500` (closest to Goldenrod) color palette.
*   Background: Mild gradient or solid dark/light mode compatible card with shadow (`glassmorphism`).
*   Typography: Sans-serif, variable weights (Bold for numbers, light for labels).

### Step 4: Interactivity
*   Use React `useState` to track `activeDataPoint`.
*   Pass `onMouseMove` / `onTouchMove` events from Recharts to update the Header state.
*   Use `activeDot` to highlight the specific month being viewed.

This plan ensures high readability on mobile by moving detailed information (tooltips/axis titles) out of the chart area into a dedicated header, while maintaining the fidelity of the original data trends.