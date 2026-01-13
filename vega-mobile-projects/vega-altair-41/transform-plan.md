# Vis2Mobile Transformation Plan

## 1. Executive Summary

The original visualization is a Mosaic Plot (Marimekko Chart) showing the distribution of Cylinder counts across different Car Origins (Europe, Japan, USA).
On desktop, this relies on variable column widths to show the total count of cars per origin, and segment heights to show the cylinder distribution.

**Mobile Challenge**: Mosaic plots are notoriously difficult on mobile devices.
1.  **Touch Targets**: The "Japan" and "Europe" columns are significantly narrower than "USA". On a portrait mobile screen, these columns becomes too thin to accurately tap.
2.  **Labeling**: The internal labels ("3", "4", "5" etc.) overlap or disappear in smaller segments.
3.  **Aspect Ratio**: Direct scaling leads to squashed visual elements.

**Transformation Strategy**:
We will transform the specific **Mosaic Plot** into a **Normalized (100%) Stacked Bar Chart**.
*   **Why**: This ensures every Origin (X-axis category) has an equal, tappable width on the screen.
*   **Compensation**: Since we lose the "Width = Total Count" encoding, we will use **Action L2 (Annotations) -> Compensate** by adding the total count (`N=...`) explicitly to the X-axis labels or tooltip.
*   **Aesthetics**: We will maintain the original color intention (Hue = Origin) but refine the opacity/saturation levels to distinguish Cylinder counts clearly, wrapping it in a modern, glassmorphic UI.

## 2. Desktop Analysis & Data Extraction

### Analysis
*   **X-Axis**: Origin (Categorical: Europe, Japan, USA).
*   **Y-Axis**: Frequency/Count of Cylinders (Stacked).
*   **Visual Encoding**:
    *   **Width**: Count of cars from that Origin.
    *   **Height**: Proportion of cylinder types within that Origin.
    *   **Color**: Encodes Origin (Europe=Blue, Japan=Orange, USA=Red).
    *   **Segments**: Cylinder counts (3, 4, 5, 6, 8).

### Data Extraction Plan
We need to extract the raw data from `spec.datasets` in the HTML file.

**Data Source**: `datasets["data-ad3a0dd023cd6593db8ec56326f31fcb"]`

**Extraction Steps**:
1.  Parse the JSON array.
2.  Perform Aggregation:
    *   Group by `Origin` (Europe, Japan, USA).
    *   Within each Origin, Group by `Cylinders`.
    *   Count the number of records for each `(Origin, Cylinder)` pair.
3.  Calculate Totals:
    *   Calculate total cars per `Origin`.
    *   Calculate the percentage of each `Cylinder` type within its `Origin`.

**Target Data Structure for Recharts**:
```typescript
interface ChartData {
  origin: string; // "USA", "Europe", "Japan"
  totalCount: number; // For annotation compensation
  // Cylinder counts for stacking
  cyl3: number;
  cyl4: number;
  cyl5: number;
  cyl6: number;
  cyl8: number;
  // Metadata for tooltip
  breakdown: { cylinder: number; count: number; percentage: number }[];
}
```

## 3. Design Action Space Plan

### L0: Visualization Container
*   **Action**: `Rescale`
    *   **Reason**: Use a responsive container (`h-72` or `aspect-square`) to ensure the chart fits the mobile width while maintaining enough vertical space for the stacks.

### L1: Chart Components
*   **Action**: `Recompose (Change Encoding)` (**Crucial Step**)
    *   **From**: Variable Width Bar (Mosaic).
    *   **To**: Equal Width Stacked Bar (100% Stacked).
    *   **Reason**: To ensure "Japan" and "Europe" are wide enough to be tappable targets on a generic smartphone width. The width variable in Mosaic is a poor encoding for interactivity on small screens.

### L2: Annotations
*   **Action**: `Compensate (Number)`
    *   **Reason**: Because we removed the variable width (which showed the total count), we must explicitly display the total count next to the Origin name (e.g., "USA (254)").
*   **Action**: `Reposition (Externalize)`
    *   **Reason**: Move internal segment labels ("4", "8", etc.) out of the bars. They will be displayed in the **Feedback** layer (Tooltip/Bottom Sheet) to avoid "Cluttered text".

### L2: Feedback (Interaction)
*   **Action**: `Reposition (Fix)`
    *   **Reason**: Instead of a floating tooltip which gets blocked by fingers, we will use a **Sticky Bottom Summary Panel**. When a user taps a bar (Origin), this panel updates to show the detailed Cylinder breakdown for that region.
