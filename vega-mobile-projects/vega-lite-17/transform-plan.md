# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Details
- **Type**: Pie Chart.
- **Data Source**: Embedded JSON in HTML (`spec.data.values`). Contains 6 categories (1-6) with integer values.
- **Current Layout**: Horizontal layout. Chart on the left, Legend on the right.
- **Interaction**: Vega-Lite default tooltips on hover.

### Mobile Issues (Desktop vs. Mobile Render)
1.  **Aspect Ratio Mismatch**: The side-by-side layout (Chart + Legend) compresses the chart horizontally when rendered on a portrait mobile screen, making the pie chart tiny and reducing the clickable area.
2.  **Small Touch Targets**: The legend items and pie slices are too small for reliable finger tapping.
3.  **Hover Dependency**: The "tooltip: true" feature relies on mouse hover, which does not exist on mobile devices.
4.  **Readability**: The font size of the legend is relatively small when scaled down.

## 2. High-Level Design Strategy

The core strategy is to switch from a **Horizontal** layout to a **Vertical Stacked** layout. We will transform the standard Pie Chart into a **Interactive Donut Chart** to elevate aesthetics and utilize the center space for data summary.

### Design Philosophy
- **Premium Aesthetics**: Use a "Glassmorphism" card style, a vibrant but harmonious color palette (moving away from the default Vega colors), and smooth layout transitions.
- **Thumb-Friendly**: Move the legend to the bottom (easier to reach) and ensure pie slices are large enough to tap.
- **Focus & Context**: Instead of transient tooltips, we will use a "Selected State" where tapping a slice updates a fixed information block (either in the center of the donut or a card at the bottom).

## 3. Design Action Space & Reasoning

Based on the `mobile-vis-design-action-space.md`, here are the specific actions planned:

### L0: Visualization Container
*   **Action**: `Rescale` (Fit Width)
    *   **Reasoning**: The container must use `width: 100%` and `min-height` to fill the mobile width, abandoning the fixed pixel width of the desktop version to prevent horizontal scrolling.

### L3: Legend Block
*   **Action**: `Reposition` (Right $\to$ Bottom)
    *   **Reasoning**: Moving the legend to the bottom frees up horizontal space for the chart, allowing the chart to be larger and more readable.
*   **Action**: `Transpose` (Vertical List $\to$ Grid/Flex Row)
    *   **Reasoning**: A vertical list of 6 items takes up too much vertical screen real estate. A 2-column grid or a flex-wrap layout allows the legend to be compact yet tappable.

### L1: Interaction Layer & L2: Features
*   **Action**: `Recompose (Replace)` (Hover $\to$ Click/Select)
    *   **Reasoning**: Mobile users cannot hover. We will implement an `activeIndex` state. Tapping a slice or a legend item will "select" that category.
*   **Action**: `Reposition (Fix)` (Tooltip $\to$ Center Info / Bottom Card)
    *   **Reasoning**: Floating tooltips are obscured by fingers. We will display the value and percentage of the selected slice permanently in the center of the Donut (or a dedicated highlight card) until deselected.

### L2: Data Marks (The Pie)
*   **Action**: `Rescale` (Inner Radius)
    *   **Reasoning**: Converting the Pie to a Donut (setting inner radius) reduces visual weight and allows for the "Center Info" strategy, which is a premium mobile UI pattern.

### L2: Annotations (Labels)
*   **Action**: `Compensate (Number/Color)`
    *   **Reasoning**: Placing text labels *on* small pie slices causes clutter. We will rely on the color coding + the Legend + the "Center Info" interaction to convey specific values.

## 4. Data Extraction Plan

The data will be extracted directly from the Javascript object in the source HTML.

**Raw Data**:
```json
[
  {"category": 1, "value": 4},
  {"category": 2, "value": 6},
  {"category": 3, "value": 10},
  {"category": 4, "value": 3},
  {"category": 5, "value": 7},
  {"category": 6, "value": 8}
]
```

**Derived Data (Calculated in Component)**:
1.  **Total**: Sum of all values ($4+6+10+3+7+8 = 38$).
2.  **Percentage**: $(Value / Total) \times 100$ for display in the interactive center view.
3.  **Color Mapping**: Map categories 1-6 to a custom premium palette (e.g., Emerald, Blue, Violet, Amber, Rose, Cyan) instead of default colors.

## 5. Implementation Steps

1.  **Setup Component Shell**: Create `src/components/Visualization.tsx` with a responsive container using Tailwind (e.g., `w-full max-w-md mx-auto p-4`).
2.  **Data Preparation**:
    *   Hardcode the extracted data.
    *   Define a `COLORS` array with modern hex codes.
    *   Calculate the `total` value for percentage display.
3.  **State Management**:
    *   Use `useState` for `activeIndex` (default to 0 or null).
4.  **Chart Implementation (Recharts)**:
    *   Use `ResponsiveContainer` and `PieChart`.
    *   Use `<Pie>` with `innerRadius={60}` and `outerRadius={80}` (approximate) to create the Donut effect.
    *   Bind `onClick` events to the Pie `Cell`s to update `activeIndex`.
    *   Implement an `ActiveShape` or simple scaling effect when a sector is selected to provide feedback.
5.  **Center Info / Overlay**:
    *   Position a `div` absolutely in the center of the Pie Chart.
    *   Display the **Value** and **Category** of the `activeIndex`. If nothing is selected, show the Total.
6.  **Legend Implementation**:
    *   Create a separate custom legend below the chart.
    *   Use a CSS Grid (`grid-cols-3` or `grid-cols-2`) for layout.
    *   Each legend item should be a clickable button (improving UX) that also updates `activeIndex`.
    *   Include the category color dot and the category name.
7.  **Styling & Polish**:
    *   Apply glassmorphism: `bg-white/10 backdrop-blur-md border border-white/20`.
    *   Ensure typography is legible (sans-serif, sufficient contrast).
    *   Add smooth transitions for the active state updates.