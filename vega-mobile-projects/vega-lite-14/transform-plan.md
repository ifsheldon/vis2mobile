# Plan: Mobile-First Interactive Weekly Weather Visualization

## 1. Analysis of Desktop Visualization

### 1.1 Visual Elements & Data Structure
The original visualization is a layered bar chart (Vega-Lite) displaying weekly weather data. It is highly information-dense, stacking three distinct layers of data for each day:
1.  **Record High/Low**: Represented by the widest, lightest gray bar (`#ccc`).
2.  **Normal High/Low**: Represented by a medium-width, medium gray bar (`#999`).
3.  **Observed/Predicted**:
    *   **Actual Data**: Solid black bar (`#000`) for past days.
    *   **Forecast Data**: Complex segmented black bars representing uncertainty ranges for future days.

### 1.2 Issues with "Desktop on Mobile"
*   **Aspect Ratio Distortion**: When rendered on a mobile aspect ratio (vertical), the chart becomes extremely squished horizontally.
*   **Poor Readability**: The days (x-axis) are crowded. The visual distinction between the three layers (Record/Normal/Actual) becomes difficult to perceive because the bars become too narrow.
*   **Interaction Void**: There is no mechanism to see exact values without a mouse hover, which is not native to mobile.
*   **Visual Clutter**: The overlapping gray bars lose their semantic meaning when compressed; it looks like a single messy bar.

## 2. Vis2Mobile Design Action Plan

### 2.1 High-Level Strategy
To ensure readability and a premium mobile experience, the primary strategy is to **Transpose** the chart. Instead of vertical bars (Time on X-axis), we will use horizontal bars (Time on Y-axis). This allows the text labels (Days) to be horizontal and readable, and utilizes the infinite vertical scrolling capability of mobile devices to give each day sufficient breathing room.

### 2.2 Detailed Actions

#### **L0 Visualization Container**
*   **Action: `Reposition` (Global Padding)**
    *   **Why**: Mobile screens have notches and safe areas. We need to add safe-area padding and a clean background.
*   **Action: `Rescale` (Viewport)**
    *   **Why**: The container must fill the width of the mobile screen (`w-full`) while allowing height to be determined by content (7 days stacked vertically).

#### **L2 Coordinate System**
*   **Action: `Transpose` (Axis-Transpose)**
    *   **Why**: **Crucial Action**. Vertical bars on a narrow screen are illegible. Rotating the chart 90 degrees (Horizontal Bars) allows the "Temperature" axis to run horizontally and "Days" to stack vertically. This aligns with natural mobile reading patterns.

#### **L3 Axes & Gridlines**
*   **Action: `Recompose (Remove)` (Axis Lines & Titles)**
    *   **Why**: The Y-axis line is unnecessary; the alignment of labels is sufficient. The X-axis title ("Temperature (F)") can be moved to the main header or subtitle to save pixels.
*   **Action: `Recompose (Remove)` (Gridlines)**
    *   **Why**: To achieve a "Premium" look, we will remove vertical gridlines to reduce visual noise (`clean aesthetic`), relying on the bar lengths and a subtle background track for context.
*   **Action: `Rescale` (Tick Labels)**
    *   **Why**: Reduce font size slightly but increase font weight for readability.

#### **L4 Data Marks (The Bars)**
*   **Action: `Rescale` (Mark Height)**
    *   **Why**: In the transposed view, the "width" of the bar becomes the "height" of the row. We will increase the row height to roughly 60-80px per day to make them touch-friendly.
*   **Action: `Recompose (Change Encoding)` (Color & Opacity)**
    *   **Why**: The original grays are dull.
        *   *Record*: Use a subtle, translucent track (Glassmorphism effect).
        *   *Normal*: Use a solid but muted color (e.g., Slate-400).
        *   *Actual/Forecast*: Use a vibrant gradient or solid primary color (e.g., Indigo-500 or Black) to indicate "Current/Real" data.
*   **Action: `Serialize Layout` (Tooltip/Labels)**
    *   **Why**: Instead of trying to fit 6 numbers (3 lows, 3 highs) into one bar label, we will rely on a "Touch/Click" interaction to show details.

#### **L1 Interaction & Feedback**
*   **Action: `Recompose (Replace)` (Hover -> Touch/Expand)**
    *   **Why**: Hover doesn't exist.
    *   **Plan**: Implement an **Accordion** or **Expandable Card** pattern.
        *   *Default State*: Shows the visual bars and the Day name.
        *   *Active State (Click)*: The row expands to show a data table or large numbers detailing the specific Record, Normal, and Actual temperatures for that day.

#### **L3 Legend**
*   **Action: `Reposition` (Top/Sticky)**
    *   **Why**: Place a minimalist legend at the top so users understand the layering logic (Wide bar = Record, Narrow bar = Actual) before scrolling.

## 3. Data Extraction Plan

I will define a strict TypeScript interface and hardcode the data derived from the source `weekly-weather.json`.

**Source Data Logic:**
The dataset contains an array of objects. I need to map them to a structure Recharts can handle easily (flattened structure or arrays for Range Bars).

