# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Source Characteristics
- **Type**: Horizontal Stacked Bar Chart.
- **Data Dimensions**:
    - **Y-Axis (Nominal)**: `variety` (e.g., Glabron, Manchuria, No. 457).
    - **X-Axis (Quantitative)**: Sum of `yield`.
    - **Color/Stack (Nominal)**: `site` (e.g., University Farm, Waseca, Morris).
    - **Labels**: Numeric yield values embedded inside each stack segment.
- **Visual Density**: High. The desktop version relies heavily on internal text labels (`mark: text`) to convey exact values, which causes immediate overlap and illegibility when squished horizontally on mobile (as seen in `desktop_on_mobile.png`).

### Mobile Usability Issues
1.  **Text Overlap**: The text labels inside the bars are unreadable on mobile due to the reduced width of the segments.
2.  **Aspect Ratio**: The original aspect ratio forces the bars to be too short and the text too small.
3.  **Legend**: The legend on the right consumes nearly 20% of the horizontal width, compressing the actual chart area.
4.  **Touch Targets**: The individual segments (e.g., "Grand Rapids" yield for "Velvet") are likely too small to tap accurately on a phone.

## 2. Vis2Mobile Design Action Plan

Based on the `mobile-vis-design-action-space.md`, the following actions define the transformation strategy.

### L0: Visualization Container
*   **Action**: `Rescale` (Viewport & Scrolling).
    *   **Why**: The fixed height of the desktop view compresses the bars. We will use a fluid height container that allows the page to scroll vertically. This gives each "Variety" row enough breathing room (`min-height` per bar).
    *   **Why**: `width: 100%` with a simplified layout to maximize the data-ink ratio.

### L1: Chart Components / L2: Coordinate System
*   **Action**: Keep Horizontal Layout (No Transpose).
    *   **Reasoning**: Horizontal bars are actually ideal for mobile when category names (Varieties) are long. It allows labels to be read horizontally without head-tilting or rotation.
*   **Action**: `Reposition` (Margins).
    *   **Why**: Maximize width. Move Y-axis labels to be left-aligned above the bar or integrated into the layout to save horizontal space for the bars themselves.

### L2: Data Marks (The Bars)
*   **Action**: `Recompose (Remove)` (Internal Text Labels).
    *   **Why**: The white text numbers inside the bars are the primary cause of clutter. On mobile, these are impossible to read. We will remove the text layer entirely from the SVG rendering.
*   **Action**: `Rescale` (Bar Height).
    *   **Why**: Increase the thickness of the bars to make them clearer and friendlier.

### L3: Legend Block
*   **Action**: `Reposition` (Top/Bottom) & `Transpose`.
    *   **Why**: Move the legend from the right side (where it steals chart width) to the top (header) or make it a scrollable horizontal list. This gives full width to the bars.

### L5: Interaction & Feedback (Crucial for "Premium" Feel)
*   **Action**: `Recompose (Replace)` (Hover -> Tap).
    *   **Why**: Hover is unavailable.
*   **Action**: `Reposition (Fix)` (Tooltip -> Bottom Sheet/Card).
    *   **Why**: Instead of a floating tooltip covering the finger, tapping a bar will open a "Details Card" at the bottom of the screen (or update a fixed summary area) showing the breakdown of values for that specific Variety. This compensates for the removal of the internal text labels.

## 3. Data Extraction Plan

The data is embedded directly in the HTML file's JSON spec. I will extract the `datasets` object.

**Source Data Snippet**:
```json
"datasets": {
  "data-9cc0564cb5591205eeeca8d2429dd11b": [
    {"yield": 27, "variety": "Manchuria", "year": 1931, "site": "University Farm"},
    ...
  ]
}
```

**Extraction Strategy**:
1.  **Raw Data**: Copy the array from `datasets['data-9cc0564cb5591205eeeca8d2429dd11b']`.
2.  **Aggregation**: The original chart sums yields by `variety` and `site` (aggregating over `year`).
    *   *Processing*: I will perform a data transformation to group by `variety`.
    *   *Structure Goal*:
        ```typescript
        interface ChartData {
          variety: string;
          totalYield: number;
          sites: {
            [siteName: string]: number; // yield per site
          }
        }
        ```
3.  **Colors**: I will use the default Vega/Altair category10 color scheme usually implied, or pick premium colors matching the image (Blues, Oranges, Greens, Yellows) to replicate the aesthetic.
    *   University Farm: Green
    *   Waseca: Yellow
    *   Morris: Teal/Light Blue
    *   Crookston: Blue
    *   Grand Rapids: Red/Orange
    *   Duluth: Dark Orange

## 4. Implementation Steps

### Step 1: Data Preparation (`src/data/yieldData.ts`)
*   Create a Typescript file to house the raw JSON data.
*   Implement a helper function to Aggregate data: Group by `variety`, summing `yield` per `site`.
*   Calculate the global max `totalYield` to set the X-axis domain properly.

### Step 2: Component Shell (`src/components/Visualization.tsx`)
*   **Container**: A standard `div` with `w-full` and padding.
*   **Header**: Title "Crop Yield Analysis" and a subtitle summarizing the dataset.
*   **Legend**: A horizontal, scrollable flex container at the top showing Site colors.

### Step 3: Main Chart Implementation (Recharts)
*   **Library**: `Recharts` using `BarChart`, `Bar`, `XAxis`, `YAxis`.
*   **Layout**: `layout="vertical"`.
*   **Responsiveness**: Use `ResponsiveContainer` but with a specified `min-height` based on the number of varieties (e.g., `height={data.length * 60}`).
*   **Y-Axis**: Display `variety` names. Ensure font size is readable (e.g., 12px or 14px).
*   **Bars**: Stacked bars (`stackId="a"`).
    *   Map through the unique `site` list to generate `<Bar />` components.
    *   **Animation**: Enable smooth entry animation.
*   **Interactivity**:
    *   Disable default Tooltip (too intrusive).
    *   Add `onClick` to the `BarChart` or individual `Bar`s to select a `variety`.

### Step 4: The "Details" Interaction (Premium Feature)
*   **State**: `selectedVariety` (string | null).
*   **UI**:
    *   When a user clicks a bar (Variety), a **Glassmorphic Details Card** appears (either fixed at bottom or expanding inline).
    *   This card displays the precise numeric values (which we removed from the visual bars) in a clean table or list format.
    *   *Content*: "Manchuria Total: 350", followed by a list of sites and their specific yields.
    *   This satisfies **L2 Annotations: Compensate (Number)** – moving dense numbers to a dedicated view.

### Step 5: Styling (Tailwind)
*   **Theme**: Light mode with clean typography (Inter/Sans).
*   **Palette**: Use the extracted colors for the bars. Use slight transparency or borders to separate stacks.
*   **Typography**: Bold headings, subtle axis labels.

### Step 6: Final Review
*   Check strict mode compliance.
*   Verify no fake data is used.
*   Ensure scrollability works on mobile.

## 5. Justification of Deviation from Desktop
*   **Removed Numbers on Bars**: Essential for mobile legibility. Replaced with on-tap detailed view.
*   **Moved Legend**: Essential to reclaim horizontal width for the data.