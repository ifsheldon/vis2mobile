# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Details
- **Type**: Pie Chart.
- **Data Content**: Three categories representing a humorous breakdown of a pyramid image: "Sky" (75), "Shady side of a pyramid" (10), "Sunny side of a pyramid" (15).
- **Layout**: Chart on the left, Legend on the right (vertical list).
- **Colors**: Specific hex codes mapped to categories:
    - Sky: `#416D9D`
    - Shady side: `#674028`
    - Sunny side: `#DEAC58`
- **Interaction**: Standard Vega-lite tooltips (hover).

### Issues in "Desktop on Mobile" View
- **Layout Distortion**: The side-by-side layout (Chart + Legend) compresses the pie chart horizontally, making it look small and off-center.
- **Whitespace**: There is excessive whitespace above and below the chart due to the container maintaining a fixed height/aspect ratio logic intended for desktop.
- **Readability**: The legend text ("Sunny side of a pyramid") is relatively long. On a narrow mobile screen, if placed beside the chart, it forces the chart to be tiny or causes text wrapping issues.
- **Touch Interaction**: Hover-based tooltips are inaccessible or awkward on mobile devices.

## 2. Design Action Plan

Based on the `mobile-vis-design-action-space.md`, here is the transformation plan:

### **L0: Visualization Container (Layout Strategy)**
- **Action: `Reposition` (Global Layout)**
    - **Reasoning**: The desktop horizontal layout (Chart Left, Legend Right) fails on mobile.
    - **Plan**: Switch to a **Vertical Stack** layout.
        1.  **Title Block** (Top)
        2.  **Chart Area** (Middle, full width)
        3.  **Legend/Data List** (Bottom)
- **Action: `Rescale`**
    - **Reasoning**: The chart currently has a fixed width/height in the spec.
    - **Plan**: Set the chart container to `width: 100%` and allow the height to adjust based on content, maximizing the use of screen width for the pie itself.

### **L1: Data Model & Narrative**
- **Action: `Recompose (Aggregate)` -> *Rejected***
    - **Justification**: The dataset is small (3 items). Aggregation is unnecessary and would destroy the joke/narrative of the pyramid visualization.
- **Action: `Narrative` (Emphasis)**
    - **Plan**: Add a "Total" or "Focus" context. Since this is a "Part-to-Whole" relationship, selecting a slice should highlight its percentage relative to the whole.

### **L2: Data Marks (The Pie)**
- **Action: `Recompose (Change Encoding)`**
    - **Reasoning**: Standard Pie charts can feel heavy.
    - **Plan**: Convert to a **Donut Chart** (`innerRadius > 0`). This modernizes the aesthetic and creates space in the center for a dynamic label (e.g., displaying the percentage of the currently selected slice).
- **Action: `Rescale`**
    - **Reasoning**: Make the touch targets larger.
    - **Plan**: Increase the `outerRadius` to fill the mobile width, leaving just enough padding for the container.

### **L3: Auxiliary Components (Legend)**
- **Action: `Reposition`**
    - **Reasoning**: Right-aligned legend consumes too much horizontal space.
    - **Plan**: Move the legend to the **Bottom** of the screen.
- **Action: `Transpose`**
    - **Reasoning**: A simple horizontal list might wrap awkwardly given the long labels.
    - **Plan**: Transform the legend into a **Vertical List of Cards** (Data List) below the chart. Each card will contain the Color, Category Name, and Value (%). This serves as both a legend and a data table, improving readability.

### **L5: Interaction & Feedback**
- **Action: `Recompose (Replace)` (Triggers)**
    - **Reasoning**: Hover is not available.
    - **Plan**: Replace `Hover` with `Click/Tap`. Tapping a slice or a legend card will "Select" that category.
- **Action: `Reposition (Fix)` (Feedback)**
    - **Reasoning**: Floating tooltips are blocked by fingers.
    - **Plan**: Use a **Center Text** approach inside the Donut Chart or highlight the specific **Legend Card** to show details. We will use both:
        1.  Center of Donut shows the value/percentage of the active slice.
        2.  The corresponding card in the list below highlights.

## 3. Implementation Steps

1.  **Component Setup**:
    -   Create `Visualization.tsx`.
    -   Import `Recharts` components: `PieChart`, `Pie`, `Cell`, `ResponsiveContainer`, `Sector`.
    -   Import `Lucide` icons for decorative elements (e.g., `Pyramid` or `Sun` icon for the header).

2.  **Data Preparation**:
    -   Hardcode the extracted data (see Section 4) into a constant.
    -   Calculate total value (100) to derive percentages if needed (though values sum to 100 already).

3.  **State Management**:
    -   Use `useState` to track `activeIndex` (currently selected slice). Default to the largest slice (Sky) or index 0.

4.  **Chart Construction (Center)**:
    -   Render a `ResponsiveContainer` with a fixed aspect ratio (e.g., height 300px).
    -   Render `PieChart`.
    -   Render `Pie` with `innerRadius={60}` and `outerRadius={100}` (or responsive %).
    -   Map the extracted colors to `Cell` components.
    -   Implement `onPieEnter` (for desktop compatibility) and `onClick` (for mobile) to update `activeIndex`.
    -   **Active Shape**: Define a custom `renderActiveShape` to slightly expand the selected slice (visual feedback).

5.  **Center Label (Donut Hole)**:
    -   Overlay a div absolute positioned in the center of the chart.
    -   Display the `Value` and `Category` name of the `activeIndex`.

6.  **Legend/List Construction (Bottom)**:
    -   Map through the data array to create a list of items below the chart.
    -   **Styling**: Use a "Card" style for each item.
        -   Left: Color indicator (circle/square).
        -   Middle: Category Name (Text wrapping allowed).
        -   Right: Value/Percentage.
    -   **Interaction**: If `index === activeIndex`, apply a ring/border highlight and a subtle background color change (Glassmorphism). Add `onClick` to set active index.

7.  **Styling & Theming**:
    -   Background: Neutral, slight off-white or soft gradient.
    -   Font: Sans-serif, readable sizes (16px+ for body text).
    -   Title: "Pyramid Composition" (Derived from the joke context).

## 4. Data Extraction

Based on the provided HTML source code, the data is extracted from the `datasets` object within the Vega spec.

**Data Array:**
```typescript
const data = [
  { name: "Sky", value: 75, color: "#416D9D" },
  { name: "Shady side of a pyramid", value: 10, color: "#674028" },
  { name: "Sunny side of a pyramid", value: 15, color: "#DEAC58" }
];
```

**Metadata:**
- **Source**: https://altair-viz.github.io/gallery/pyramid.html
- **Chart Type**: Pie / Donut
- **Total Value**: 100 (Values represent percentages)