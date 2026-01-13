# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization
*   **Source**: A Vega-Lite Boxplot visualizing the distribution of population sizes across different age groups.
*   **Data**: `population.json` containing `age`, `people`, `sex`, and `year`.
*   **Dimensions**:
    *   **X-Axis (Desktop)**: Age (Ordinal/Binned: 0, 5, 10... 90).
    *   **Y-Axis (Desktop)**: People (Quantitative).
    *   **Mark**: Boxplot (Min, Q1, Median, Q3, Max).
*   **Desktop Issues on Mobile**:
    *   **Aspect Ratio Mismatch**: The desktop chart is wide. Compressing ~19 age categories into a mobile portrait width results in needle-thin boxes that are impossible to read or interact with.
    *   **Label Crowding**: X-axis labels (0, 5, 10...) will overlap or become microscopic.
    *   **Touch Targets**: The "whiskers" and thin boxes are too small for touch interaction ("Fat-finger problem").
    *   **Y-Axis Readability**: Large numbers (12,000,000) take up significant screen width if placed on the left, compressing the chart further.

## 2. High-Level Design Strategy
The core transformation strategy is **Transposition (Rotation)**. By swapping the axes, we utilize the natural vertical scrolling behavior of mobile devices. The Age groups will be listed vertically (infinite scroll if necessary), and the population value distribution will extend horizontally. This guarantees readable text and touch-friendly target sizes.

## 3. Design Action Space & Reasoning

### L0: Visualization Container
*   **Action**: `Rescale` & `Reposition`.
*   **Reason**: Change from a fixed pixel width to `w-full` with a responsive height tailored to the number of data points. We will likely need a tall container (e.g., `h-[800px]` or dynamic based on data length) inside a scrollable view to accommodate the transposed layout comfortably.

### L2: Coordinate System
*   **Action**: `Transpose (Axis-Transpose)`.
*   **Reason**: Converting the Vertical Boxplot to a **Horizontal Boxplot**.
    *   *Before*: X=Age, Y=People.
    *   *After*: Y=Age (Vertical list), X=People (Horizontal length).
    *   *Justification*: Solves the density problem. Age labels (0, 5, 10...) become row headers which are easy to read.

### L3: Axes & Gridlines
*   **Action**: `Recompose (Remove)` (Axis Lines).
    *   Hide the main axis lines to reduce visual noise.
*   **Action**: `Recompose (Remove)` (Gridlines).
    *   Remove vertical gridlines to maintain a clean "Glassmorphism" look.
*   **Action**: `Simplify labels` (X-Axis/Population).
    *   Format ticks as "2M", "4M", "10M" instead of full numbers to save horizontal space.

### L2: Data Marks (The Boxplot)
*   **Action**: `Rescale`.
    *   Increase the thickness (height in transposed view) of the boxes to roughly 20px-30px to ensure they are tappable.
*   **Action**: `Recompose (Change Encoding)` (Implementation Detail).
    *   Since Recharts doesn't have a native "Boxplot" component, we will construct it using a **ComposedChart**:
        *   **Bar**: Represents the Interquartile Range (Q1 to Q3).
        *   **Custom Shape/Lines**: Represents the Whiskers (Min to Q1, Q3 to Max) and the Median line.
*   **Action**: `Recompose (Remove)` (Outliers).
    *   To keep the mobile view clean, we will focus on the main distribution (Min-Max extent) as per the original Vega spec `extent: "min-max"`, avoiding plotting individual outlier dots unless critical.

### L1: Narrative Layer
*   **Action**: `Reposition` (Title).
    *   Move title to a dedicated header section with large, bold typography suitable for mobile.

### L5: Interaction
*   **Action**: `Recompose (Replace)` (Hover $\to$ Click).
    *   Replace hover tooltips with a "Click to Select" interaction.
*   **Action**: `Reposition (Fix)` (Feedback).
    *   When a user taps a specific Age row, display the detailed statistics (Min, Max, Median, Q1, Q3) in a **Fixed Detail Card** at the bottom of the screen or a sticky header, rather than a floating tooltip that might be blocked by the finger.

## 4. Data Extraction & Processing Plan

The original visualization uses a URL (`population.json`). We must fetch or simulate this data and **pre-process it for the boxplot**, as Recharts requires calculated stats.

1.  **Source Data**: `[{ age: 0, sex: 1, people: 1000, year: 1850 }, ...]`
2.  **Processing Logic**:
    *   Group data by `age`.
    *   For each `age` group, extract the array of `people` values.
    *   Calculate Statistics:
        *   `min`: Minimum value.
        *   `q1`: 25th percentile.
        *   `median`: 50th percentile.
        *   `q3`: 75th percentile.
        *   `max`: Maximum value.
    *   *Note*: The original Vega spec uses `extent: 'min-max'`, so we don't need fancy outlier calculations (1.5 * IQR). Just pure min/max.

## 5. Implementation Steps

1.  **Data Utility**: Create a function to parse the provided raw data (or a representative hardcoded subset if fetching is blocked) and transform it into the `BoxPlotData[]` format:
    ```typescript
    type BoxPlotData = {
      age: number;
      min: number;
      q1: number;
      median: number;
      q3: number;
      max: number;
    }
    ```
2.  **Component Skeleton**:
    *   Create a clean mobile container with a dark/modern theme (Slate-900 bg).
    *   Add Title: "Population Distribution".
    *   Add Subtitle: "By Age Group".
3.  **Chart Implementation**:
    *   Use Recharts `ComposedChart` with `layout="vertical"`.
    *   **Y-Axis**: `dataKey="age"`, type="category".
    *   **X-Axis**: `type="number"`, formatter abbreviating millions (e.g., `(val) => val / 1000000 + 'M'`).
    *   **Rendering the Box**:
        *   Use a `Bar` component for the range Q1 to Q3. The `barSize` should be generous (~24px).
        *   The tricky part: Boxplots in Recharts usually require a trick. We can use a `Bar` for the Q1-Q3 range. For the median and whiskers, we might need a `CustomShape` on the Bar or use `ErrorBar` heavily customized.
        *   *Simpler Approach for Stability*: Use a stacked bar approach or a custom shape passing all 5 coordinates.
        *   *Decision*: Use `Bar` with a **Custom Shape**. The custom shape will receive the data point and draw the rectangle (Q1-Q3), the median line, and the horizontal whisker lines (Min, Max).
4.  **Styling & Polish**:
    *   Use Tailwind for "Premium Aesthetics": Gradient backgrounds, rounded corners on the container, subtle borders.
    *   Typography: Inter or standardized sans-serif.
5.  **Interaction**:
    *   Add `activeBar` or `onClick` handler to the Chart.
    *   State variable `selectedData`.
    *   Render a "Summary Card" component below the chart that shows the exact numbers when a bar is tapped.

## 6. Summary of Mobile Adaptation
*   **Layout**: Transposed (Vertical List).
*   **Interactivity**: Tap-to-view details (No hover).
*   **Visuals**: Custom Shape Boxplot, Dark Mode optimized, simplified axis labels.