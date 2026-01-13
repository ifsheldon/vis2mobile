# Vis2Mobile Transformation Plan: Annual Weather Heatmap

## 1. Analysis of Desktop Visualization

### Original Desktop Version
- **Visual Encoding**: A classic heatmap matrix.
    - **X-Axis**: Days of the month (1-31).
    - **Y-Axis**: Months (Jan-Dec).
    - **Color**: Represents `temp_max` (Max Temperature), ranging from light yellow/green (cold) to dark blue (hot).
- **Layout**: Landscape orientation. Wide aspect ratio (~2.5:1).
- **Interactivity**: Hover triggers a tooltip with detailed weather data.
- **Data Density**: 31 columns × 12 rows = 372 data cells.

### Issues in Mobile Context
- **Aspect Ratio Mismatch**: The desktop chart is wide. Rendering it directly on a portrait mobile screen (as seen in `desktop_on_mobile.png`) squashes the columns (Days) into tiny, untappable slivers (approx 8-10px wide).
- **Unreadable Labels**: The X-axis numbers (1-31) and Y-axis month labels become microscopic or overlap.
- **Interaction Barriers**: Hover interactions do not work on touch devices. "Fat-finger" issues will make selecting specific dates impossible in the original grid layout.
- **Vertical Space Underutilization**: Mobile screens have ample vertical space that is currently unused by the squashy landscape layout.

## 2. Vis2Mobile Design Action Plan

Based on the **Vis2Mobile Design Action Space**, I propose the following transformation to ensure readability, touch-friendliness, and premium aesthetics.

### L2 Coordinate System & Data Marks
*   **Action: `Transpose Axes` (Coordinates)**
    *   **Reasoning**: The current 31-column width is too wide for mobile. By transposing the chart (swapping X and Y), we get 12 columns (Months) and 31 rows (Days).
    *   **Result**: 12 columns fit comfortably across a mobile screen width (approx 375px). 31 rows extend vertically, utilizing the natural vertical scroll of mobile web.
*   **Action: `Rescale Mark` (Data Marks)**
    *   **Reasoning**: Expand cell size to at least 24x24px (plus gaps) to ensure touch targets are usable.
    *   **Result**: A taller visualization that is scrollable but highly readable.

### L3/L4 Axes & Ticks
*   **Action: `Simplify Labels` (Ticks)**
    *   **Reasoning**: "January", "February" are too long for 12 narrow columns.
    *   **Implementation**: Abbreviate Month labels to single letters or short forms (J, F, M, A...).
*   **Action: `Decimate Ticks` (Ticks)**
    *   **Reasoning**: Labeling every single day (1-31) on the vertical axis adds clutter.
    *   **Implementation**: Show ticks every 5 days (1, 5, 10, 15...).

### L2 Interaction & Narrative
*   **Action: `Recompose (Replace)` (Triggers)**
    *   **Reasoning**: Replace `hover` with `click/tap`.
    *   **Implementation**: Tapping a cell highlights it and updates a detail view.
*   **Action: `Reposition (Fix)` (Feedback)**
    *   **Reasoning**: Tooltips covering the finger are bad UX.
    *   **Implementation**: Introduce a **"Glassmorphic Detail Card"** fixed at the bottom of the viewport (or sticky header) that displays the full details (Date, Temp, Weather, Wind) of the selected cell.

### L3 Legend
*   **Action: `Reposition` & `Transpose`**
    *   **Reasoning**: The vertical legend on the right takes up valuable horizontal space needed for the chart columns.
    *   **Implementation**: Move the legend to the top (`Reposition`) and make it a horizontal gradient bar (`Transpose`).

## 3. Implementation Steps

### Step 1: Component Structure
Create a `Visualization` component wrapping the logic.
- **Layout**: Flex column.
- **Header**: Title "Seattle Weather 2012" and a horizontal Legend component.
- **Scroll Area**: The Recharts container.
- **Footer/Overlay**: A sticky detail card showing specific data points when a cell is clicked.

### Step 2: Visualization (Recharts Workaround)
Since Recharts does not have a native "Heatmap" component, I will use a **`ScatterChart`** to emulate it:
1.  **X-Axis**: Categorical (Months 0-11).
2.  **Y-Axis**: Number (Days 1-31). Note: To make Day 1 appear at the top, the Y-axis domain needs to be reversed.
3.  **Z-Axis/Color**: `temp_max`.
4.  **Custom Shape**: Pass a custom React component to the `shape` prop of `<Scatter />`. This component will render a `rect` filled with the color corresponding to the temperature.
5.  **Responsiveness**: Use `<ResponsiveContainer>` with a fixed aspect ratio or calculated height based on the number of days.

### Step 3: Styling (TailwindCSS)
- **Palette**: Use a custom color scale function (e.g., interpolated D3 scale or manual HSL mapping) to map temperature to the Blue-Yellow-DarkBlue gradient seen in the original.
- **Typography**: Sans-serif, optimized for readability.
- **Effects**: Glassmorphism (`backdrop-blur-md`, `bg-white/30`) for the floating detail card.

### Step 4: Interaction Logic
- State `selectedData`: Stores the object of the currently tapped day.
- Default to the hottest day or the current date equivalent on initial load.
- Map the `weather` string (rain, sun, snow, drizzle, fog) to **Lucide Icons** (Sun, CloudRain, Snowflake, CloudDrizzle, CloudFog) in the detail card for visual impact.

## 4. Data Extraction Plan

I will parse the JSON object located in the `<script>` tag of the source HTML. Specifically `spec.datasets['data-9cda1fa0376fcdc5d69536fab26b0d0b']`.

**Data Fields to Extract:**
1.  `date`: ISO String -> Convert to Date Object for grouping.
2.  `temp_max`: The primary metric.
3.  `weather`: Categorical string (used for icons).
4.  `precipitation`: Secondary metric.
5.  `wind`: Secondary metric.

**Transformation for Recharts:**
```typescript
type WeatherData = {
  date: string; // ISO
  monthIndex: number; // 0-11 (for X axis)
  dayOfMonth: number; // 1-31 (for Y axis)
  temp_max: number;
  precipitation: number;
  wind: number;
  weather: string;
};
```

This plan ensures we keep all the original data (real data) while completely overhauling the presentation to be native and performant on mobile.