**Target Data Structure (`WeatherDay`):**
```typescript
interface WeatherDay {
  id: number;
  day: string; // e.g., "Sun", "Mon"
  
  // Layer 1: Record (The widest background)
  recordMin: number;
  recordMax: number;
  
  // Layer 2: Normal (The middle context)
  normalMin: number;
  normalMax: number;
  
  // Layer 3: Actual or Forecast (The foreground focus)
  // Note: The original spec distinguishes Actual vs Forecast. 
  // We will unify them into a "primary" range but keep a flag to style them differently (e.g., dashed for forecast).
  primaryMin: number;
  primaryMax: number;
  isForecast: boolean;
  
  // Raw forecast details for the expanded view (if available)
  forecastDetails?: {
    lowMin: number; // forecast.low.low
    lowMax: number; // forecast.low.high
    highMin: number; // forecast.high.low
    highMax: number; // forecast.high.high
  }
}
```

**Extraction Steps:**
1.  Parse the Vega-Lite `data.url`.
2.  Iterate through the JSON.
3.  For each record:
    *   Extract `record.low/high`, `normal.low/high`.
    *   Check if `actual` exists. If yes, map `actual.low/high` to `primaryMin/Max` and set `isForecast = false`.
    *   If `actual` is missing, use `forecast`.
        *   *Simplification for Mobile*: The original forecast has distinct "low range" and "high range". To keep the visual clean in the collapsed view, I will take the absolute min of the low forecast and absolute max of the high forecast as the `primaryMin/Max`. In the *expanded* details view, I can show the uncertainty precision.

## 4. Implementation Details

### 4.1 Tech Stack Specifics
*   **Framework**: Next.js 14
*   **Charts**: `Recharts` using `<ComposedChart>` with `layout="vertical"`.
    *   We will use multiple `<Bar>` components.
    *   To achieve the "Range" effect in Recharts, data is passed as `[min, max]`.
    *   **Z-Index Trick**: Render `Record` bar first (widest), then `Normal` bar (medium), then `Actual` bar (thinnest). Recharts renders in order of definition.
*   **Styling**: Tailwind CSS.
    *   Use `backdrop-blur` for the expanded details card.
    *   Use `rounded-full` for bar ends to look modern.
*   **Icons**: Lucide React for weather context (Sun, Cloud) or interaction hints (ChevronDown).

### 4.2 Step-by-Step Implementation
1.  **Scaffold**: Create `src/components/WeeklyWeatherChart.tsx`.
2.  **Data Preparation**: Create the `const data: WeatherDay[]` array using values from `weekly-weather.json`.
3.  **Layout**: Create a Flexbox container. Header with Title "Weekly Weather" and Subtitle "Observations & Predictions".
4.  **Chart Construction**:
    *   `<ResponsiveContainer height={500}>` (tall enough for 7 rows).
    *   `<ComposedChart layout="vertical" data={data}>`.
    *   `<XAxis type="number" hide />` (Clean look, maybe show min/max tick only).
    *   `<YAxis type="category" dataKey="day" width={40} tick={{fontSize: 14, fontWeight: 600}} />`.
    *   **Bar 1 (Record)**: `<Bar dataKey="recordRange" barSize={32} fill="#e5e7eb" radius={[99,99,99,99]} />` (Light Gray).
    *   **Bar 2 (Normal)**: `<Bar dataKey="normalRange" barSize={16} fill="#9ca3af" radius={[99,99,99,99]} />` (Medium Gray).
    *   **Bar 3 (Actual/Forecast)**: `<Bar dataKey="primaryRange" barSize={6} fill="#111827" radius={[99,99,99,99]} />` (Dark).
5.  **Custom Tooltip/Interaction**:
    *   Use `Tooltip` with `cursor={false}`.
    *   Actually, prefer a **React State** approach: `activeDay`. Clicking a bar updates `activeDay`.
    *   Render a separate "Details Card" below the chart or as an overlay when a bar is clicked.
    *   *Alternative Mobile approach*: Render the "Details" directly inside the list if we build a custom list instead of just a Recharts canvas.
    *   *Decision*: Use Recharts for the visualization part, but wrap it in a custom interactive container. Or, since the layout is regular (7 rows), build it using **HTML/CSS Grids** instead of SVG Chart libraries for perfect control over the "Expand" animation and typography.
    *   *Revised Implementation Decision*: **Hybrid**. Use HTML/Tailwind for the layout (Grid of 7 days). Inside each row, use a mini SVG or CSS-based bar chart. This offers superior control over the "Expansion" animation and mobile typography compared to fighting with Recharts SVG positioning for text.

### 4.3 Why HTML/CSS over Recharts for this specific case?
The "Action Space" emphasizes `Interaction` and `Animation`. A Recharts SVG is static. A list of `div`s (one per day) allows us to:
1.  Animate the height of the row on click (Accordion).
2.  Place HTML text perfectly aligned with the bars.
3.  Use CSS Grid to overlay the bars (Record/Normal/Actual) perfectly using `z-index`.
4.  This fits the "Mobile First" UX better than a static canvas.

**Plan Update**: I will implement this using standard React/Tailwind with CSS-based bars for the visualization, ensuring maximum responsiveness and animation quality.

### 4.4 Final Visual Plan
*   **Header**: Title.
*   **Legend**: 3 small pills (Record, Normal, Actual).
*   **List**: 7 Rows.
    *   **Row Collapsed**: Left: Day Name. Center: Stacked Horizontal Bars. Right: Current Temp (if actual) or Range (if forecast).
    *   **Row Expanded**: Shows the bars + a grid of numbers below it: "Record: 20-50°", "Normal: 30-45°", "Actual: 42°".