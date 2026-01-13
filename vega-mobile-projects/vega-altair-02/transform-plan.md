# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Analysis
*   **Type**: Horizon Graph (constructed via Vega-Lite `layer` with `area` marks).
*   **Data Structure**: 20 data points. `x` is sequential (1-20), `y` is quantitative (range 15-91).
*   **Visual Logic**:
    *   The chart uses a "folding" technique to display data within a limited height (75px).
    *   **Band 1 (0-50)**: Displayed as a standard area with opacity 0.6.
    *   **Band 2 (50+)**: Calculated as `y - 50` and overlaid on top of the first band.
    *   **Result**: Darker regions (where layers overlap) indicate values > 50. High peaks like `x=4` (y=91) appear as a steep "mountain" composed of the base layer plus the folded top layer.

### Mobile Challenges
*   **Aspect Ratio Distortion**: Compressing a wide Horizon Graph (500px width) into a mobile screen width (<400px) creates jagged, steep curves that are hard to interpret.
*   **Cognitive Load**: Horizon graphs require the user to mentally "unfold" the bands. On a small screen, the visual clutter of overlapping transparent waves can be confusing.
*   **Touch Targets**: The original relies on visual inspection. Mobile users need precise touch interaction to read specific values (e.g., determining if a peak is 87 or 91).
*   **Vertical Constraint**: The original is short (75px) to save desktop screen real estate. Mobile interfaces scroll vertically, so we are **not** constrained by height.

## 2. High-Level Strategy

My core strategy is **"Unfold and Enrich"**.

The "Horizon" technique is a compression artifact designed for dashboard density. On mobile, we have infinite vertical scroll but limited width. Therefore, the most mobile-friendly action is to **unfold** the graph back into a full-height Area Chart. To preserve the *intention* of the original (highlighting values > 50), I will use **visual thresholding** (gradient coloring) instead of geometric folding.

### Selected Actions from Vis2Mobile Design Space

#### **L1 Data Model -> Recompose (Unfold)**
*   **Action**: Change the visualization topology from a Layered Horizon Graph to a Standard Area Chart.
*   **Reasoning**: Horizon graphs sacrifice shape perception for space. On mobile, we have vertical space. Unfolding the chart (showing y=0 to y=100 linearly) makes the data shape immediately intuitive without mental decoding.

#### **L2 Data Marks -> Recompose (Change Encoding)**
*   **Action**: Use **Gradient Color Encoding** to replace the "Opacity Layering" of the original.
*   **Implementation**:
    *   Values 0-50: Standard Blue Theme.
    *   Values >50: distinct Gradient shift (e.g., to Purple or a deeper Blue) to mimic the "darker overlap" of the original horizon graph.
    *   This preserves the "threshold" logic of the original source.

#### **L3 Axes -> Decimate Ticks & Remove Gridlines**
*   **Action**: `Recompose (Remove)` Gridlines and `Decimate Ticks` on the X-axis.
*   **Reasoning**: 20 labels (1-20) will crowd a mobile screen. I will reduce X-axis ticks to show intervals (e.g., 1, 5, 10, 15, 20) or just min/max to reduce clutter (`Cluttered text`).

#### **L5 Interaction -> Reposition (Fix Tooltip)**
*   **Action**: `Fix tooltip position`.
*   **Reasoning**: Fingers cover touch points. A floating tooltip is blocked by the user's hand. I will move the data readout to a fixed "Title Block" or "Legend Area" at the top of the card that updates dynamically on scrub.

#### **L0 Container -> Rescale**
*   **Action**: Adjust aspect ratio.
*   **Implementation**: Instead of the original 500x75 (approx 6.6:1), I will use a mobile-friendly ratio (e.g., 4:3 or 16:9) to give the curves room to breathe.

## 3. Implementation Plan

### Step 1: Component Structure
Create a `Visualization.tsx` that wraps the chart in a "Glassmorphism" card.
*   **Header**: Static Title ("Data Density") and a Dynamic KPI display (shows current Y value when scrubbing, defaults to average or max).
*   **Body**: The Recharts container.

### Step 2: Visual Transformation (Recharts)
*   **Chart Type**: `<AreaChart>`.
*   **X-Axis**: `<XAxis dataKey="x" />` with `interval="preserveStartEnd"` to avoid crowding.
*   **Y-Axis**: Hidden or minimal. Mobile users care more about the shape and specific point values (via touch) than estimating Y-axis ticks.
*   **Gradient Definition (`<defs>`)**:
    *   Create a linear gradient that transitions colors at `50%` (assuming max domain is roughly 100).
    *   This mimics the horizon graph's "break point" at 50 visually.
*   **Reference Line**: Add a dashed `<ReferenceLine y={50} />` to explicitly mark the threshold used in the original source.

### Step 3: Interaction Layer
*   Enable `<Tooltip>` with `active={true}` but customize the `content` to be null or minimal, and instead use the `onMouseMove` / `onTouchMove` callback of the Chart to update a React state variable (`activeData`).
*   Display this `activeData` in the Header (Large typography). This solves the "Fat-finger problem".

### Step 4: Styling
*   Use a modern color palette: Slate/Blue/Violet.
*   Add a subtle drop shadow to the area curve.
*   Background: A subtle abstract gradient or dark mode compatible glass effect.

## 4. Data Extraction

I have extracted the exact data points from the `spec` in the HTML source code.

**Variable**: `dataset`

```javascript
const dataset = [
  { x: 1, y: 28 },
  { x: 2, y: 55 }, // > 50 (Peak)
  { x: 3, y: 43 },
  { x: 4, y: 91 }, // > 50 (Peak)
  { x: 5, y: 81 }, // > 50 (Peak)
  { x: 6, y: 53 }, // > 50 (Peak)
  { x: 7, y: 19 },
  { x: 8, y: 87 }, // > 50 (Peak)
  { x: 9, y: 52 }, // > 50 (Peak)
  { x: 10, y: 48 },
  { x: 11, y: 24 },
  { x: 12, y: 49 },
  { x: 13, y: 87 }, // > 50 (Peak)
  { x: 14, y: 66 }, // > 50 (Peak)
  { x: 15, y: 17 },
  { x: 16, y: 27 },
  { x: 17, y: 68 }, // > 50 (Peak)
  { x: 18, y: 16 },
  { x: 19, y: 49 },
  { x: 20, y: 15 }
];
```

This data will be strictly used in the implementation to ensure fidelity.