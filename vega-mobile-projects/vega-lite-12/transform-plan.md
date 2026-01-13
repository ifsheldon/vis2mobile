# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### 1.1 Source Breakdown
- **Type**: Layered Dual-Axis Chart (created with Vega-Lite).
- **Data**: Seattle Weather (Monthly).
    - **X-Axis**: Month (Jan-Dec).
    - **Y-Axis 1 (Left)**: Average Temperature (°C). Represented as a range (Area) between `temp_min` and `temp_max`.
    - **Y-Axis 2 (Right)**: Average Precipitation (inches). Represented as a Line.
- **Visual Encodings**:
    - Temperature: Green (`#85C5A6`) area, opacity 0.3.
    - Precipitation: Blue (`#85A9C5`) line.
- **Narrative**: Correlation (or inverse correlation) between temperature and rainfall in Seattle throughout the year.

### 1.2 Mobile Constraints & Issues
- **Dual Y-Axes**: In the `desktop_on_mobile.png` simulation, the chart would be extremely squished. Two vertical axes (one left, one right) consume approx. 80-100px of valuable horizontal screen width, leaving very little room for the actual data.
- **Label Density**: 12 months (Jan-Dec) on the X-axis often overlap or require rotation on narrow screens, reducing readability.
- **Interaction**: The original relies on visual estimation or potential desktop hover. On mobile, fingers cover the data points ("fat-finger problem"), making precise reading of a specific month difficult.
- **Whitespace**: The desktop version has significant whitespace margins which are wasteful on mobile.

---

## 2. Design Action Space & Reasoning

To transform this into a premium mobile component, I will apply a **"Interactive Scrubber Card"** strategy. The goal is to maximize the data-ink ratio by removing static axes clutter and replacing them with dynamic interaction.

### L0 Visualization Container
- **Action: Rescale (Viewport)**
    - *Reasoning*: The container must occupy the full width of the mobile card component. I will set the chart container to a fixed, ergonomic height (e.g., `h-64`) that fits within a single thumb-scroll view.

### L3/L4 Axes & Ticks
- **Action: Recompose (Remove) - Y-Axes**
    - *Reasoning*: Dual Y-axes are the biggest enemy of mobile readability. I will **remove the visible Y-axis lines and labels entirely** from the chart sides.
    - *Justification*: Displaying numbers for both °C and Inches on the sides compresses the chart. Instead, I will move the quantitative data readout to the **L1 Interaction Layer**.
- **Action: Simplify (Format) - X-Axis**
    - *Reasoning*: "January", "February" is too long. "Jan", "Feb" is acceptable, but "J", "F", "M" is risky.
    - *Selection*: Use 3-letter abbreviations ("Jan") but use **Decimate Ticks** (show every 2nd or 3rd tick) if the screen is too narrow, or rely on the scrubber to reveal the specific month name.

### L1 Interaction Layer
- **Action: Reposition (Fix Tooltip) -> "Heads-up Display"**
    - *Reasoning*: Standard floating tooltips are blocked by fingers.
    - *Plan*: Create a **Fixed Header/Legend Block** above the chart.
    - *Mechanism*: When the user touches/drags along the chart (active index), this header dynamically updates to show: "August: Temp 14°-26°C | Precip 1.2in". When inactive, it shows a summary or the Legend.
- **Action: Triggers (Replace Hover with Touch/Scrub)**
    - *Reasoning*: Enable a full-height cursor line that follows the finger, allowing the user to "scrub" through the months.

### L2 Data Marks
- **Action: Recompose (Change Encoding)**
    - *Temperature*: The original uses an Area chart for the range (`min` to `max`). I will keep this using Recharts `<Area>` with a `range` array `[min, max]`. I will add a gradient fill to enhance the "Premium Aesthetics" (Glassmorphism feel).
    - *Precipitation*: Keep as a smooth curve `<Line>`, but increase `strokeWidth` for visibility against the area background.

---

## 3. Data Extraction Plan

Since I cannot run the Vega script dynamically, I will manually extract the data points based on the visual rendering of `desktop.png` (Seattle Weather). This ensures **Real Data** is used.

**Data Structure**:
An array of objects:
```typescript
interface WeatherData {
  month: string;
  minTemp: number; // Avg Min Temp (°C)
  maxTemp: number; // Avg Max Temp (°C)
  precipitation: number; // Avg Precip (inches)
}
```

**Estimated Extraction (Visual verification from desktop.png):**
1.  **Jan**: Temp ~3-8°C, Rain ~5.3"
2.  **Feb**: Temp ~4-10°C, Rain ~3.8"
3.  **Mar**: Temp ~5-12°C, Rain ~3.5"
4.  **Apr**: Temp ~6-15°C, Rain ~2.5"
5.  **May**: Temp ~9-19°C, Rain ~1.8"
6.  **Jun**: Temp ~12-22°C, Rain ~1.2"
7.  **Jul**: Temp ~14-26°C, Rain ~0.6"
8.  **Aug**: Temp ~15-26°C, Rain ~0.9"
9.  **Sep**: Temp ~12-22°C, Rain ~1.5"
10. **Oct**: Temp ~9-16°C, Rain ~3.2"
11. **Nov**: Temp ~5-10°C, Rain ~5.5" (Peak Rain)
12. **Dec**: Temp ~3-7°C, Rain ~5.2"

---

## 4. Implementation Steps (High Level)

1.  **Scaffold Component**: Create `src/components/Visualization.tsx`.
2.  **Define Data**: Codify the extracted Seattle weather data into a constant array.
3.  **Construct UI Shell**:
    - Use a nice rounded container with a subtle border and shadow (Glassmorphism hint).
    - Build the **Header Section**: This will contain the Title ("Seattle Weather") and the **Dynamic Legend/Stats Display**.
4.  **Implement Chart (Recharts)**:
    - Use `ResponsiveContainer` -> `ComposedChart`.
    - **Layer 1 (Precip)**: `Line` (Monotone), Blue, using right Y-axis scale ID (hidden).
    - **Layer 2 (Temp)**: `Area` (Monotone), Green, `dataKey` as array `[min, max]`, using left Y-axis scale ID (hidden).
    - **Axes**:
        - X-Axis: `dataKey="month"`, hide axis line, lighter tick labels.
        - Y-Axis: Define two `YAxis` components (left/right) with correct domains (0-30 for temp, 0-6 for rain) but set `hide={true}` to clean up the UI.
    - **Tooltip**: Use a `CustomTooltip` that sends data back to the parent component state (to update the Header) but renders *nothing* visibly near the cursor (return `null`).
5.  **Refine Styling**:
    - Use Tailwind for typography (Inter/Sans).
    - Add SVG gradients for the Area fill.
    - Ensure Lucide icons (e.g., `CloudRain`, `Thermometer`) are used in the header for context.