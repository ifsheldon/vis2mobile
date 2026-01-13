# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version
- **Type**: Composite View (Focus + Context).
- **Structure**:
  - **Top Chart (Focus)**: An Area Chart showing S&P 500 prices over a specific time range.
  - **Bottom Chart (Context)**: A smaller Area Chart showing the full history (2000-2010) with a "Brush" interaction (a gray sliding window) to control the top chart's X-axis domain.
- **Data**: Time-series data (Date vs. Price).
- **Visual Encodings**:
  - X-axis: Temporal (Date).
  - Y-axis: Quantitative (Price).
  - Mark: Area (filled blue).
- **Interaction**: Brushing and linking. Moving the selection on the bottom chart updates the top chart.

### Mobile Layout Issues
- **Aspect Ratio**: The 16:9 layout of the two stacked charts becomes illegible when squeezed into a mobile portrait width (`desktop_on_mobile.png`).
- **Interaction**: The "Brush" selector on the bottom chart becomes tiny on mobile. Dragging a small handle on a touch screen ("Fat-finger problem") is frustrating and inaccurate.
- **Readability**: Axis labels (dates and prices) become too small. The Y-axis title takes up valuable horizontal space.
- **Vertical Space**: Stacking two charts consumes significant vertical screen real estate, leaving little room for headers or data readouts.

## 2. Mobile Design Philosophy & Strategy

**"Finance App Aesthetic"**: The transformation will mimic premium stock trading apps (like Robinhood or Apple Stocks).

1.  **Simplify Interaction**: Replace the difficult-to-use "Brush" chart with **Time Range Buttons** (e.g., 1Y, 5Y, Max). This preserves the *intention* (filtering time ranges) while solving the mobile usability issue.
2.  **Focus on Data**: Maximize the main chart area. Use a "Crosshair" interaction on touch (long press or drag) to show specific price data in a fixed header, rather than floating tooltips which get blocked by fingers.
3.  **Premium UI**: Use a gradient fill for the area chart, glassmorphism for the container, and Lucide icons for metadata.

## 3. Design Action Space Mapping

### L0: Visualization Container
- **Action: `Rescale`**: Set container width to 100% and use a responsive height (e.g., `h-64` or `aspect-[4/3]`) rather than fixed pixels.
- **Action: `Reposition`**: Add global padding (`p-4`) to ensure the chart doesn't touch screen edges.

### L1: Interaction Layer
- **Action: `Recompose (Replace)` (Triggers)**: Replace the bottom "Context" chart (Vega-Lite Brush) with **Time Range Selector Buttons** (1M, 6M, 1Y, All).
    - *Reasoning*: The "Brush" interaction is poor on mobile. Buttons provide distinct, easy-to-tap targets to change the `domain` of the X-axis.
- **Action: `Recompose (Replace)` (Triggers)**: Change `Hover` triggers to `Touch/Drag` triggers for the main chart tooltip.

### L1: Chart Components & L2 Title Block
- **Action: `Reposition`**: Move the dynamic price display (the value currently being hovered) out of the tooltip and into a **Fixed Info Header** (Big Number) at the top of the card.
- **Action: `Recompose (Replace)`**: Use a simplified Main Title ("S&P 500") and a dynamic Subtitle showing the current price/date.

### L2: Coordinate System (Axes)
- **Action: `Recompose (Remove)`**: Remove the Y-axis Title ("price") and X-axis Title ("date"). The context makes these obvious.
- **Action: `Recompose (Remove)`**: Remove Y-axis lines (keeping only faint gridlines) to reduce ink ratio.
- **Action: `Decimate Ticks`**: Reduce X-axis tick count (e.g., only show 3-4 dates) to prevent overlap.
- **Action: `Format Tick Label`**: Shorten dates (e.g., "Jan '08" instead of "January 2008").

### L5: Feedback (Tooltips)
- **Action: `Reposition (Fix)`**: Instead of a floating tooltip, update the **Big Number** header when the user drags their finger across the chart. This solves the finger occlusion problem.

## 4. Data Extraction Plan

The original HTML points to an external CSV: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/sp500.csv`.

1.  **Fetch**: I will download the CSV data from the provided URL.
2.  **Parse**: Convert the CSV format (Date string, Price number) into a JSON array compatible with Recharts.
3.  **Process**:
    - Ensure Date is formatted strictly as `YYYY-MM-DD` or a JS Date object for Recharts processing.
    - No fake data. The full dataset (approx 2000-2010) will be embedded or fetched.

**Expected Data Format for Component**:
```typescript
interface DataPoint {
  date: string; // "2000-01-01"
  price: number; // 1450.23
}
```

## 5. Implementation Steps

1.  **Data Preparation**: Write a script to fetch the CSV and convert it to a static JSON constant within the component file (or a separate data file if large) to ensure the component is self-contained.
2.  **Component Skeleton**: Create the `Visualization` component with a container using `bg-white/10` (glassmorphism) and rounded corners.
3.  **State Management**:
    - `activeData`: The data currently visible based on time range.
    - `hoverData`: The data point currently selected by the user's touch.
    - `timeRange`: State for the active button (1M, 1Y, All).
4.  **Header Section**: Implement the "Big Number" display.
    - Default: Shows the latest price in the dataset.
    - On Hover/Touch: Updates to show the price at the cursor position.
5.  **Main Chart (Recharts)**:
    - `<ResponsiveContainer>` for fluid width.
    - `<AreaChart>` with a `<defs>` gradient for the fill color (e.g., fading blue).
    - `<XAxis>` with `tickFormatter` to abbreviate dates.
    - `<Tooltip>` with `content={<CustomTooltip />}` (or logically hidden to drive the Header display).
    - Remove `<Brush />` component (replacing with buttons).
6.  **Time Range Controls**: Render a flex row of buttons below the chart. Clicking a button filters the `activeData` passed to the chart.
7.  **Styling**: Apply Tailwind classes for typography (Inter font), spacing, and colors (slate-900 text, indigo-500 chart).

## 6. Justification for Deviations

- **Removing the Bottom Brush Chart**: The prompt asks to preserve intention. The intention of the bottom chart is *navigation* through time. On mobile, a dedicated navigation chart is visually cramped and functionally difficult. Replacing it with Time Range pills preserves the *function* (navigation) while improving the *form* (usability and aesthetics). This aligns with `L1 Interaction > Features > Recompose`.