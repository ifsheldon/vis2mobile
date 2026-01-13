# Vis2Mobile Transformation Plan: Weekly Weather Layered Chart

## 1. Analysis of Original Visualization

### Desktop Version (Vega-Lite)
*   **Type**: Layered Bar Chart (Range Bars).
*   **Data Dimensions**:
    *   **X-Axis**: Categorical (Days of the week: M, T, W...).
    *   **Y-Axis**: Quantitative (Temperature in Fahrenheit, 10-70°F).
*   **Visual Layers (Z-Index low to high)**:
    1.  **Record (Background)**: Widest bars (`#ccc`), representing historical record low/high.
    2.  **Normal (Middle)**: Medium width bars (`#999`), representing historical averages.
    3.  **Actual (Foreground)**: Narrow bars (`#000`), representing observed data.
    4.  **Forecast (Overlay)**: Thin lines/ticks representing prediction ranges.
*   **Narrative**: The chart tells a story of how current weather compares to historical norms and extremes.
*   **Issues in Mobile Aspect Ratio**:
    *   **Horizontal Compression**: The bars become extremely thin, making it hard to distinguish the layers (Record vs. Normal vs. Actual).
    *   **Label Crowding**: X-axis labels are legible but tight.
    *   **Missing Context**: The original chart lacks a legend, relying on implicit knowledge or side-text not present in the spec. On mobile, this ambiguity is fatal.
    *   **Touch Targets**: The "Actual" bars and forecast lines are too thin for touch interaction.

## 2. Data Extraction Strategy

I need to extract the data schema based on the Vega-Lite `encoding` fields and populate it with the sample data referenced (`weekly-weather.json`).

**Schema Definition:**
Each data point represents a day and contains nested objects:
*   `id`: unique identifier (ordinal).
*   `day`: Label (e.g., "M", "T", "W").
*   `record`: `{ low: number, high: number }` (Light Gray)
*   `normal`: `{ low: number, high: number }` (Medium Gray)
*   `actual`: `{ low: number, high: number }` (Black)
*   `forecast`: `{ low: { low, high }, high: { low, high } }` (Complex nested structure for prediction error bars). *Note: For simplicity and mobile clarity, we may treat the forecast as a range or lines.*

**Data Source**: 
I will mock the data based on the visual output of the provided `weekly-weather.json` URL structure found in the spec. Since I cannot fetch live URLs, I will hardcode the data points visible in the chart (approx 10 data points) ensuring the values match the visual proportions of Record/Normal/Actual.

## 3. High-Level Design Strategy

To ensure **Readability** and **Premium Aesthetics** on mobile:

1.  **Interaction over Compression**: Instead of squishing 10+ days into a 300px screen, I will implement a **Horizontal Scrollable Container**. This allows each day to maintain sufficient width (e.g., 60px per day) so the layered effect (Bar-in-Bar) remains visible and aesthetically pleasing.
2.  **Vertical Layout Preservation**: I will *not* transpose to a horizontal bar chart. Time-series weather data is conventionally read left-to-right. Vertical bars are intuitive for "high/low" temperature.
3.  **Explicit Legend**: I will add a "Sticky" or "Inline" legend to explain the gray levels, as the mobile user won't have hover-over context clues immediately.
4.  **Touch-First Details**: Instead of reliance on visual estimation, tapping a bar will trigger a **Bottom Sheet** or **Fixed Card** displaying the exact numbers for Record, Normal, and Actual temperatures for that specific day.

## 4. Action Plan (Mapped to Design Action Space)

### **L0 Visualization Container**
*   **Action**: `Rescale (Scrollable Canvas)` (Not explicitly in table but related to `Rescale`).
    *   **Reason**: The "Desktop on Mobile" image proves that fitting all data in the viewport makes bars too thin.
    *   **Implementation**: Create a container with `overflow-x-auto`. The inner chart width will be calculated as `DataPoints * MinBarWidth` (e.g., 10 * 50px = 500px).
