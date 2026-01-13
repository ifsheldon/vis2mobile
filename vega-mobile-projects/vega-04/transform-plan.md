# Vis2Mobile Transformation Plan

## 1. Analysis

### Original Desktop Visualization
- **Type**: Donut Chart with external "spider-leg" labels (labels connected by polyline leaders).
- **Data**: A breakdown of values by country (e.g., Canada: 10, Argentina: 8, others: 1).
- **Key Interaction**: A `startAngle` slider that rotates the chart, demonstrating the layout algorithm's ability to prevent label overlap.
- **Visual Style**: Functional, scientific (Vega default), high information density via external text labels.

### Mobile Rendering Issues (based on `desktop_on_mobile.png`)
- **Unreadable Layout**: The "spider-leg" labels require significant horizontal margin. On a narrow mobile screen, preserving these labels forces the actual donut chart to scale down to a microscopic size.
- **Touch Targets**: The slider is too small for touch interaction.
- **Font Size**: The text labels for countries become illegible when scaled down.
- **Orientation**: The left/right label distribution is optimized for landscape (desktop) but fails in portrait (mobile).

## 2. Design Action Plan

Based on the **Vis2Mobile Design Action Space**, I plan to execute the following actions to transform this visualization.

### L0: Visualization Container
- **Action**: `Rescale` (Scale to fit) & `Reposition` (Margin adjustment)
- **Reasoning**: The container must utilize the full width of the mobile device. We will move away from the fixed pixel width defined in the Vega spec to a fluid responsive design (`width: 100%`, `height: auto`).

### L1: Data Model
- **Action**: `Sort` (Implicit)
- **Reasoning**: While the original data isn't strictly sorted by value, for the mobile list view (see below), sorting by value (Descending) provides better readability and quick insight into the largest contributors.

### L3: Legend Block (Replacing Labels)
- **Action**: `Reposition` & `Transpose` (Serialize layout)
- **Reasoning**: The most critical change. The external "Mark Labels" (spider legs) are the primary cause of the layout failure on mobile.
    - I will **Remove** the external labels from the chart area.
    - I will **Transpose** this information into a scrollable, vertical **Legend List** below the chart.
    - This corresponds to the **L3 Small Multiple / Serialize layout** concept where we change the layout direction.
    - **Justification**: This allows the donut chart to occupy the maximum possible radius in the center of the screen, ensuring the visual segments are large enough to tap.

### L4: Mark Label (On Chart)
- **Action**: `Recompose (Remove)`
- **Reasoning**: As mentioned above, removing the path lines and text labels cleans up the "Cluttered text" issue identified in the design space.
- **Compensate Strategy**: We will use a **Center Text** approach. The Donut hole is empty space. When a user interacts with a slice (or by default), we will display the specific value and label in the center of the donut (`L2 Annotations -> Reposition`).

### L1: Interaction Layer
- **Action**: `Recompose (Replace)` (Hover -> Click/Touch)
- **Reasoning**: Mobile lacks hover. I will implement:
    1.  **Active State**: Clicking a slice highlights it (scale/opacity) and updates the center text.
    2.  **Sync**: Clicking an item in the list below highlights the corresponding slice in the chart.
- **Action**: `Recompose (Remove)` (Remove `startAngle` slider)
- **Reasoning**: The slider in the original Vega example exists primarily to demonstrate the label collision algorithm. Since we are removing the colliding labels in favor of a clean mobile list, the slider serves no analytical purpose and clutters the UI.

### L2: Data Marks (The Donut)
- **Action**: `Rescale`
- **Reasoning**: Increase the `innerRadius` and `outerRadius` to fill the card width. Make the segments thick enough to be easily tappable.

## 3. Data Extraction

I will extract the raw data directly from the `spec.data[0].values` array in the source HTML.

**Extracted Data:**
```json
[
  {"id": "United States", "value": 1},
  {"id": "France", "value": 1},
  {"id": "Germany", "value": 1},
  {"id": "Italy", "value": 1},
  {"id": "UK", "value": 1},
  {"id": "Canada", "value": 10},
  {"id": "China", "value": 3},
  {"id": "India", "value": 7},
  {"id": "Argentina", "value": 8}
]
```

**Color Palette Plan**:
The original uses `category20`. I will map these IDs to a modern, premium palette (e.g., using Tailwind colors like Indigo, Emerald, Rose, Amber, Sky) to ensure distinctness while maintaining the "Premium Aesthetics" requirement.

## 4. Implementation Steps

1.  **Project Setup**: Initialize the component structure within `src/components/Visualization.tsx`.
2.  **Data Processing**: 
    - Create a constant `DATA` array with the extracted values.
    - Assign a specific color to each data point to ensure consistency.
    - Calculate the total value (sum) to display "Total" in the center by default.
3.  **Component Construction (Layout)**:
    - Create a main container with a glassmorphism effect (`bg-white/10 backdrop-blur-md`).
    - **Top Section**: The Chart. Use `Recharts` `<PieChart>` and `<Pie>`. 
        - Configure `innerRadius` to approx 60% and `outerRadius` to 80% of the container width to create a thin, modern ring.
        - Add a central HTML overlay absolutely positioned in the donut hole to display the "Active" data label and value.
    - **Bottom Section**: The List.
        - Render a vertical list of the data points.
        - Each row should show: A color dot (legend), Country Name, Value, and Percentage.
        - Add a subtle border or background to separate rows.
4.  **Interaction Logic**:
    - Add `activeIndex` state.
    - On `<Pie>` click: Update `activeIndex`.
    - On List Item click: Update `activeIndex`.
    - When `activeIndex` is set, the central text shows that country's data. When null, it shows the total count.
5.  **Styling & Polish**:
    - Use Tailwind for typography (Inter/Sans).
    - Ensure text colors have high contrast against the glass background.
    - Add layout animations (using `framer-motion` or CSS transitions) for when the list renders or the active state changes.

This plan ensures the visualization is readable, interactive, and aesthetically pleasing on mobile, solving the spatial constraints of the original desktop design.