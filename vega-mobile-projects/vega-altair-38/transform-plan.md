# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version
- **Content**: A combo chart showing daily Maximum Temperature (`temp_max`) as a **scatter plot** and a 31-day rolling mean as a **solid red line**.
- **Data Scope**: Spans 4 years (2012-2015), containing ~1,461 data points.
- **Layout**: Wide aspect ratio allows the seasonal sine-wave pattern to stretch out comfortably. Points are distinct with minimal overplotting.
- **Narrative**: clearly communicates seasonal temperature fluctuations and outliers against the smooth average trend.

### Mobile Issues (as seen in `desktop_on_mobile.png`)
- **Overplotting**: Compressing 1,461 data points into a mobile width (~350px) results in a solid blob of color rather than distinct scatter points. The "scatter" nature is lost.
- **Information Loss**: The red rolling mean line is obscured by the dense scatter points.
- **Aspect Ratio Distortion**: The peaks and valleys become extremely steep, making the temperature changes look more drastic than they are.
- **Interaction**: Touching a specific date to get the exact temperature is impossible due to density ("Fat-finger problem").

## 2. High-Level Strategy

To solve the **High Graphical Density** problem on mobile while preserving the ability to see both the multi-year trend and the daily variance, I propose a **"Zoom & Filter" Strategy** using the **L1 Data Model** actions.

We cannot show all individual dots for 4 years on one mobile screen effectively. Therefore, the UI will offer two modes:
1.  **Trend Mode (All Years)**: Shows *only* the rolling mean line for the full dataset. This preserves the L1 Narrative of long-term climate patterns.
2.  **Detail Mode (Yearly View)**: Allows the user to select a specific year (Tabs/Dropdown). This reduces the data density by 75%, allowing the scatter points to be rendered clearly, restoring the original visual encoding intention.

## 3. Design Action Space Plan

### L0: Visualization Container
- **Action: Rescale (Aspect Ratio)**
    - **Reasoning**: The desktop chart is wide. On mobile, we will increase the relative height (e.g., aspect ratio 4:3 or 1:1) to allow the temperature variance (Y-axis) to "breathe" without being squashed.
- **Action: Reposition**
    - **Reasoning**: Use full container width with minimal padding to maximize data area.

### L1: Data Model
- **Action: Recompose (Filter/Slice)**
    - **Reasoning**: To solve the overplotting of 1400+ points. We will implement a **Year Selector (Tabs)** (2012, 2013, 2014, 2015). When a year is selected, the chart only renders that year's data.
- **Action: Recompose (Aggregate)** (For "Trend" View)
    - **Reasoning**: When viewing "All Years", we will remove the scatter points and only show the Rolling Mean Line to reduce visual noise.

### L1: Interaction Layer & L2 Feedback
- **Action: Reposition (Fix Tooltip Position)**
    - **Reasoning**: Standard floating tooltips are blocked by fingers on mobile. We will use a **Fixed Legend/Tooltip Header** at the top of the card that updates as the user scrubs across the chart.
- **Action: Recompose (Replace Trigger)**
    - **Reasoning**: Replace `hover` with `touch/drag` (Scrubbing). Recharts `activeDot` and `Tooltip` cursor will serve as the crosshair guide.

### L2: Chart Components (Data Marks)
- **Action: Rescale (Marks)**
    - **Reasoning**: The scatter points (Circles) need to be smaller (e.g., radius 2px) to look elegant on mobile.
- **Action: Recompose (Change Encoding)**
    - **Reasoning**: To differentiate the "Raw Data" (Points) from "Trend" (Line). The Points will be semi-transparent blue (glassy look), and the Line will be a vibrant, glowing red to stand out, matching the original's color semantics but with better aesthetics.

### L3: Axes & Ticks
- **Action: Decimate Ticks (L5)**
    - **Reasoning**: Showing every month label for a year is crowded.
    - **Plan**: Show ticks every 2 or 3 months (e.g., Jan, Apr, Jul, Oct) to maintain readability.
- **Action: Format Ticks (L5)**
    - **Reasoning**: Use short month names (Jan, Feb) to save horizontal space.
- **Action: Remove Axis Line/Gridlines (L4/L3)**
    - **Reasoning**: Remove vertical gridlines to reduce clutter. Keep subtle horizontal gridlines for Y-axis reference. Remove the distinct axis "Line" to create a modern, open feel.

### L3: Legend
- **Action: Reposition**
    - **Reasoning**: Move from the side (desktop default) to the **Top Header** of the component. This aligns with the "Fixed Tooltip" strategy.

## 4. Data Extraction & Processing

The original HTML contains raw daily data. The "Rolling Mean" (red line) was generated dynamically by Vega-Lite's `transform` property (`window: [{"op": "mean", "field": "temp_max", "as": "rolling_mean"}], "frame": [-15, 15]`).

I must replicate this data processing in the React component before rendering.

**Steps:**
1.  **Extract Raw Data**: Copy the `datasets['data-...']` array from the source.
2.  **Calculate Rolling Mean**:
    - Iterate through the data array.
    - For each date index `i`, collect `temp_max` values from index `i-15` to `i+15`.
    - Handle edge cases (start/end of array) by ignoring out-of-bounds indices.
    - Calculate average and inject a new field `rolling_mean` into the data object.
3.  **Grouping**:
    - Create a helper to group data by `date`'s year (2012, 2013, 2014, 2015) for the "Detail Mode" tabs.

## 5. Summary of Mobile Components

1.  **Header**: Title ("Max Temperature History") + Year Tabs (All | 2012 | 2013 | ...).
2.  **Data Display (Fixed Tooltip)**: A dynamic area showing "Date: [Scrubbed Date] | Temp: [Val] | Avg: [Val]".
3.  **Main Chart Area**:
    - Responsive Recharts `ComposedChart`.
    - **XAxis**: Decimated date ticks.
    - **YAxis**: Temperature.
    - **Scatter**: Daily `temp_max` (Blue, Opacity 0.6).
    - **Line**: Calculated `rolling_mean` (Red, Stroke Width 2, Dot=False).
    - **Tooltip**: `cursor={{ stroke: 'white' }}` (Lucide style vertical line).
4.  **Style**: Tailwind classes for Glassmorphism (bg-white/10, backdrop-blur), rounded corners, and lucid typography.