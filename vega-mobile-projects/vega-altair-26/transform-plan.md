# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Source Analysis
*   **Type**: Focus + Context Area Chart (Time Series).
*   **Data**: S&P 500 stock prices (Date vs. Price).
*   **Structure**:
    *   **Top View (Focus)**: Detailed area chart showing a specific time range.
    *   **Bottom View (Context)**: Smaller area chart showing the entire dataset history.
    *   **Interaction**: A "Brush" / Interval selection on the bottom chart controls the X-axis domain of the top chart.
*   **Aesthetics**: Basic Vega-Lite default styles (standard blue, simple axes).

### Mobile Challenges (Desktop on Mobile)
*   **Fixed Dimensions**: The desktop spec uses `width: 600`, which causes horizontal scrolling or severe scaling issues on mobile.
*   **Touch Targets**: The "brush" handles on the context chart are likely too small for fingers (Fat-finger problem).
*   **Label Density**: X-axis dates on both charts will overlap or become unreadably small if simply shrunk.
*   **Vertical Space**: Stacking two charts with default padding wastes valuable mobile vertical screen real estate.
*   **Interaction**: Hover tooltips (default in desktop) do not work on touch devices.

## 2. Design Action Plan

Based on the `mobile-vis-design-action-space.md`, here is the transformation strategy:

### L0: Visualization Container
*   **Action: `Rescale` (Resize)**
    *   **Reasoning**: Change fixed pixel width to `width: 100%` and `height: 100%` (or a fixed aspect ratio like 3:4) to utilize the full mobile screen width.
*   **Action: `Reposition` (Padding)**
    *   **Reasoning**: Remove outer HTML body margins. Use a card-based layout with internal padding to frame the chart comfortably within a mobile view.

### L1: Chart Components & Layout
*   **Action: `Serialize Layout` (Vertical Stacking)**
    *   **Reasoning**: Maintain the "Focus (Top) + Context (Bottom)" layout but adjust the proportions. Give the main chart 75% of the height and the context brush 15%.
*   **Action: `Recompose` (Aggregated Data - Optional)**
    *   **Reasoning**: S&P 500 data is granular. If performance lags, we might sample data, but Recharts handles moderate datasets well. We will stick to the full dataset for precision but optimize rendering.

### L3: Axes (Coordinate System)
*   **Action: `Decimate Ticks` (X-Axis)**
    *   **Reasoning**: On the main chart, show fewer date labels (e.g., only 3-4 ticks).
*   **Action: `Simplify Label` (Formatting)**
    *   **Reasoning**: Convert "January 2008" to "Jan '08" or just the year to save horizontal space.
*   **Action: `Recompose (Remove)` (Y-Axis Lines)**
    *   **Reasoning**: Remove the vertical axis line on the Y-axis (`axisLine={false}`) and tick lines, keeping only the text for a cleaner, modern look.
*   **Action: `Recompose (Remove)` (Context Chart Axes)**
    *   **Reasoning**: The bottom context chart is for navigation, not reading values. Remove its Y-axis entirely. Keep minimal X-axis hints.

### L2: Interaction & Feedback
*   **Action: `Recompose (Replace)` (Triggers)**
    *   **Reasoning**: Replace `hover` triggers with a continuous `touch` / `drag` interaction.
*   **Action: `Fix Tooltip Position`**
    *   **Reasoning**: Instead of a floating tooltip that gets blocked by the finger, display the "Active Date" and "Active Price" in a fixed **Header Block** (L2 Title Block) above the chart. This is a standard mobile finance pattern (e.g., Robinhood, Apple Stocks).
*   **Action: `Rescale` (Brush Handle)**
    *   **Reasoning**: Increase the height/hit-area of the Brush selection handles to ensure they are touch-friendly (min 44px equivalent target).

### L2: Data Marks
*   **Action: `Rescale` (Stroke Width)**
    *   **Reasoning**: Use a slightly thicker stroke for the main line to improve visibility on high-DPI mobile screens.
*   **Action: `Emphases` (Gradients)**
    *   **Reasoning**: Use a vertical linear gradient fill (opacity fade) for the area chart to give it a "Premium" glassmorphic feel, rather than a solid flat color.

## 3. Data Extraction Strategy

The original HTML sources data from a URL: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/sp500.csv`.

1.  **Fetch**: The component will need a utility function to fetch and parse this CSV.
2.  **Parsing**: Since we are using standard JS/TS, we will need a simple CSV parser (or a lightweight split/map function if avoiding heavy libraries) to convert the CSV text into an array of objects: `{ date: string, price: number }`.
3.  **Validation**: Ensure the date strings are converted to JS `Date` objects or Unix timestamps for Recharts to handle the time scale correctly.

## 4. Implementation Steps

### Step 1: Setup & Data Fetching
*   Create `src/components/Visualization.tsx`.
*   Implement a `useEffect` hook to fetch the S&P 500 CSV data on mount.
*   Parse the CSV into a state variable `data`.
*   Implement a Loading state (skeleton or spinner) while data fetches.

### Step 2: Container & Layout Structure
*   Use a Flexbox column layout (`h-[500px]` or similar suitable mobile height).
*   **Header Section**: Create a distinct area for the Title ("S&P 500") and a dynamic "Price Display" that updates when the user interacts with the chart.
    *   *Default*: Show the latest price.
    *   *Interaction*: Show the price at the cursor position.

### Step 3: Main Area Chart (Focus View)
*   Use `<ResponsiveContainer>` with `<AreaChart>`.
*   Apply `<defs>` for a LinearGradient (color teal or blue, fading to transparent).
*   Configure XAxis with `tickFormatter` (short dates) and `minTickGap` to prevent overlap.
*   Configure YAxis to be on the right side (often easier for thumb reach on mobile) or mirror standard finance apps (left, simplified). Let's go **Right** side for Y-axis to avoid obscuring the most recent data (usually on the right).
*   Add `<Tooltip>` with `cursor={{ stroke: '...', strokeWidth: 1 }}` but set `content={<></>}` (empty) and use the `onMouseMove` callback to update the Header Section (Externalized Tooltip).

### Step 4: Brush/Context Chart
*   Below the main chart, add a second `<ResponsiveContainer>` (height ~60-80px).
*   Render a simplified `<AreaChart>` (same data) to serve as the context.
*   Add the Recharts `<Brush>` component.
    *   Style the Brush: Remove default grey background, use a border color that matches the theme.
    *   **Crucial**: Sync the Brush `startIndex` / `endIndex` or range with the Main Chart's domain. *Note: Recharts `<Brush>` automatically controls the parent chart if placed inside it. However, for a separate look, we might put the Brush in the main chart but position it at the bottom, or use a synchronized chart approach.*
    *   *Refined Approach*: Place the `<Brush>` inside the Main Chart component to ensure native linking, but style it to look like a separate mini-map at the bottom. This is the most robust way in Recharts.

### Step 5: Premium Styling
*   **Typography**: Use `tabular-nums` for prices to prevent jitter during interaction.
*   **Colors**: Use a vibrant primary color (e.g., `emerald-500` or `blue-500`) against a clean white or slight off-white background.
*   **Animation**: Enable `isAnimationActive` for initial load "wow" factor.

### Step 6: Review against Mobile Constraints
*   Check if text overlaps.
*   Check if touch area for the brush is sufficient.
*   Ensure no horizontal scrollbar on the page body.