*   **Action**: `Recompose (Replace)`
    *   **Reason**: Replace `hover` triggers with `click/touch` triggers for the bars.

### L3: Axes
*   **Action**: `Recompose (Remove)` (Y-Axis)
    *   **Reason**: In a 100% stacked chart, the Y-axis is just 0-100%. We can remove the axis line and ticks to save horizontal space, relying on the visual proportion and the specific data in the detailed panel.
*   **Action**: `Simplify labels` (X-Axis)
    *   **Reason**: Ensure Origin names are readable. "United States" (if it existed) would become "USA".

## 4. Detailed Implementation Steps

### Step 1: Component Structure
Create a `Visualization.tsx` using `Next.js` and `TailwindCSS`.
*   **Layout**: `flex-col`. Title area -> Chart Area -> Interactive Info Card.
*   **Style**: Dark mode ready, using glassmorphism (`bg-white/10 backdrop-blur`) for the info card.

### Step 2: Data Processing (in Component)
Implement a `useMemo` hook to process the raw JSON data:
1.  Iterate through the car list.
2.  Aggregate counts into the `ChartData` structure.
3.  Define a color map matching the original intentions:
    *   USA: Red shades (using opacity or gradient).
    *   Europe: Blue shades.
    *   Japan: Orange shades.
    *   *Refinement*: Since Recharts handles stacks better with distinct colors per stack key (Cylinders), we will assign a distinct color palette to **Cylinders** (e.g., a sequential palette from light to dark or distinct categorized colors) to allow comparison *across* origins. This is a deviation from the original (Color=Origin) but better for a Stacked Bar comparison.
    *   *Alternative Premium Design*: Keep Color=Origin, but use **Opacity/Pattern** for Cylinders. Let's stick to **Color=Cylinders** for better readability, but group them visually.

### Step 3: Visualization Implementation (Recharts)
Use `<ResponsiveContainer>` with `<BarChart layout="vertical" ...>` ?
*   *Re-evaluation*: "Vertical" bars (horizontal lines) might accommodate long text better, but vertical columns (standard bar chart) match the original "Columns = Origin" mental model. Let's stick to **Vertical Columns** (Standard `BarChart`).
*   **XAxis**: `dataKey="origin"`. Tick formatter includes total count: `(val) => "${val}\n(N=${count})"`
*   **YAxis**: Hidden (`hide`).
*   **Bars**: Multiple `<Bar>` components, one for each Cylinder type (3, 4, 5, 6, 8), stacked (`stackId="a"`).
*   **Animation**: Enable smooth entry animation.

### Step 4: Interactivity & UX
1.  **State**: `activeOrigin` (string | null).
2.  **Trigger**: `<Bar onClick={...}>`.
3.  **Feedback Element**: A simplified "Detail Card" below the chart.
    *   Default state: "Select a region to see cylinder distribution."
    *   Active state: Displays a sorted list or mini-legend of Cylinders for the selected Origin.
    *   Uses `Lucide` icons (e.g., `Car`, `Info`) for decoration.

### Step 5: Styling & Polish
*   **Font**: Inter or system-ui.
*   **Colors**: Use a refined palette inspired by the original but modernized.
    *   Cyl 3: Slate-300
    *   Cyl 4: Emerald-400
    *   Cyl 5: Yellow-400
    *   Cyl 6: Orange-500
    *   Cyl 8: Rose-600
*   **Typography**: Large, bold numbers in the Detail Card.

## 5. Summary of Differences (Desktop vs. Mobile)

| Feature | Desktop (Original) | Mobile (Planned) | Justification |
| :--- | :--- | :--- | :--- |
| **Chart Type** | Mosaic Plot (Variable Width) | 100% Stacked Bar (Equal Width) | Ensures tap targets are usable on narrow screens. |
| **Labels** | Inside segments | Moved to Bottom Panel | Prevents text overlap in small segments. |
| **Total Count** | Encoded in Width | Explicit Text Annotation | Compensates for loss of width encoding. |
| **Interaction** | Hover (Tooltip) | Tap + Sticky Panel | Solves "Fat-finger" and occlusion issues. |
| **Color** | By Origin | By Cylinder (Global) | Allows easier comparison of cylinder types across origins. |

This plan prioritizes mobile usability (Fitts's Law for touch targets) and readability (removing cluttered text) while preserving the core data narrative (relationship between Origin and Cylinders).