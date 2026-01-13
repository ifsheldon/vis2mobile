# Vis2Mobile Transformation Plan: Unemployment Stacked Area Chart

## 1. Analysis of Original Visualization

### Source Analysis
- **Type**: Normalized Stacked Area Chart (100% Stacked).
- **Data**: Unemployment statistics across various industries over time.
- **X-Axis**: Time (`yearmonth` field). Labels are years (`%Y`).
- **Y-Axis**: Normalized count (sum of unemployment). No visible axis labels in the original, relying on the visual proportion.
- **Color**: Encodes `series` (Industry) using the `category20b` scheme (high cardinality, ~20 colors).
- **Interactivity**: None specified in the static view, but Vega-Lite usually has basic tooltips.

### Mobile Challenges (Desktop on Mobile)
1.  **High Graphical Density**: With ~20 industries stacked, small screen width makes the time slices very narrow, making individual changes hard to track.
2.  **Color Chaos**: 20 distinct colors are difficult to distinguish and reference against a legend on a small screen.
3.  **Missing Legend**: The screenshot implies the legend is either missing or would be pushed to the side, compressing the chart width to an unusable size.
4.  **Touch Accuracy**: Tapping a specific thin sliver of color (e.g., a small industry) is physically difficult (the "Fat-finger problem").
5.  **Context Loss**: Without Y-axis labels (0%, 50%, 100%), a mobile user might not realize this is a normalized ratio chart, mistaking it for absolute volume.

## 2. Vis2Mobile Design Action Plan

I will transform this into a **Interactive Normalized Stacked Area Component**. The focus is on making the dense data navigable through touch.

### L0: Visualization Container
*   **Action: `Rescale`**
    *   **Reason**: The original fixed width/height (300x200) is too small for modern high-DPI phones but the aspect ratio is okay. I will set the container to `width: 100%` and a fixed height (e.g., `h-72` or `300px`) to maximize horizontal space for the timeline.

### L1: Data Model
*   **Action: `Recompose (Aggregate/Pivot)`**
    *   **Reason**: The raw data is likely in "long" format (one row per industry per month). Recharts requires "wide" format (one row per date, keys for each industry). I must pivot the data.
    *   **Note**: I will calculate the percentage share for each industry per month during data processing to drive the custom tooltip, even though Recharts handles the visual stacking.

### L1: Interaction Layer & L2: Features
*   **Action: `Recompose (Replace)` (Triggers)**
    *   **Reason**: Replacing `hover` with `touch/drag` (Scrubbing). Users will drag their finger across the chart to see the breakdown for a specific date.
*   **Action: `Reposition (Fix)` (Feedback/Tooltip)**
    *   **Reason**: A floating tooltip covers the dense graph. I will use an **Externalized Data Card** positioned *below* the chart or a sticky header *above* it that updates dynamically as the user scrubs the timeline. This ensures the visual data is never obscured.

### L2: Data Marks (The Area Chart)
*   **Action: `Set Focus` (Narrative)**
    *   **Reason**: With ~20 categories, the chart is busy. I will implement a "Focus Mode". Tapping the chart locks the timeline. Tapping a legend item highlights that specific industry (opacity 1) and dims the others (opacity 0.3).

### L3: Axis & Gridlines
*   **Action: `Decimate Ticks` (X-Axis)**
    *   **Reason**: To prevent label overlap on narrow screens, I will dynamically calculate tick intervals (e.g., show every 2 or 5 years) or rely on Recharts' responsive tick handling.
*   **Action: `Recompose (Add)` (Y-Axis)**
    *   **Reason**: The original has no Y-axis. I will add very subtle gridlines at 0%, 50%, and 100% to reinforce the "Part-to-Whole" relationship, which is often lost on mobile.

### L3: Legend
*   **Action: `Reposition` & `Compensate (Scroll)`**
    *   **Reason**: A static list of 20 items consumes the entire screen.
    *   **Plan**: Move the legend below the chart. Use a **Horizontal Scrollable List (Carousel)** of "Pills".
    *   **Interaction**: Tapping a pill acts as a filter/highlighter for the chart.

## 3. Data Extraction Strategy

The original HTML uses a JSON URL. I will write a script/utility to fetch and process this real data.

1.  **Source**: `https://vega.github.io/editor/data/unemployment-across-industries.json`
2.  **Raw Format**:
    ```json
    [
      {"series": "Government", "year": 2000, "month": 1, "count": 430, "date": "2000-01-01..."},
      ...
    ]
    ```
3.  **Transformation (in `Visualization.tsx` or utility)**:
    *   Fetch the JSON.
    *   Identify all unique `series` keys (Industries) to generate the color palette.
    *   Pivot data to:
        ```typescript
        interface ChartData {
          date: string; // "2000-01"
          displayDate: string; // "Jan 2000"
          [industryName: string]: number; // count
        }
        ```
    *   *Note*: The "normalized" aspect is handled visually by Recharts using `stackOffset="expand"`.

## 4. Implementation Steps

1.  **Setup Component Structure**:
    *   Create `src/components/UnemploymentChart.tsx`.
    *   Create a "Card" wrapper with glassmorphism styling (`backdrop-blur`, `bg-opacity`, `border`).

2.  **Data Fetching & Processing**:
    *   Implement a `useEffect` to fetch the JSON.
    *   Implement the `pivotData` function to transform the array into the wide format Recharts expects.
    *   Generate a color map. Since the original uses `category20b`, I will create a constant array of 20 hex codes that match or improve upon the original aesthetics (using a distinct, accessible palette).

3.  **Chart Implementation (Recharts)**:
    *   Use `<ResponsiveContainer>` for L0 resizing.
    *   Use `<AreaChart>` with `stackOffset="expand"` for the normalized effect.
    *   Map through the list of industries to create `<Area>` components.
    *   Apply `isAnimationActive` for smooth transitions.

4.  **Mobile Interaction Logic**:
    *   **Custom Tooltip**: Create a component that sits *outside* the `AreaChart` (or overlays at the top). It displays the Date and a sorted list of the Top 5 industries for that specific month (sorting by percentage share).
    *   **Scrubbing**: Ensure the chart handles `onMouseMove` (which maps to touch drag on mobile) to update the external tooltip state.

5.  **Legend Implementation**:
    *   Build a horizontal scroll container (`overflow-x-auto`) below the chart.
    *   Render "pills" for each industry with their color dot.
    *   Add state `activeSeries`: When a pill is clicked, pass a prop to the Chart to dim non-active Areas.

6.  **Styling & Polish**:
    *   Apply Tailwind classes for typography (Inter font).
    *   Add a title and subtitle: "Industry Unemployment Distribution (Normalized)".
    *   Ensure dark mode compatibility (optional but good for premium feel).

## 5. Justification for Deviations

*   **Adding Y-Axis Gridlines**: The original didn't have them. I am adding them (subtly) because on mobile, context is harder to maintain. Knowing where the "50%" line is helps users gauge dominance of sectors.
*   **External Tooltip**: The original Vega tooltip likely floats. On mobile, floating tooltips are bad UX (finger occlusion). I am moving this data to a fixed position for readability.