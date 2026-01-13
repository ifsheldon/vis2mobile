# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Analysis
*   **Type**: Donut Chart (Arc Mark).
*   **Data Structure**: Categorical data with 6 items (`category` 1-6) and quantitative values (`value`).
*   **Desktop Layout**: Horizontal layout. The chart is on the left, and the legend is a vertical list on the right.
*   **Visual Encoding**: Color encodes category; Arc angle encodes value.
*   **Center**: Hollow center (Donut style), currently empty.

### Mobile Issues (Desktop on Mobile)
*   **Distorted Layout**: The side-by-side layout (Chart + Legend) forces the chart to be extremely small to fit within the mobile viewport width.
*   **Unreadable Text**: Legend text becomes tiny when the whole view is scaled down.
*   **Inefficient Space**: The vertical legend on the right creates a lot of whitespace above and below it while squeezing the chart horizontally.
*   **Touch Targets**: The chart slices are too small for reliable touch interaction.
*   **Missing Information**: There are no labels on the slices. Users have to guess values or rely on desktop-specific "hover" tooltips which don't work well on mobile.

## 2. High-Level Design Plan

Based on the **Vis2Mobile Design Action Space**, I plan to apply the following transformations to create a premium, mobile-first component.

### L0: Visualization Container
*   **Action: `Rescale`**: Set width to 100% and height to auto (or a fixed aspect ratio like 1:1 for the chart area) to maximize screen usage.
*   **Action: `Reposition`**: Remove large desktop margins. Use a card-based layout with glassmorphism to contain the visualization.

### L1: Interaction Layer
*   **Action: `Recompose (Replace)` (Triggers)**: Replace the desktop `hover` trigger with `click/tap`. Mobile users cannot hover.
*   **Action: `Focus` (Features)**: Implement an "Active Slice" state. When a slice is tapped, it expands, and the others dim slightly to focus attention.

### L2: Feedback (Tooltips/Labels)
*   **Action: `Reposition (Fix)`**: instead of a floating tooltip which gets blocked by fingers, I will utilize the empty space in the center of the Donut chart.
    *   **Default State**: Show the total sum of all values.
    *   **Active State**: When a slice is selected, display that category's specific value and percentage in the center.

### L3: Legend Block
*   **Action: `Reposition`**: Move the legend from the **Right** of the chart to the **Bottom**. This gives the chart the full width of the screen.
*   **Action: `Transpose`**: Change the legend items from a **Vertical Column** to a **Horizontal Grid/Flex** layout. This is efficient for mobile vertical scrolling.
*   **Action: `Rescale` (Legend Symbol)**: Ensure legend color pills are large enough for touch interaction (filtering/highlighting).

### L4: Mark Instance (The Slices)
*   **Action: `Rescale`**: Increase the `innerRadius` slightly to ensure the center text is readable. Ensure the `outerRadius` fills the container width minus padding.

## 3. Data Extraction

I will use the exact data provided in the HTML source `spec.datasets`.

**Extracted Data:**
```json
[
  {"category": "1", "value": 4, "color": "#4c78a8"},
  {"category": "2", "value": 6, "color": "#f58518"},
  {"category": "3", "value": 10, "color": "#e45756"},
  {"category": "4", "value": 3, "color": "#72b7b2"},
  {"category": "5", "value": 7, "color": "#54a24b"},
  {"category": "6", "value": 8, "color": "#eeca3b"}
]
```
*Note: The colors listed above are approximations of the default Vega-Lite "category10" scheme seen in the desktop png. I will use a premium, slightly more vibrant palette in the implementation that maps 1:1 to these categories to ensure aesthetic appeal while preserving data identity.*

## 4. Implementation Steps

### Step 1: Component Structure & Setup
1.  Create `src/components/Visualization.tsx`.
2.  Define the `DataPoint` interface.
3.  Import `PieChart`, `Pie`, `Cell`, `ResponsiveContainer`, `Sector`, `Tooltip` (custom) from `recharts`.
4.  Import `Lucide` icons if needed (e.g., for an info header).

### Step 2: Visual Styling (Premium Aesthetics)
1.  **Palette Definition**: Define a generic tailored color palette that looks modern (e.g., using Tailwind colors like `blue-500`, `amber-500`, `rose-500`, etc.) to replace the default Vega colors, ensuring high contrast.
2.  **Glassmorphism**: Apply `bg-white/10`, `backdrop-blur-md`, and subtle borders to the main container.
3.  **Typography**: Use `Inter` or system fonts with tight leading. Large, bold numbers for the center text.

### Step 3: The Chart Logic (Recharts)
1.  Calculate `Total Value` on mount for the default center display.
2.  State Management: `activeIndex` to track which slice is clicked.
3.  **Active Shape**: Create a custom `renderActiveShape` function. When a slice is active, render it slightly larger (`outerRadius + 10`) to provide visual feedback.
4.  **Center Information**:
    *   Place a `text` element or an absolute positioned `div` in the center of the chart.
    *   Logic: `if (activeIndex !== undefined)` show active item info, `else` show Total.

### Step 4: The Mobile Legend
1.  Create a custom Legend component below the chart.
2.  Use CSS Grid (`grid-cols-3` or `flex-wrap`) to display items.
3.  Each item should show the Color Dot and Category Name.
4.  Make Legend items interactive: Tapping a legend item sets the `activeIndex` on the chart.

### Step 5: Refinement
1.  **Animation**: Add smooth transitions for the center text and slice expansion.
2.  **Accessibility**: Add ARIA labels to the chart container and legend items.
3.  **Responsiveness**: Ensure the chart resizes correctly if the mobile device rotates (though optimization is focused on portrait).