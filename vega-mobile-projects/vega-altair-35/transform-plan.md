# Mobile Visualization Plan

## 1. Analysis of Original Visualization

### Source Desktop Visualization
*   **Type**: Radial Histogram (Rose Chart / Coxcomb Chart).
*   **Data Structure**: Hourly observations (24 data points).
    *   **Dimension**: Hour of day (0-23).
    *   **Measure**: Observation count (Range: 2 to 9).
*   **Key Visual Elements**:
    *   **Glyphs**: Wedges (arcs) where radius represents the count.
    *   **Coordinates**: Polar.
    *   **Grid**: Concentric circles at intervals of 2 (2, 4, 6, 8, 10).
    *   **Labels**: Cardinal directions labeled as 00:00, 06:00, 12:00, 18:00.
    *   **Title**: "Observations throughout the day".

### Issues on Mobile (Rendered in Aspect Ratio)
1.  **Scale**: When the radial chart is shrunk to fit mobile width, the inner segments become extremely small and hard to distinguish.
2.  **Readability**: The text labels (00:00, etc.) and grid values (2, 4, 6...) become microscopic.
3.  **Interaction**: Hovering over a thin 15° slice (1 hour wedge) is difficult with a finger ("Fat-finger problem").
4.  **Whitespace**: The circular shape inside a rectangular screen leaves significant unused whitespace at the corners.

## 2. Vis2Mobile Transformation Plan

### High-Level Strategy
We will transform this **Radial Histogram** into a **Interactive Radar Chart** (or Filled Polar Area Chart). While a linear bar chart is often more readable, the cyclic nature of 24-hour data is a strong narrative element ("The Day Cycle") that justifies keeping the Polar coordinate system. To address mobile constraints, we will maximize the chart width, increase touch targets, and move detailed information into a fixed central display (using the "Donut hole" space).

### Detailed Actions from Action Space

#### **L0 Visualization Container**
*   **Action**: `Rescale` (Fit Width)
    *   **Reason**: The chart must occupy 100% of the mobile screen width (minus padding) to maximize the resolution of the data wedges.
*   **Action**: `Reposition` (Remove Margins)
    *   **Reason**: Reduce the global padding defined in the desktop HTML to utilize the full viewport width.

#### **L2 Coordinate System**
*   **Action**: `Preserve` (Polar)
    *   **Reason**: Maintains the user's mental model of a 24-hour clock cycle, which is the core intention of the original visualization.
*   **Action**: `Rescale` (Aspect Ratio)
    *   **Reason**: Maintain a 1:1 aspect ratio for the chart container itself, but place it within a vertical flex layout.

#### **L3/L4 Axes & Ticks**
*   **Action**: `Simplify Labels` (L5 TickLabel)
    *   **Reason**: Change "00:00" to "12am" or just "0h" and "18:00" to "6pm" to save space and improve quick readability.
*   **Action**: `Rescale` (Font Size)
    *   **Reason**: Increase the font size of the cardinal direction labels (0, 6, 12, 18) to be at least 12px for mobile legibility.
*   **Action**: `Recompose (Remove)` (Axis Title)
    *   **Reason**: The radial axis titles are self-explanatory in this context or can be explained in the subtitle.

#### **L2 Data Marks**
*   **Action**: `Change Mark Type` (Arc -> Radar Polygon)
    *   **Reason**: In React/Recharts, exact "Rose Chart" (variable radius bars) implementation can be complex and brittle. A **Radar Chart** with a filled area effectively communicates the same "shape of the data" and is fully responsive. It smooths the transition between hours slightly but preserves the overall pattern (peaks at 10am and 2pm).
*   **Action**: `Feedback (Reposition - Fix)`
    *   **Reason**: Instead of a floating tooltip that gets blocked by the finger, we will use the **center of the radar chart** (the hole) to display the active data point. When a user touches the chart, the center will update to show "10:00 - 9 Observations". This turns the empty whitespace into a functional information display.

