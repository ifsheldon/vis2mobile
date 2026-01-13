# Vis2Mobile Transformation Plan: Global Natural Disasters

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Bubble Plot (categorized by Entity on Y-axis, Time on X-axis).
- **Data Dimensions**:
    - **X-Axis**: Year (Temporal, 1900-2018).
    - **Y-Axis**: Entity (Nominal, ~7-8 categories like Earthquake, Flood, etc.).
    - **Size**: Deaths (Quantitative, range 0 - 2500+).
    - **Color**: Entity (Nominal, redundant encoding with Y-position).
- **Interactions**: Tooltip on hover (Entity, Year, Deaths).
- **Layout**: Wide aspect ratio. All years are visible simultaneously.

### Mobile Rendering Issues (Desktop on Mobile)
- **Aspect Ratio Mismatch**: The 118-year timeline is squashed horizontally, making individual bubbles indistinguishable.
- **Label Overlap**: Y-axis labels (Disaster types) consume ~30% of the screen width, leaving little room for data.
- **Touch Targets**: Tiny bubbles are impossible to tap accurately.
- **Readability**: The text size for years and axes is illegible when scaled down.

## 2. High-Level Design & Reasoning

To transform this into a premium mobile-first experience, we must abandon the "wide" timeline approach. A mobile screen is a vertical medium.

**Core Strategy: Transpose & Scroll**
We will **Transpose** the chart. The Timeline (Years) will move to the Y-axis (vertical), allowing the user to scroll naturally through history (like a social media feed). The Disaster Types (Entities) will move to the X-axis (horizontal).

**Addressing Horizontal Space**
Even with transposition, fitting 8 text labels (e.g., "Extreme temperature") horizontally is impossible. We will replace text axis labels with **Iconography** (using Lucide React icons) and use a "Sticky Header" for the legend/column headers.

**Interaction Model**
Hover is replaced by **Click/Tap**. Tapping a bubble triggers a **Glassmorphism Bottom Sheet** (Drawer) displaying the detailed death count and context, rather than a floating tooltip which obscures data under the finger.

## 3. Detailed Action Space Plan

Based on the `mobile-vis-design-action-space.md`, here are the specific actions:

### **L2 坐标系层 (Coordinate System)**
1.  **Transpose (Axis-Transpose)**:
    -   *Action*: Swap X and Y axes.
    -   *Reasoning*: Mobile users scroll vertically. Mapping Time to the vertical Y-axis allows us to render the full 118-year history without squashing the data.
    -   *Result*: Y-axis = Year, X-axis = Entity Categories.

### **L0 可视化容器 (Visualization Container)**
2.  **Rescale (Scroll)**:
    -   *Action*: Set container height to `auto` (or a very large pixel value calculated by `YearRange * PixelsPerYear`) inside a native scroll container.
    -   *Reasoning*: Prevents "Overplotting". We give the data the space it needs.

### **L3 坐标轴 (Axes)**
3.  **Recompose (Replace)** [X-Axis Labels]:
    -   *Action*: Replace text labels ("Earthquake", "Flood") with Lucide Icons.
    -   *Reasoning*: "Extreme temperature" is too long. An icon + color code saves horizontal space.
4.  **Recompose (Remove)** [Axis Lines/Ticks]:
    -   *Action*: Remove standard axis lines and ticks. Use a subtle grid background.
    -   *Reasoning*: Reduces visual clutter (High graphical density).

### **L2 数据标记 (Data Marks)**
5.  **Rescale (Mark Size)**:
    -   *Action*: Increase the minimum radius of bubbles.
    -   *Reasoning*: Solves "Fat-finger problem". Even small data points need a minimum tappable area.
6.  **Recompose (Change Encoding)**:
    -   *Action*: Ensure Color maps strictly to Entity (Column) to reinforce the column structure.

### **L2 交互层 (Interaction Layer)**
7.  **Recompose (Replace)** [Triggers]:
    -   *Action*: Change `hover` to `click`.
    -   *Reasoning*: Mobile devices do not support hover.
8.  **Reposition (Fix)** [Feedback]:
    -   *Action*: Use a fixed-position "Bottom Sheet" or "Detail Card" for selected data instead of a floating tooltip.
    -   *Reasoning*: Floating tooltips get blocked by the user's hand. A fixed bottom card offers a premium feel.

### **L2 标题块 (TitleBlock)**
9.  **Recompose (Move/Collapse)**:
    -   *Action*: Move the subtitle into an "Info" modal or collapsed state. Simplify the main title to "Disaster History".
    -   *Reasoning*: Saves vertical screen real estate for the actual data.

## 4. Data Extraction Plan

The data is externally hosted. We need to fetch and process it.

**Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/disasters.csv`

**Script Logic (to be implemented in component)**:
1.  Fetch CSV data.
2.  Parse CSV.
3.  **Filter**: Remove "All natural disasters" entity (as per the original Vega spec transform).
4.  **Mapping**:
    -   Map `Entity` strings to specific Lucide Icons (e.g., 'Earthquake' -> `<Activity />`, 'Flood' -> `<Waves />`).
    -   Map `Entity` to a specific color palette.
5.  **Sorting**: Sort by Year descending (Newest first) for the vertical scroll.

## 5. Implementation Steps

1.  **Setup Component Structure**:
    -   Create `DisasterTimeline.tsx`.
    -   Initialize state for `selectedData` (for the bottom sheet).

2.  **Data Fetching & Processing**:
    -   Implement a `useEffect` to fetch the CSV.
    -   Transform data: `Array<{ entity: string, year: number, deaths: number, color: string, icon: IconNode }>`.
    -   Define a `CATEGORY_CONFIG` map linking Entity names to Colors and Icons.

3.  **Layout Construction (The Transposed Grid)**:
    -   *Note*: While Recharts is requested, a standard ScatterChart might struggle with a custom Icon header layout and infinite vertical scroll perfectly.
    -   *Hybrid Approach*: Use a CSS Grid/Flex layout for the container.
        -   **Header**: Sticky row with Icons representing the X-axis categories.
        -   **Body**:
            -   Use Recharts `<ScatterChart>` but rotated?
            -   *Better for Vertical Scroll*: Since Recharts is hard to make "infinitely scrollable" with native touch momentum, we will calculate the height based on `(MaxYear - MinYear) * StepHeight`.
            -   Set `layout="vertical"` in Recharts ScatterChart.
            -   XAxis = Type (Categorical -> converted to Number index 0-7).
            -   YAxis = Year (Number, reversed domain so 2017 is top).

4.  **Visual Styling (Tailwind)**:
    -   Background: Dark/Glassmorphism theme.
    -   Bubbles: `fill-opacity-80`, `stroke-width-0`.
    -   Bottom Sheet: `fixed bottom-0 w-full backdrop-blur-md bg-white/10`.

5.  **Refinement**:
    -   Add a "Year" indicator that sticks or floats as user scrolls? Or just let the Y-axis handle it.
    -   Ensure the `ZAxis` (Bubble size) scale is adjusted so maximum deaths don't overlap columns.

This plan ensures the visualization is readable (vertical scroll), interactive (tappable), and aesthetically premium (glassmorphism/icons) while strictly adhering to real data.