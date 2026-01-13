# Vis2Mobile Transformation Plan

## 1. Analysis & Reasoning

### Desktop Visualization Analysis
The original visualization is a **Facet Bullet Chart**. It displays five distinct performance metrics (Revenue, Profit, Order Size, New Customers, Satisfaction).
- **Structure**: It is a vertical small-multiple layout (faceting).
- **Components per Chart**:
    - **Ranges (Background)**: Three qualitative ranges (e.g., bad, satisfactory, good) depicted by gray bars of varying lengths (`#eee`, `#ddd`, `#ccc`).
    - **Measures (Foreground)**: Two quantitative bars (e.g., current value, projected value) in blue shades (`steelblue`, `lightsteelblue`).
    - **Marker**: A vertical black tick indicating a target value.
    - **Axis**: A linear quantitative axis at the bottom of each facet.
    - **Labels**: Category labels (e.g., "Revenue") are placed to the left of the Y-axis.

### Mobile Challenges (L0 - Container)
- **Aspect Ratio**: The original is wide and short. Compressing it horizontally for mobile (as seen in `desktop_on_mobile.png`) squashes the linear scale, making it hard to distinguish differences between the ranges and measures.
- **Label Space**: The left-aligned labels ("New Customers") consume ~30% of the horizontal screen real estate, starving the actual data visualization.
- **Touch Targets**: The bars are relatively thin, and the "Marker" tick is very hard to see or interact with on a small screen.

### Design Action Space & Strategy

To transform this for mobile, I will treat each "Facet" as a self-contained **Card Component**.

**1. L3 Title/Label - Reposition (Flow/Vertical Stack)**
*   **Action**: `Reposition`
*   **Reasoning**: Move the Category Label (e.g., "Revenue") and Subtitle (units) from the *left* of the chart to the *top* of the chart.
*   **Benefit**: This allows the Bullet Chart to utilize 100% of the mobile screen width, significantly improving readability of the data values.

**2. L3 Axes - Recompose (Remove/Simplify)**
*   **Action**: `Recompose (Remove)` & `Simplify`
*   **Reasoning**: Showing a full numerical axis for every single card creates visual clutter ("Chart Junk").
*   **Plan**: Remove the explicit X-axis lines and ticks. Instead, display the primary Measure value as a large, bold number in the Card Header. Use the chart purely for visual relative comparison.

**3. L2 Data Marks - Rescale & Layering**
*   **Action**: `Rescale` (Height)
*   **Reasoning**: Increase the height of the bars to make the chart feel substantial and touch-friendly.
*   **Action**: `Serialize Layout` (Conceptually)
*   **Reasoning**: Ensure the z-ordering (layering) of the bars (Ranges background -> Measures foreground -> Marker on top) is preserved but styled with modern rounded corners.

**4. L1 Interaction - Trigger & Feedback**
*   **Action**: `Trigger (Tap)` instead of Hover.
*   **Reasoning**: Mobile users cannot hover. Tapping a card will reveal a detailed tooltip or expand the card to show the specific numerical values for the ranges and targets.

**5. L0 Container - Layout**
*   **Action**: `StackPanels`
*   **Reasoning**: Maintain the vertical list logic but add padding between cards to create distinct visual groupings.

## 2. Data Extraction Plan

I will extract the raw data directly from the `data.values` object in the HTML source script.

**Source Data Schema:**
```typescript
interface DataItem {
  title: string;       // e.g., "Revenue"
  subtitle: string;    // e.g., "US$, in thousands"
  ranges: number[];    // e.g., [150, 225, 300] (Bad, Avg, Good thresholds)
  measures: number[];  // e.g., [220, 270] (Current, Forecast)
  markers: number[];   // e.g., [250] (Target)
}
```

**Data Preparation for Recharts:**
Since Recharts doesn't have a native "Bullet Chart" component, I will construct a `ComposedChart` where each bar overlays the previous one. I will need to normalize the data object for the component:

```typescript
// Transformed Data Object for Component
{
  name: "Revenue",
  unit: "US$, in thousands",
  rangeMax: 300,  // ranges[2] (Background Layer 1)
  rangeMid: 225,  // ranges[1] (Background Layer 2)
  rangeMin: 150,  // ranges[0] (Background Layer 3)
  measure1: 270,  // measures[1] (Light Blue)
  measure2: 220,  // measures[0] (Dark Blue)
  target: 250     // markers[0] (Tick)
}
```

## 3. High-Level Implementation Plan

### Component Architecture
1.  **`Visualization.tsx`**: The main container rendering a list of `BulletCard` components.
2.  **`BulletCard.tsx`**: A sub-component responsible for rendering a single metric.

### Step-by-Step Actions

#### Step 1: Layout & Container (L0)
*   Create a vertical flex container with `gap-4` and `p-4` to handle the layout.
*   Use a mobile-first constraint (`max-w-md mx-auto`) to simulate the mobile view even on desktop browsers.

#### Step 2: Card Header Design (L3 - Title/Subtitle)
*   Inside each card, create a header row.
*   **Top Left**: `title` (Bold, Text-lg).
*   **Bottom Left (under title)**: `subtitle` (Text-sm, Text-gray-500).
*   **Top Right**: Display the primary "Measure" value (the actual performance) prominently to give immediate insight without needing to interpret the bar length.

#### Step 3: The Bullet Chart Construction (L1/L2 - Chart/Marks)
*   Use Recharts `<ComposedChart>` with `layout="vertical"`.
*   **Layer 1 (Background Ranges)**:
    *   Render 3 `<Bar />` components with `barSize={30}` (thick enough for mobile).
    *   They must overlap. Recharts stacks by default in `bar` charts if not grouped, or we can use the `xAxisId` trick or simple Z-index ordering by placing them in code order.
    *   Colors: Map the original grays to Tailwind Slate colors (e.g., `slate-100`, `slate-200`, `slate-300`).
*   **Layer 2 (Measures)**:
    *   Render 2 `<Bar />` components.
    *   Reduce `barSize` slightly (e.g., `20` or `12`) to create the "bullet" effect inside the ranges.
    *   Colors: Map `lightsteelblue` to `blue-300` and `steelblue` to `blue-600`.
*   **Layer 3 (Marker/Target)**:
    *   Use a custom `<ErrorBar />` or a Scatter point with a custom shape (a vertical line) to represent the Target Marker.

#### Step 4: Axes & Scale (L3/L4)
*   Hide `YAxis`.
*   Hide `XAxis` lines and ticks, but keep the domain `[0, rangeMax]` to ensure the proportions are correct.
*   (Optional) Add a very subtle grid line if helpful, but likely cleaner without.

#### Step 5: Aesthetics & Polish
*   **Card Style**: White background, subtle shadow (`shadow-sm`), rounded corners (`rounded-xl`).
*   **Typography**: Inter font, legible weights.
*   **Interaction**: Implement a `Tooltip` that activates on touch, showing the precise breakdown of Ranges vs Measures vs Target.

#### Step 6: Mobile Responsiveness
*   Ensure `ResponsiveContainer` from Recharts is used with `width="100%"`.
*   Set a fixed height per card (e.g., `h-24`) to ensure consistency.

### Mobile-First Refinements
*   **Color Palette**: Upgrade the "gray" ranges to a more modern, subtle palette (e.g., very light cool grays) to look "Premium."
*   **Animation**: Add entrance animations for the bars growing from left to right.

This plan moves away from the "dense spreadsheet" look of the desktop version to a "dashboard card" aesthetic suitable for modern mobile apps.