#### **L5 Interaction**
*   **Action**: `Recompose (Replace)` (Hover -> Touch/Click)
    *   **Reason**: Mobile devices do not support hover. We will enable touch interaction where tapping anywhere on the chart (or dragging) updates the central display.

#### **L2 Features (Aesthetics)**
*   **Action**: `Add Emphases` (Glassmorphism/Gradient)
    *   **Reason**: To meet the "Premium Aesthetics" requirement, we will use a subtle gradient fill for the radar area and a glassmorphism background for the container card.

## 3. Data Extraction

We extract the data directly from the `data-e620bb0a489fd4df9d404cbe55b06b91` array in the source HTML.

**Extracted Dataset:**
```javascript
export const observationsData = [
  { hour: 0, observations: 2, label: "00:00" },
  { hour: 1, observations: 2, label: "01:00" },
  { hour: 2, observations: 2, label: "02:00" },
  { hour: 3, observations: 2, label: "03:00" },
  { hour: 4, observations: 2, label: "04:00" },
  { hour: 5, observations: 3, label: "05:00" },
  { hour: 6, observations: 4, label: "06:00" },
  { hour: 7, observations: 4, label: "07:00" },
  { hour: 8, observations: 8, label: "08:00" },
  { hour: 9, observations: 8, label: "09:00" },
  { hour: 10, observations: 9, label: "10:00" },
  { hour: 11, observations: 7, label: "11:00" },
  { hour: 12, observations: 5, label: "12:00" },
  { hour: 13, observations: 6, label: "13:00" },
  { hour: 14, observations: 8, label: "14:00" },
  { hour: 15, observations: 8, label: "15:00" },
  { hour: 16, observations: 7, label: "16:00" },
  { hour: 17, observations: 7, label: "17:00" },
  { hour: 18, observations: 4, label: "18:00" },
  { hour: 19, observations: 3, label: "19:00" },
  { hour: 20, observations: 3, label: "20:00" },
  { hour: 21, observations: 2, label: "21:00" },
  { hour: 22, observations: 2, label: "22:00" },
  { hour: 23, observations: 2, label: "23:00" },
];
```

## 4. Implementation Steps

1.  **Setup Component**: Create a responsive Card container with a dark/glassy theme to make the chart pop.
2.  **Data Preparation**: Use the extracted JSON data. Add a `fullMark` property (e.g., 10) to all data points if needed to stabilize the grid, though `PolarGrid` handles this.
3.  **Chart Construction (Recharts)**:
    *   Use `RadarChart` with `outerRadius="80%"`.
    *   `PolarGrid`: Customize `gridType="circle"` to match the original concentric rings.
    *   `PolarAngleAxis`: Bind to `hour`. Use a `tickFormatter` to only show labels for 0, 6, 12, 18 to reduce clutter (simulating the original "Decimate Ticks" logic).
    *   `PolarRadiusAxis`: Set `angle={90}` and `domain={[0, 10]}` to match the original scale (0-10).
    *   `Radar`: Bind dataKey="observations". Use a solid fill with opacity and a distinct stroke color (Blue/Indigo palette).
4.  **Central Overlay**:
    *   Create a `div` absolutely positioned in the center of the chart container.
    *   It should display the `activeLabel` (Time) and `activePayload` (Count).
    *   Default state (no selection): Show the Title "Daily Overview" or the Peak Hour.
5.  **Interaction**:
    *   Add `onMouseEnter` (and touch equivalents handled by Recharts) to the `RadarChart` to update a React state `activeData`.
    *   Bind the Central Overlay to this state.
6.  **Refinement**:
    *   Add a "Peak Activity" summary card below the chart to highlight key insights (e.g., "Peak at 10:00 with 9 observations").
    *   Apply Tailwind styling for typography (Inter/Sans), colors (Slate/Blue), and spacing.