# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Characteristics
- **Type**: Normalized Stacked Area Chart (100% Stacked).
- **Data**: Unemployment counts across 14 industries from 2000 to 2010, normalized to show proportions.
- **Layout**: Chart occupies left 70%, Legend occupies right 30%.
- **Colors**: Uses `category20b`, a palette with many distinct colors for the 14 series.
- **X-Axis**: Time (Year-Month) with yearly ticks.
- **Y-Axis**: Implicit 0% to 100% (hidden axis labels, visible stack).

### Mobile Issues (Diagnosis)
1.  **Aspect Ratio**: The `desktop_on_mobile.png` shows the chart flattened vertically, making changes in the bands almost indistinguishable.
2.  **Legend Layout**: The vertical legend on the right consumes nearly half the screen width on mobile, compressing the data visualization into a tiny, unreadable strip.
3.  **Interaction**: 14 stacked bands are difficult to interact with individually via touch ("Fat-finger problem").
4.  **Labeling**: X-axis ticks (years) may overlap or become too small if simply shrunk.
5.  **Data Density**: Tracking a single industry's trend across the wiggly stacked bands is cognitively high-load on a small screen.

## 2. Vis2Mobile Design Action Plan

Based on the `mobile-vis-design-action-space.md`, here is the transformation strategy:

### L0: Visualization Container
- **Action: `Rescale`**
    - **Reasoning**: The desktop aspect ratio is landscape. Mobile requires a portrait or square aspect ratio to give the stacked areas enough vertical breathing room to show variation.
    - **Implementation**: Set container width to 100% and height to a fixed mobile-friendly value (e.g., `h-80` or `aspect-square`).

### L1: Interaction Layer & Narrative
- **Action: `Reposition (Fix)` (Feedback)**
    - **Reasoning**: A floating tooltip following a finger is unreadable (obscured by hand).
    - **Implementation**: Create a "Fixed Summary Card" or "Sticky Header/Footer" that updates dynamically as the user scrubs across the chart.
- **Action: `Recompose (Replace)` (Triggers)**
    - **Reasoning**: Hover is unavailable.
    - **Implementation**: Implement a "Scrubbing" gesture (Touch/Drag on chart area) to lock the vertical cursor to a specific month.

### L3: Legend Block (The Critical Fix)
- **Action: `Reposition` & `Transpose`**
    - **Reasoning**: The side-by-side layout is impossible on mobile.
    - **Implementation**: Move the legend below the chart. Change layout from a vertical list (`column`) to a flexible wrapping grid (`row` wrap) or a horizontal scrollable strip.
- **Action: `Compensate (Toggle)` (Alternative Strategy)**
    - **Reasoning**: 14 items take up too much vertical space even at the bottom.
    - **Implementation**: Initially show the chart. Place a "Filter / Legend" button that opens a Bottom Sheet (Drawer) containing the full interactive legend. However, for a stacked chart, seeing colors is vital.
    - **Selected Strategy**: **Hybrid**. Show the Top 3-5 industries in a summary below the chart dynamically based on the selected time slice, or use a scrollable horizontal legend.

### L2/L3: Coordinate System & Axes
- **Action: `Decimate Ticks` (X-Axis)**
    - **Reasoning**: Showing every year (2000-2010) might crowd the X-axis.
    - **Implementation**: Show every 2 or 3 years, or just Start, Middle, End (2000, 2005, 2010).
- **Action: `Recompose (Remove)` (Y-Axis)**
    - **Reasoning**: In a normalized 100% chart, the exact Y-axis numbers (0.1, 0.2...) are less important than the relative proportions shown in the tooltip.
    - **Implementation**: Hide Y-axis lines and ticks to save horizontal space.

### L2: Data Marks (Area)
- **Action: `Focus` (Interaction)**
    - **Reasoning**: It is hard to follow one specific band in a stack of 14.
    - **Implementation**: When a user taps a specific Industry in the Legend, highlight that Area (full opacity) and dim the others (low opacity).

## 3. Data Extraction Plan

The original HTML sources data from a JSON URL. I will fetch/extract this data.

1.  **Source**: `https://vega.github.io/editor/data/unemployment-across-industries.json`
2.  **Structure**: Array of objects: ` { "series": "Agriculture", "year": 2000, "month": 1, "count": 12.5, "date": "2000-01-01..." }`
3.  **Transformation for Recharts**:
    - Recharts `AreaChart` prefers data shaped like:
      ```typescript
      [
        {
          date: "2000-01",
          Agriculture: 12.5,
          "Business services": 20.1,
          ...
        },
        ...
      ]
      ```
    - I will write a utility function to group the raw JSON by date and pivot the industries into keys.

## 4. Implementation Steps

### Step 1: Project & Component Structure
- Initialize `src/components/UnemploymentStackChart.tsx`.
- Create a layout wrapper that centers the content for mobile view (max-w-md).

### Step 2: Data Processing
- Create a `data.ts` file.
- Extract the raw data from the provided URL source.
- Implement the `processData` function to pivot the flat array into a Recharts-friendly structure (Group by Date -> Keys are Series).
- Extract unique Series names for the Legend/Color map.

### Step 3: Core Visualization (Recharts)
- Implement `ResponsiveContainer` with a taller aspect ratio (e.g., height 400px).
- Add `AreaChart` with `stackOffset="expand"` (Recharts equivalent to Vega's `stack: "normalize"`).
- Map the 14 Series to `Area` components.
- Apply the `category20b` colors manually or via a D3 scale utility.

### Step 4: Mobile Interactions (The "Wow" Factor)
- **Custom Tooltip**: Instead of a floating box, use a **Context Header**. When the user touches the chart, the Header displays the Date (e.g., "Jan 2005") and a sorted list of the top industries for that specific month.
- **Interactive Legend**: Place a grid of industry chips below the chart.
    - Default state: All colored.
    - Tap state: Highlights specific industry in the chart (sets others to grayscale/opacity 0.2).

### Step 5: Styling & Polish
- Use Tailwind for typography (Inter font).
- Add Glassmorphism to the header/tooltip area (`backdrop-blur-md bg-white/30`).
- Ensure axes labels use a readable, subdued grey color.
- Add animation: `isAnimationActive={true}` on Areas for initial load.

### Step 6: Final Review
- Check against "Fat-finger" issues.
- Verify text readability (Action: `Rescale` font sizes if needed).
- Verify color contrast.