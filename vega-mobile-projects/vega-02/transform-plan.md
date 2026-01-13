# Mobile Visualization Transformation Plan

## 1. Analysis of Original Desktop Visualization

### Source Analysis
*   **Type**: Interactive Scatter Plot.
*   **Data Source**: External JSON (`https://vega.github.io/editor/data/normal-2d.json`), fields `u` (x-axis) and `v` (y-axis).
*   **Visual Encoding**:
    *   **Marks**: Small blue circles (`steelblue`, opacity 0.6).
    *   **Axes**: Located at the **Top** (X-axis) and **Right** (Y-axis).
    *   **Interaction**: Hover changes color to `firebrick`. Scroll wheel zooms. Drag pans.
*   **Layout**: Fixed dimensions (500x300), resulting in specific aspect ratio.

### Mobile Constraints & Issues
*   **Readability**: The original 500x300 layout, when squashed to mobile portrait width, will make the dots indistinguishable (dust-like).
*   **Input Method**: The "Hover" effect (turning red) is impossible on touch screens.
*   **Touch Targets**: The data points are too small to tap individually.
*   **Axes Placement**: Top and Right axes are non-standard for mobile interfaces (where the user's hand might cover the top of the screen). Standard reading pattern is usually Bottom/Left.
*   **Viewport**: The original aspect ratio might not utilize the full vertical space available on mobile efficiently.

## 2. Vis2Mobile Design Action Space Planning

Based on the `mobile-vis-design-action-space.md`, here are the specific actions to transform the visualization:

### L0: Visualization Container
*   **Action**: `Rescale` (Container)
    *   **Reasoning**: Change fixed pixel width to `width: 100%` and `height: 400px` (or aspect ratio 1:1 or 4:5) to maximize screen real estate usage in portrait mode.
*   **Action**: `Reposition` (Padding)
    *   **Reasoning**: Add adequate padding to ensure axes labels don't get cut off by screen edges.

### L1: Interaction Layer
*   **Action**: `Recompose (Replace)` (Triggers)
    *   **Reasoning**: **Hover → Touch/Drag**. Since we cannot "hover" to see the red highlight, we will implement a **Crosshair/Tooltip** interaction. When the user touches and drags on the chart, a crosshair will snap to the nearest point, or a tooltip will appear.
*   **Action**: `Reposition (Fix)` (Feedback)
    *   **Reasoning**: **Fix Tooltip Position**. Instead of a floating tooltip that might be covered by the user's finger, displayed selected values will be rendered in a fixed "Data Card" below or above the chart.

### L3: Axes (Coordinate System)
*   **Action**: `Reposition` (Axes)
    *   **Reasoning**: Move **X-axis to Bottom** and **Y-axis to Left**.
    *   *Justification*: While the original uses Top/Right, mobile users typically anchor their view from the bottom-left. Top axes are often obscured by the notch or the hand reaching for the top of the screen.
*   **Action**: `Decimate Ticks` (Ticks)
    *   **Reasoning**: Reduce the number of ticks on both axes to prevent label overlapping on narrow screens.

### L2: Data Marks (Scatter Points)
*   **Action**: `Rescale` (Mark Instance)
    *   **Reasoning**: **Increase Dot Size**. The original dots are very small (pixels). On high-DPI mobile screens, they need to be larger (e.g., radius 4px-6px) to be visible and aesthetically pleasing.
*   **Action**: `Recompose (Change Encoding)` (Color/Opacity)
    *   **Reasoning**: Maintain transparency (`opacity`) but potentially use a vibrant gradient or a brighter blue to stand out against a modern dark/glassmorphic background, ensuring the "Premium Aesthetics" requirement.

## 3. Data Extraction Plan

Since the original HTML uses a URL for data, we need to fetch this data to ensure we use **Real Data**.

1.  **Source URL**: `https://vega.github.io/editor/data/normal-2d.json`
2.  **Extraction Method**: 
    *   I will create a script/function to fetch this JSON during the component mount or build time.
    *   **Fallback**: If fetching fails during the agent's execution environment, I will extract a representative subset of the data structure (fields `u` and `v`) and hardcode it as a constant to guarantee the visualization renders with real-world distribution patterns (Normal Distribution).
    *   **Structure**: The data is an array of objects: `[{ "u": -0.12, "v": 0.34 }, ...]`.

## 4. Implementation Steps

### Step 1: Setup & Data Fetching
*   Initialize the `Visualization` component.
*   Implement a `useEffect` hook to fetch data from the URL.
*   Store data in a React state `data`.
*   Calculate domain (min/max) for `u` and `v` to set axis scales correctly.

### Step 2: Component Layout (Next.js/Tailwind)
*   Create a "Card" container with `backdrop-blur-md`, `bg-white/10`, and `rounded-3xl` for the premium glassmorphism look.
*   Add a header section:
    *   **Title**: "Bivariate Distribution" (or derived from context).
    *   **Subtitle**: "Analysis of U vs V coordinates".
*   Add a "Stats" bar at the top or bottom displaying the number of points (N).

### Step 3: Recharts Configuration
*   Use `ResponsiveContainer` to handle mobile width.
*   Use `ScatterChart`.
*   **X Axis**: `dataKey="u"`, type="number", position="bottom", tickCount={5}.
*   **Y Axis**: `dataKey="v"`, type="number", position="left", tickCount={6}.
*   **Tooltip**: Use a custom `Tooltip` component that is **invisible** but triggers a state update to show data in the fixed "Data Card" area (solving the fat-finger problem). Alternatively, style the Recharts default tooltip to be high-contrast and positioned intelligently.
*   **Scatter**: Set `fill="#3b82f6"` (Tailwind blue-500), `fillOpacity={0.6}`, and `r={4}` (radius).

### Step 4: Enhancing UX
*   **Touch Interaction**: Ensure `Tooltip` is active on tap/touch.
*   **Selection Feedback**: When a point is active (touched), render a `ReferenceDot` or change the specific point's style (if Recharts allows granular control via Cell or activeIndex) to `firebrick` (red) to mimic the original "hover" intent.
*   **Grid**: Add subtle `CartesianGrid` with `strokeDasharray="3 3"` and low opacity to guide the eye without cluttering.

### Step 5: Premium Styling
*   Background: Dark gradient background (e.g., slate-900 to slate-800) to make the scatter points pop.
*   Typography: Sans-serif, legible font sizes (min 12px for axis, 18px for title).
*   Icons: Use `Lucide React` for a "Reset Zoom" or "Info" icon if needed.

## 5. Summary of Differences (Desktop vs. Mobile)

| Feature | Original Desktop | Planned Mobile | Justification |
| :--- | :--- | :--- | :--- |
| **Axes Position** | Top / Right | Bottom / Left | Mobile reading patterns & thumb reach. |
| **Interaction** | Hover to highlight | Touch/Drag to highlight | No hover on mobile; prevents "fat finger" errors. |
| **Feedback** | Color change | Data Card + Crosshair | Clearer reading of values on small screens. |
| **Dot Size** | Tiny (1-2px equivalent) | Larger (4-6px) | Visibility on high-DPI screens. |
| **Aspect Ratio** | Wide (5:3) | Tall/Square (4:5 or 1:1) | Fits portrait scrolling workflow. |