*   **Action**: `Reposition`
    *   **Reason**: Remove global padding that wastes screen real estate.

### **L1 Data Model**
*   **Action**: `Recompose (Aggregate/Simplify)`
    *   **Reason**: The `forecast` data in the original spec is very complex (inner ticks inside the bar).
    *   **Plan**: I will simplify the "Forecast" visualization to simple dashed lines or distinct markers, or merge it into the "Actual" representation if it creates too much visual noise, ensuring the primary hierarchy (Record > Normal > Actual) is clear.

### **L2 Title Block**
*   **Action**: `Reposition (Externalize)`
    *   **Reason**: Move the title out of the chart area into a clean Next.js page header to maximize chart height.
    *   **Action**: `Recompose (Replace)`: Simplify title to "Weekly Temperature".

### **L2 Coordinate System (Axes)**
*   **Action**: `Recompose (Remove)` - **Y-Axis Line**
    *   **Reason**: Remove the vertical axis line to reduce clutter. Keep **Gridlines** (dashed, subtle) to guide the eye.
*   **Action**: `Rescale` - **Y-Axis Ticks**
    *   **Reason**: Reduce tick count (e.g., 20, 40, 60, 80) to save space.
*   **Action**: `Fix Tooltip Position` (L2 Feedback)
    *   **Reason**: Fingers obscure the data. I will implement a "Selected State" where tapping a bar updates a detail view below the chart.

### **L2 Data Marks**
*   **Action**: `Rescale (Width)`
    *   **Reason**: Define explicit `barSize` in Recharts.
        *   Layer 1 (Record): 32px
        *   Layer 2 (Normal): 20px
        *   Layer 3 (Actual): 8px
    *   This preserves the "Matryoshka doll" nesting effect.
*   **Action**: `Recompose (Color)`
    *   **Reason**: Map the hex codes to Tailwind colors for better consistency (e.g., `bg-slate-200`, `bg-slate-400`, `bg-slate-900`).

### **L2 Auxiliary Components (Legend)**
*   **Action**: `Reposition`
    *   **Reason**: Place a custom Legend component *above* the chart but below the title. Use circular swatches to indicate "Record", "Normal", "Actual".

## 5. Implementation Steps

1.  **Project Setup**: Initialize the generic visualization component structure.
2.  **Data Codification**: Create a TypeScript interface `WeatherDay` and populate a constant `weatherData` array manually matching the visual heights from the original SVG.
3.  **Component Construction (Recharts)**:
    *   Use `<ComposedChart>`.
    *   **Layer 1**: `<Bar dataKey="record" />` (Range: [low, high]) with light gray custom shape or color.
    *   **Layer 2**: `<Bar dataKey="normal" />` (Range: [low, high]) with medium gray, smaller `barSize`.
    *   **Layer 3**: `<Bar dataKey="actual" />` (Range: [low, high]) with black, smallest `barSize`.
    *   **XAxis**: Display 'day'.
    *   **YAxis**: Hide axis line, keep ticks.
4.  **Styling (Tailwind)**:
    *   Apply a "Card" container with `rounded-xl`, `shadow-sm`, and `bg-white/50` (Glassmorphism).
    *   Implement the horizontal scroll wrapper for the Chart.
5.  **Interaction Logic**:
    *   State `selectedDay` (defaults to the last available day).
    *   `onClick` handler on Bars to update `selectedDay`.
    *   **Detail View**: A component below the chart rendering the specific values for the `selectedDay` in a grid layout (Record vs Normal vs Actual).
6.  **Refinement**:
    *   Add Framer Motion (if available via standard CSS/Tailwind transitions) or simple CSS transitions for bar interactions.
    *   Ensure fonts are legible (Inter/Sans).

This plan transforms a static, cluttered desktop chart into a scrollable, interactive, and high-fidelity mobile experience.