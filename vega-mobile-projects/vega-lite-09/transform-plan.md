# Mobile Transformation Plan: Distribution of Frame Render Time

## 1. Analysis of Original Visualization

### Source Analysis
- **Type**: Variable-width Histogram (generated via Vega-Lite).
- **Data**: Distribution of frame render times (ms) mapped to FPS.
- **X-Axis**: Frame render time in milliseconds (`startTime` to `endTime`), but labeled as FPS (Calculated as `1000/ms`). The axis scale is non-linear/ordinal based on specific bins.
- **Y-Axis**: Residency (Percentage of time spent in that state).
- **Visual Encoding**:
    - **Width of bar**: Represents the duration interval (e.g., 16.67ms to 33.33ms).
    - **Height of bar**: Represents the `residency` percentage.
- **Data Points** (Extracted):
    - 0-8.33ms (>120 FPS): 0%
    - 8.33-12.5ms (80-120 FPS): 0%
    - 12.5-16.67ms (60-80 FPS): 31.17%
    - 16.67-33.33ms (30-60 FPS): 38.96%
    - 33.33-50.0ms (20-30 FPS): 6.49%
    - 50.0-66.67ms (15-20 FPS): 2.9%
    - 66.67-83.33ms (12-15 FPS): 2.6%
    - 83.33-∞ (<12 FPS): 16.88%

### Mobile Constraints & Issues
1.  **Variable Widths**: On a narrow mobile screen, preserving the physical width proportional to the time interval will result in some bars being extremely thin and hard to tap, while others take up too much space without adding value.
2.  **Labels**: The X-axis labels (FPS) in the original are derived and spaced irregularly. On mobile, these will overlap or require extreme simplification.
3.  **Readability**: Vertical histograms with many bins often suffer from "squashed" columns on mobile.

## 2. Design Action Space & Rationales

To transform this into a premium mobile experience, I will apply the following actions from the **Vis2Mobile Design Action Space**:

### L1 Chart Components / L2 Coordinate System
-   **Action: `Transpose` (Axis-Transpose)**
    -   **Rationale**: Vertical columns consume horizontal space, which is scarce on mobile. By transposing the chart to a **Horizontal Bar Chart**, we can use the vertical scroll (infinite space) to list the categories comfortably. This allows long text labels (e.g., "60-80 FPS") to be legible.
    -   **Change**: X-axis becomes Residency (%), Y-axis becomes Frame Time/FPS Categories.

### L2 Data Marks
-   **Action: `Recompose (Change Encoding)`**
    -   **Rationale**: The original used *bar width* to encode the time interval duration. On mobile, readability of the label is more important than the geometric width of the interval. I will switch to **Standard Height Bars** (equal height for all rows) but include the interval details in the label. This ensures every data point is large enough to interact with (solving the "Fat-finger problem").

### L3 Axes & Ticks
-   **Action: `Simplify labels` (Format Tick Label)**
    -   **Rationale**: Instead of raw millisecond values (0, 8.33, 16.67), I will convert these to user-friendly **FPS Ranges** (e.g., "60 - 80 FPS") for the axis labels. This is much more meaningful to the user than the raw math.

### L2 Features / Interaction
-   **Action: `Reposition (Fix)` (Tooltip)**
    -   **Rationale**: Instead of a hover tooltip (which doesn't exist on touch), I will implement a "Active Card" state. When a bar is tapped, a detailed summary appears, or the specific bar highlights with its exact percentage.

### L0 Visualization Container
-   **Action: `Rescale`**
    -   **Rationale**: Set width to 100% and use a responsive height based on the number of data points to ensure no scrolling within the chart component itself (using the page scroll instead).

## 3. Data Extraction Plan

I will Codify the data from the `values` array in the source HTML.

**Raw Data Mapping Logic:**
1.  **Input**: `startTime` (ms), `endTime` (ms), `residency` (%).
2.  **Transformation**: Calculate FPS Range.
    -   Formula: `FPS = 1000 / ms`.
    -   Example: `startTime: 16.67` -> `1000/16.67 ≈ 60 FPS`.
    -   Example: `endTime: 33.33` -> `1000/33.33 ≈ 30 FPS`.
    -   Label: "30 - 60 FPS".
3.  **Handling Infinity**: `endTime: "∞"` translates to "0 FPS" (or " < 12 FPS").

**Extracted Dataset for Component:**
```json
[
  { "range": "> 120 FPS", "msRange": "0 - 8.33ms", "residency": 0, "color": "gray" },
  { "range": "80 - 120 FPS", "msRange": "8.33 - 12.5ms", "residency": 0, "color": "gray" },
  { "range": "60 - 80 FPS", "msRange": "12.5 - 16.67ms", "residency": 31.17, "color": "blue" },
  { "range": "30 - 60 FPS", "msRange": "16.67 - 33.33ms", "residency": 38.96, "color": "blue" },
  { "range": "20 - 30 FPS", "msRange": "33.33 - 50.0ms", "residency": 6.49, "color": "blue" },
  { "range": "15 - 20 FPS", "msRange": "50.0 - 66.67ms", "residency": 2.9, "color": "blue" },
  { "range": "12 - 15 FPS", "msRange": "66.67 - 83.33ms", "residency": 2.6, "color": "blue" },
  { "range": "< 12 FPS", "msRange": "> 83.33ms", "residency": 16.88, "color": "red" } // Highlight bad performance
]
```
*Note: I will use a color scale where higher residency in low FPS might be warned, or simply use a premium monochrome theme with a highlight color.*

## 4. Implementation Steps

### Step 1: Component Scaffold
-   Create a responsive container using Tailwind (`w-full`, `rounded-xl`, `bg-white/50`, `backdrop-blur`).
-   Add a clean header with the title "Frame Render Distribution".

### Step 2: Data Processing
-   Implement the logic to convert the extracted raw JSON into the "Extracted Dataset" format defined above.

### Step 3: Visualization (Recharts)
-   Use `<ResponsiveContainer>` with a fixed aspect ratio or calculated height.
-   Use `<BarChart layout="vertical">` to achieve the **Transpose** action.
-   **X-Axis**: Type number (Residency %), hide axis line (`Recompose-Remove`).
-   **Y-Axis**: Type category (FPS Range), width mapped to ensure labels fit.
-   **Tooltip**: Custom `Cursor` and `Content` to show precise MS range and percentage.
-   **Bar**: Use a custom shape or standard bar with a gradient fill.

### Step 4: Premium Aesthetics
-   **Typography**: Use distinct font weights. Bold for values, muted for labels.
-   **Color**: Use a vibrant blue for the bars (`bg-blue-500`).
-   **Animation**: Enable Recharts animation for smooth entry.
-   **Layout**: Place the percentage value *inside* or *right next to* the bar for immediate readability without needing the axis.

### Step 5: Mobile Optimizations
-   Ensure touch targets are large enough.
-   Remove grid lines (`Recompose-Remove`) to reduce clutter.
-   Add a summary metric at the top (e.g., "Most frames are 30-60 FPS").

This plan transforms a scientific, desktop-oriented histogram into a user-friendly, list-like performance breakdown suitable for mobile consumption.