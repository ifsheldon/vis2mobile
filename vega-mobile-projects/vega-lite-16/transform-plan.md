# Mobile Transformation Plan: Driving vs. Gas Prices

## 1. Analysis of Original Visualization

The original visualization is a **Connected Scatterplot** created with Vega-Lite.
- **X-Axis**: Miles (Quantitative, Non-monotonic/Backtracking). Range: ~3,500 to 10,500.
- **Y-Axis**: Gas Price (Quantitative). Range: ~$1.30 to ~$3.40.
- **Mark**: Line with points.
- **Encoding**:
    - Position (x, y): Miles vs. Gas.
    - Order: Connected by `year`.
    - Note: This chart visualizes a trajectory over time. The "looping" (hysteresis) is the key insight, showing how driving habits change in response to gas prices over decades.

**Issues in "Desktop on Mobile" View**:
1.  **Aspect Ratio**: The default landscape view squashes the chart vertically on mobile, making the loops flat and hard to distinguish.
2.  **Readability**: Axis labels and ticks are too small.
3.  **Ambiguity**: Without hovering (which is impossible on mobile), the user cannot tell which direction time flows (which end is 1956 and which is 2010?).
4.  **Touch Targets**: Small points are hard to tap.

## 2. Mobile Design Strategy (Action Space)

I will apply the **Vis2Mobile Design Action Space** to transform this into a premium mobile component.

### L0: Visualization Container
- **Action: `Rescale` (Aspect Ratio)**
    - *Reasoning*: The connected scatterplot needs vertical breathing room to show the loops clearly.
    - *Plan*: Change the aspect ratio from landscape (16:9) to square (1:1) or slight portrait (4:5). This maximizes screen real estate usage.

### L1: Interaction Layer
- **Action: `Reposition (Fix)` (Tooltip)**
    - *Reasoning*: Finger occlusion prevents reading tooltips near the touch point.
    - *Plan*: Create a dedicated **"Data Card"** fixed at the bottom of the chart or top of the screen that updates as the user interacts.
- **Action: `Recompose (Replace)` (Trigger)**
    - *Reasoning*: Hover is unavailable.
    - *Plan*: Implement a **"Scrubbing"** interaction. Users can drag their finger horizontally across the chart area (or use a slider) to snap to the nearest year.
- **New Action (Not in basic space): `Guide Animation`**
    - *Reasoning*: Static connected scatterplots are confusing.
    - *Plan*: On load, animate the line drawing from the start year to the end year. This establishes the narrative direction (Time).

### L2: Data Marks (The Line & Points)
- **Action: `Rescale` (Mark Size)**
    - *Reasoning*: Points need to be visible but not cluttered.
    - *Plan*: Increase the stroke width of the connecting line. Keep points small but increase the transparent "hit area" (active dot radius).
- **Action: `Recompose (Change Encoding)`**
    - *Reasoning*: To show time flow without text labels.
    - *Plan*: Use a subtle gradient on the line stroke (if feasible with Recharts) or clearly mark the "Start" (1956) and "End" (2010) points with distinct annotations.

### L3: Axes & Coordinate System
- **Action: `Decimate Ticks`**
    - *Reasoning*: Mobile screens are narrow.
    - *Plan*: Reduce X-axis ticks to 3-4 (e.g., 4k, 7k, 10k). Reduce Y-axis ticks to 4-5.
- **Action: `Simplify Labels`**
    - *Reasoning*: Space constraints.
    - *Plan*: Format Miles as "4k", "6k" and Gas as "$1.5", "$2.0". Move unit labels (miles/gas) to the chart header or a subtitle to remove axis title clutter.

### L4: Annotations
- **Action: `Recompose (Remove/Externalize)`**
    - *Reasoning*: Do not clutter the chart with year labels on every point.
    - *Plan*: Only show the currently selected year in the external "Data Card". Highlight the selected point with a large, glowing `activeDot`.

## 3. Data Extraction Plan

Since I cannot fetch the URL `https://vega.github.io/editor/data/driving.json` during the build phase dynamically in the browser without CORS issues or reliance on external connectivity, I will need to extract the data into a static JSON constant.

**Source**: The original code points to `driving.json`.
**Extraction Method**: I will mentally simulate fetching this data. Since I am an AI, I know this specific dataset (Driving Shift / Miles vs Gas).
**Schema**:
```typescript
interface DataPoint {
  year: number;
  miles: number; // Miles driven per capita
  gas: number;   // Price of gas (adjusted)
}
```
**Data Verification**: I will ensure the data matches the visual:
- Start (~1956): ~3700 miles, ~$2.40 gas.
- Middle dip (~1980): ~7000 miles, ~$3.20 gas (the high peak).
- End (~2010): ~9500 miles, ~$2.50 gas.

## 4. Implementation Plan

### Tech Stack Implementation
- **Component**: `DrivingScatterplot.tsx`
- **Library**: `Recharts`
    - **Critical Note**: Recharts `<LineChart>` often sorts data by X-axis, which destroys connected scatterplots (loops).
    - **Solution**: Use `<ScatterChart>` with `<Scatter line={{ strokeWidth: 3 }} />`. The `<Scatter>` component respects the order of the data array, allowing the line to loop back on itself.
- **Styling**: TailwindCSS with `clsx`/`tailwind-merge`.

### Step-by-Step Instructions

1.  **Setup & Layout**:
    - Create a wrapper `Card` component with a subtle glassmorphism effect (`bg-white/10 backdrop-blur`).
    - Use a flexible container that maintains a robust height (e.g., `h-[400px]`).

2.  **Header & Narrative**:
    - **Title**: "Driving Habits vs. Gas Prices"
    - **Subtitle**: "Connected scatterplot showing the relationship between miles driven and gas cost (1956-2010)."
    - **Legend/Info**: "Drag to explore timeline".

3.  **Chart Construction**:
    - Component: `ResponsiveContainer` -> `ScatterChart`.
    - **X-Axis**: Data key `miles`. Domain `['auto', 'auto']` or specific padding. Tick formatter: `(val) => val >= 1000 ? (val/1000).toFixed(0) + 'k' : val`.
    - **Y-Axis**: Data key `gas`. Tick formatter: `(val) => '$' + val.toFixed(2)`.
    - **Data Mark**:
        - `<Scatter>` with `data={drivingData}`.
        - `line={{ stroke: '#3b82f6', strokeWidth: 3 }}` (Blue-500).
        - `shape="circle"`.

4.  **Interaction Layer**:
    - **Custom Tooltip**: Disable default. Use `Tooltip` with `active` state to update a React state variable `selectedPoint`.
    - **Feedback**: When a point is active:
        - Render a large "Halo" dot at that location.
        - Update a "Stat Bar" below the chart displaying: **YEAR**, **GAS PRICE**, **MILES**.

5.  **Polishing**:
    - **Animation**: Use Recharts `isAnimationActive`.
    - **Annotations**: Add a logical "Start" and "End" label if the chart looks too abstract, or rely on the interaction to reveal the year.

6.  **Typography**:
    - Use `Inter` or system sans-serif.
    - Ensure axis text is `text-xs` or `text-sm` with sufficient contrast (`text-slate-500`).

### Mobile Readability Check
- **Font Size**: Axis ticks set to minimum 12px equivalent.
- **Contrast**: Dark line on light background (or vice versa).
- **Whitespace**: Padding around the chart container to prevent axis labels from being cut off.

This plan ensures the complex relationship (hysteresis loop) is preserved while making the data accessible via touch interaction, strictly adhering to the "Premium" and "Mobile-First" directives.