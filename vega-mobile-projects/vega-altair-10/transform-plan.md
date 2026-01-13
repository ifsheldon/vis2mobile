# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Characteristics
- **Type**: Box Plot.
- **Data Encoding**: 
    - **X-axis**: Age groups (Ordinal: 0, 5, 10, ... 90).
    - **Y-axis**: Population (Quantitative: 0 to ~14,000,000).
- **Visual Elements**: Standard boxplot markers showing Min, Q1, Median, Q3, and Max values for population distribution within each age group.
- **Appearance**: Vertical bars. Clean white background. Standard Vega-lite blue.

### Mobile Rendering Issues (Desktop_on_Mobile)
- **Aspect Ratio Mismatch**: The chart is landscape-oriented. When squeezed into a portrait mobile screen, the bars become incredibly thin, or the chart becomes too short to see details.
- **Label Crowding**: The X-axis labels (Age) are tightly packed. On a narrow screen, they would likely overlap or require rotation, reducing readability.
- **Touch Target Size**: The individual boxplots are too narrow for reliable finger tapping to see details.
- **Vertical Space Waste**: The large Y-axis numerical labels (e.g., 10,000,000) take up significant horizontal space, compressing the actual data visualization area.

## 2. Vis2Mobile Design Action Plan

### Strategic Goal
Transform the vertical, crowded boxplot into a **scrollable horizontal list-view visualization**. This leverages natural vertical scrolling on mobile devices to accommodate the ~19 age categories comfortably without squeezing.

### Action Space & Reasoning

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L2 Coordinate System** | **Coordinate System** | **Transpose (Axis-Transpose)** | **CRITICAL ACTION**. Rotate the chart 90 degrees. <br>Old: X=Age, Y=Pop. <br>New: Y=Age (List), X=Pop (Bar length). <br>This solves the width constraint issues. A vertical list of age groups is much easier to read and scroll through on mobile than horizontal columns. |
| **L0 Container** | **Visualization Container** | **Rescale (Fluid Height)** | Instead of a fixed aspect ratio, the container height should grow dynamically based on the number of Age categories (`data.length * rowHeight`). This ensures every boxplot has sufficient vertical breathing room (~50px height). |
| **L3 Axes** | **Axis Line/Ticks** | **Recompose (Remove/Simplify)** | Remove the gridlines to reduce visual noise. Format the Population axis (now X-axis) to use abbreviations (e.g., "10M" instead of "10,000,000") to save space. |
| **L5 Interaction** | **Triggers** | **Recompose (Replace)** | Replace `hover` with `click/tap`. Mobile users cannot hover. Tapping a row should trigger a detailed view. |
| **L5 Interaction** | **Feedback** | **Reposition (Fix)** | Use a **Fixed Bottom Sheet** or **Detail Card** to show the specific statistics (Min, Q1, Median, Q3, Max) when a user taps a specific age group. Floating tooltips block the finger. |
| **L2 Data Marks** | **Mark Instance** | **Rescale (Mark Width)** | Increase the thickness of the boxplots. Since we are switching to a vertical list layout, the "height" of the bar (now horizontal thickness) can be thicker to serve as a better touch target. |
| **L3 Title** | **Title Block** | **Recompose (Add)** | The original lacks a descriptive title. Add "Population Distribution by Age" and a subtitle context to improve the Narrative Layer. |

## 3. Data Extraction & Processing

The original HTML uses a JSON URL. I must fetch and aggregate this data because Recharts expects pre-calculated statistics for boxplots, whereas Vega-Lite calculated them on the fly.

**Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/population.json`

**Processing Logic**:
1.  **Fetch**: Get raw array of objects `{ year, age, sex, people }`.
2.  **Group**: Group data by `age`.
3.  **Aggregate**: For each `age` group, extract the array of `people` values.
4.  **Calculate Stats**:
    -   Sort the `people` array numerically.
    -   **Min**: 0th percentile.
    -   **Q1**: 25th percentile.
    -   **Median**: 50th percentile.
    -   **Q3**: 75th percentile.
    -   **Max**: 100th percentile.
5.  **Output Structure**:
    ```typescript
    interface ProcessedData {
      age: string | number; // Category
      min: number;
      q1: number;
      median: number;
      q3: number;
      max: number;
    }
    ```

## 4. Implementation Steps

### Step 1: Data Acquisition & Logic
- Create a utility function to fetch the JSON data.
- Implement the Quartile calculation logic (using d3-array or custom helper) to transform raw records into Boxplot statistics.

### Step 2: Component Skeleton
- **Container**: Use a mobile-width constrianed container (max-w-md mx-auto) with a dark/glassmorphism theme.
- **Header**: Add Title "Population Distribution" and Subtitle "Analysis by age group".
- **Interaction State**: Create a React state `selectedData` to hold the stats of the currently tapped age group.

### Step 3: Visualization (Recharts)
- Use `<ComposedChart layout="vertical">` to achieve the transposed look.
- **XAxis**: Type="number", formatter="10M". Hide axis line, keep subtle ticks.
- **YAxis**: Type="category", dataKey="age". Ensure readable font size (12-14px).
- **Custom Shape**: Recharts does not have a native `BoxPlot` component that looks good out of the box.
    - Implement a **Custom Shape** component passed to a `<Bar>` or `<Customized>` component.
    - This shape will draw:
        1.  A horizontal line from `min` to `max` (Whisker).
        2.  A rectangle from `q1` to `q3` (Box).
        3.  A vertical line at `median`.
- **Styling**: Use a gradient fill for the Box (e.g., Cyan to Blue) to make it pop against a dark background.

### Step 4: Detail View (Interaction)
- Implement a **"Selected Info" Card** at the bottom of the screen (sticky or inline below chart).
- When a user taps a bar:
    - Highlight the selected bar (opacity change on others).
    - Display the exact numbers for Min, Q1, Median, Q3, Max in the Detail Card using a grid layout.
- If nothing is selected, display summary text or "Tap a group for details".

### Step 5: Refinement
- **Typography**: Use standard Tailwind sans fonts, bold for values, muted for labels.
- **Animation**: Add simple entry animations for the bars.
- **Accessibility**: Add aria-labels to the list items describing the median value.