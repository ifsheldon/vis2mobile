# Vis2Mobile Planning: Penguin Body Mass Box Plot

## 1. Analysis of Original Visualization

- **Source**: HTML/Vega-Lite.
- **Content**: A vertical box plot displaying the distribution of body mass (g) across three penguin species (Adelie, Chinstrap, Gentoo).
- **Data Attributes**:
    - **X-axis (Categorical)**: Species.
    - **Y-axis (Quantitative)**: Body Mass (g).
    - **Encoding**: Box plots showing Min, Max, Median, and Quartiles. Color is redundantly encoded by Species.
- **Desktop vs. Mobile Assessment**:
    - **Desktop**: The vertical orientation works well on wide screens where horizontal space is abundant.
    - **Mobile Issues**:
        - **Aspect Ratio Mismatch**: Vertical box plots on a narrow mobile screen compress the X-axis. While 3 categories might fit, the bars become very narrow, or the text labels might wrap/shrink.
        - **Interaction**: The original likely relies on hover for exact values, which doesn't exist on mobile.
        - **Visual Density**: Standard box plots can look "clinical" or "academic." The goal is a "Premium Aesthetics" look.

## 2. Vis2Mobile Design & Action Plan

Based on the `mobile-vis-design-action-space.md`, the following actions will be taken to transform the visualization.

### High-Level Strategy
**Transpose and Modernize.** We will convert the vertical box plot into a **Horizontal Box Plot**. This aligns the categorical axis (Species) with the vertical scroll of the mobile device, ensuring labels are horizontal and readable. We will style it using a "Glassmorphism" card aesthetic.

### Specific Actions

#### **L2 Coordinate System (CoordinateSystem)**
*   **Action**: `Transpose (Axis-Transpose)`
    *   **Operation**: `transposeAxes()`
    *   **Reason**: Vertical columns on narrow screens squeeze categorical labels. Transposing to a horizontal layout allows the Species labels ("Adelie", "Chinstrap", "Gentoo") to be listed vertically on the left (Y-axis), providing ample horizontal space for the box plot length (Body Mass) on the X-axis. This prevents "Distorted layout" and "Cluttered text".

#### **L1 Data Model (DataModel)**
*   **Action**: `Recompose (Aggregate)`
    *   **Operation**: Calculate quartiles (Min, Q1, Median, Q3, Max) from the raw data.
    *   **Reason**: Unlike Vega-Lite, Recharts (the target library) does not automatically compute box plot statistics from raw rows. To render the box plot, we must transform the raw penguin data into a summarized format containing the statistical metrics for each species.

#### **L3 Axes (Axes)**
*   **Action**: `Recompose (Remove)` (for Axis Lines)
    *   **Operation**: Remove the axis lines (`axisLine={false}`), keep tick labels.
    *   **Reason**: To achieve a "Premium Aesthetic," we reduce chart junk. The gridlines and alignment are sufficient without heavy axis borders.
*   **Action**: `Rescale` / `Simplify` (for Ticks)
    *   **Operation**: `formatTickLabel()`
    *   **Reason**: Simplify body mass ticks (e.g., "3000" -> "3k" or keep as is if space permits) to ensure they don't crowd the horizontal axis.

#### **L2 Data Marks (DataMarks)**
*   **Action**: `Recompose (Change Encoding)` (Styling)
    *   **Operation**: Custom Shape.
    *   **Reason**: Recharts does not have a native `<BoxPlot>` component. We will use a `<ComposedChart>` with a `<Bar>` component that uses a **Custom Shape**. This shape will draw the "Box" (Q1 to Q3), the "Median" line, and the "Whiskers" (Min/Max).
*   **Action**: `Rescale` (Visual Weight)
    *   **Reason**: Make the boxes thicker and use vibrant gradients or glassmorphic fills to stand out against a dark background.

#### **L2 Feedback (Feedback)**
*   **Action**: `Reposition (Fix)` & `Recompose (Replace)`
    *   **Operation**: `Fix tooltip position` or Custom Legend/Info.
    *   **Reason**: Replace hover tooltips with a custom `Cursor` or a `Click` trigger that updates a fixed information block (e.g., a "Summary Card" at the bottom or top of the chart) showing the specific stats (Min, Median, Max) for the selected species.

#### **L3 Title Block (TitleBlock)**
*   **Action**: `Rescale` / `Reposition`
    *   **Reason**: Move the title "Body Mass by Species" to a clean header component outside the SVG chart area.

## 3. Data Extraction Plan

Since I cannot fetch the external URL (`https://vega.github.io/editor/data/penguins.json`) during the build time of the component without a backend, I will use **real statistical data** derived from the Palmer Penguins dataset.

**Target Data Structure for Component:**

I will aggregate the known dataset values into this structure for the React component:

```typescript
// Box Plot Statistics (in grams)
const data = [
  {
    species: "Adelie",
    min: 2850,
    q1: 3350,
    median: 3700,
    q3: 4000,
    max: 4775,
    color: "#06b6d4", // Cyan
  },
  {
    species: "Chinstrap",
    min: 2700,
    q1: 3487,
    median: 3700,
    q3: 3950,
    max: 4800,
    color: "#8b5cf6", // Violet
  },
  {
    species: "Gentoo",
    min: 3950,
    q1: 4700,
    median: 5000,
    q3: 5500,
    max: 6300,
    color: "#f43f5e", // Rose
  }
];
```

## 4. Implementation Steps

1.  **Setup Component Shell**: Create `src/components/Visualization.tsx` with a responsive container using Tailwind (glassmorphism background).
2.  **Implement Custom Box Shape**: Create a Recharts custom shape function that takes `x`, `y`, `width`, `height` (from the Bar component) and the payload (stats) to draw:
    -   A horizontal line for the range (Min to Max).
    -   Vertical "whisker" caps at Min and Max.
    -   A rectangle for the IQR (Q1 to Q3).
    -   A strong vertical line for the Median.
3.  **Construct Chart**:
    -   Use `ComposedChart` with `layout="vertical"`.
    -   **X-Axis**: Type="number", domain specific (e.g., `[2500, 6500]`) to focus the view.
    -   **Y-Axis**: Type="category", dataKey="species".
    -   **Bar**: Connect the custom shape to the data.
4.  **Add Interactivity**:
    -   Implement a custom Tooltip that renders a nice card showing the exact statistics when a bar is tapped.
5.  **Styling**: Apply Lucide icons for context, use Tailwind for typography and layout. Ensure high contrast text.