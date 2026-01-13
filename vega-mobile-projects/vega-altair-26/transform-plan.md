# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Source Overview
- **Type**: Focus + Context (Zoom & Filter) Area Chart.
- **Content**: S&P 500 stock prices over time (approx. 2000-2010).
- **Structure**:
    - **Top View (Focus)**: Detailed view of the price within a selected date range.
    - **Bottom View (Context)**: Global view of the entire dataset with a "Brush" selection tool.
- **Interaction**: Dragging the brush on the bottom chart updates the X-axis domain of the top chart.
- **Aesthetic**: Standard Vega-Lite default styles (basic blue, plain axes).

### Mobile Challenges (Desktop on Mobile)
1.  **Interaction Issues**: The standard "Brush" selector on desktop is often too small for fingers ("fat-finger problem"). Dragging handles requires precision not available on touchscreens.
2.  **Layout Compression**: Simply shrinking the 600px width to mobile (~350px) compresses the X-axis ticks, causing overlap or unreadability.
3.  **Vertical Space**: The stacked layout (Main + Context) consumes significant vertical height. On mobile, we need to balance the chart height with the need for interaction controls.
4.  **Data Density**: The main chart attempts to show every data point. On a small screen, this creates visual noise.

## 2. Vis2Mobile Design Action Plan

### L0: Visualization Container
*   **Action: `Rescale` (Fit to Width)**
    *   **Reasoning**: The fixed 600px width must be abandoned. The container will be set to `width: 100%` with a responsive aspect ratio.
*   **Action: `Reposition` (Padding)**
    *   **Reasoning**: Add adequate padding to prevent charts from touching screen edges, ensuring the UI feels "airy" and premium.

### L1: Interaction Layer
*   **Action: `Recompose (Replace)` (Brush -> Optimized Touch Control)**
    *   **Reasoning**: While the "Brush" concept is preserved, the implementation changes. Instead of a tiny strip, we will use a **styled Recharts Brush** with larger touch targets (`travellerWidth`) and clear visual cues, or separate the time-range selection into preset buttons (e.g., 1Y, 5Y, All) combined with the brush for fine-tuning.
    *   *Constraint Check*: Recharts `<Brush />` is the standard tool here. We must style it heavily to match the "Premium" requirement (remove default ugly borders, change fill colors).

### L2: Data Marks (The Area Charts)
*   **Action: `Recompose (Change Encoding)` (Visual Polish)**
    *   **Reasoning**: The solid blue area is flat. To achieve "Premium Aesthetics," we will use **SVG Linear Gradients** for the area fill (fading from top to bottom) and a thicker, brighter stroke for the line.
*   **Action: `Recompose (Remove)` (Context Detail)**
    *   **Reasoning**: The bottom "Context" chart does not need gridlines, axes, or labels. It only needs to show the *shape* of the data. We will strip it down to a "Sparkline" style.

### L3: Axes & Ticks
*   **Action: `Decimate Ticks` (X-Axis)**
    *   **Reasoning**: On the main chart, show only 3-4 ticks max to prevent overlap.
*   **Action: `Simplify Label` (Date Formatting)**
    *   **Reasoning**: Change full dates (e.g., "Jan 1, 2008") to abbreviated years or months (e.g., "'08", "'09") depending on the zoom level.
*   **Action: `Recompose (Remove)` (Y-Axis Lines)**
    *   **Reasoning**: Remove the vertical Y-axis line. Keep subtle horizontal gridlines for readability. Move Y-axis ticks inside the chart or to the right edge to save horizontal space.

### L4: Tooltip / Feedback
*   **Action: `Reposition (Fix)` (Tooltip Strategy)**
    *   **Reasoning**: Floating tooltips are bad on mobile (finger covers them).
    *   **Solution**: We will use a **Information Header**. When the user touches/drags on the main chart, the specific date and price will be displayed in a fixed "Scoreboard" area at the top of the card, rather than a floating box.

### L5: Narrative / Title
*   **Action: `Rescale` (Typography)**
    *   **Reasoning**: Use a clean, large sans-serif font for the current price (Premium/Finance app style).
*   **Action: `Compensate` (Dynamic Title)**
    *   **Reasoning**: The title should reflect the selected range (e.g., "S&P 500 Price (2007-2009)") dynamically.

---

## 3. Data Extraction Plan

The data is hosted at `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/sp500.csv`.

1.  **Fetch Strategy**: Use a script or online tool to download the CSV.
2.  **Parsing**: Convert the CSV into a JSON array of objects: `{ date: string, price: number }`.
3.  **Optimization**:
    *   Ensure the date string is ISO or a timestamp number for easier parsing by Recharts.
    *   Since this is a static extraction for the component, the JSON will be embedded directly into the component file or a separate `data.ts` file to ensure the component is self-contained and performant (no client-side CSV parsing delay).

**Target Data Structure**:
```typescript
interface StockData {
  date: string; // "2000-01-01"
  price: number; // 1469.25
}
```

---

## 4. Implementation Steps

### Step 1: Data Preparation
*   Fetch the CSV content.
*   Convert to JSON.
*   Create a file `src/data/sp500_data.ts` exporting the array.

### Step 2: Component Skeleton
*   Create `src/components/Visualization.tsx`.
*   Setup a Card container with glassmorphism effects (`backdrop-blur`, `bg-white/10`).
*   Implement the "Header" section for Title and Active Data Display (Price/Date).

### Step 3: The Main Chart (Focus)
*   Implement `<ResponsiveContainer>` with `<AreaChart>`.
*   Add `<Defs>` for the gradient fill (color: Indigo/Purple palette).
*   Configure XAxis (dynamic domain based on state) and YAxis (minimalist).
*   Add `<Tooltip>` with `cursor={{ stroke: 'white' }}` but render the output in the Header (using `content={<CustomTooltip />}` or state lifting).

### Step 4: The Context Chart (Brush)
*   Implement a second, smaller `<AreaChart>` below the main one.
*   Add the `<Brush>` component inside this chart.
*   **Crucial Styling**: Customize the Brush `travellerWidth` to be at least 20px for touch. Style the `fill` and `stroke` to look integrated (e.g., semi-transparent white overlay).

### Step 5: State Synchronization
*   Use React `useState` to track the `brushDomain` (startIndex, endIndex).
*   Pass this domain to the Main Chart's XAxis to achieve the zoom effect.
*   Update the Header info based on the *last* data point in the visible range (or the hovered point).

### Step 6: Polish
*   Apply Tailwind classes for typography (`text-xs`, `font-mono` for numbers).
*   Add Lucide icons for visual flair (e.g., TrendingUp icon in header).
*   Ensure "Loading" state is handled (though data is local, hydration matters).

---

## 5. Justification for Deviations
*   **Not removing the Context Chart**: The "Action Space" suggests removing secondary charts for mobile. However, for *Time Series Analysis*, the context (brush) is a primary navigation tool, not just a secondary chart. Removing it forces the user to scroll endlessly or lose context. Therefore, we **Rescale** and **Simplify** it rather than Remove it.
*   **Custom Tooltip Position**: Moving the tooltip to the header is a specific instance of `Reposition (Fix)` tailored for financial apps, ensuring the user's finger never blocks the critical data value.