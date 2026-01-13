# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization & Mobile Challenges

### Original Visualization (Desktop)
- **Type**: Scatter Plot with Overlayed Confidence Ellipses (Density Estimation).
- **Data**: "Penguins" dataset.
    - **X-Axis**: Flipper Length (mm).
    - **Y-Axis**: Body Mass (g).
    - **Color/Group**: Species (Adelie, Chinstrap, Gentoo).
- **Narrative**: Comparing the correlation between flipper length and body mass across three penguin species. The ellipses highlight the distribution range and correlation strength.
- **Visual Encoding**:
    - **Points**: Individual data entries (Scatter).
    - **Polygons (Ellipses)**: Semi-transparent filled shapes representing statistical deviation.
    - **Legend**: Located on the right side.

### Mobile Challenges (Desktop-on-Mobile Analysis)
1.  **Aspect Ratio Distortion**: The wide aspect ratio (approx 2:1) of the desktop version, when compressed to mobile width, makes the chart extremely short. This squashes the Y-axis range, making vertical separation between points difficult to distinguish.
2.  **Legend Space**: The right-aligned legend consumes approximately 20-25% of the horizontal screen real estate. On mobile, this leaves very little room for the actual data.
3.  **Touch Targets**: The scatter points are relatively small. Hover interactions (standard on desktop) do not exist on mobile.
4.  **Label Readability**: Axis labels and titles may become too small to read if simply scaled down.
5.  **Data Density**: The ellipses overlap significantly. On a small screen, the transparency blending might become muddy without proper color handling.

## 2. Vis2Mobile Design Action Plan

Based on the **Vis2Mobile Design Action Space**, I plan to apply the following actions to transform this visualization.

### L0: Visualization Container
*   **Action: Rescale (Aspect Ratio Adjustment)**
    *   *Reason*: The original "wide" format fails on vertical mobile screens.
    *   *Plan*: Change the container aspect ratio to a taller format (e.g., 1:1 square or 4:5 portrait). This utilizes the vertical scroll behavior of mobile usage and decompresses the Y-axis data.

### L3: Legend Block
*   **Action: Reposition & Transpose**
    *   *Reasoning*: The side legend creates a "Distorted layout" on mobile.
    *   *Plan*: Move the legend to the **top** of the chart (below the main title). Transpose it from a vertical list to a horizontal row of "Chips" or "Badges".
*   **Action: Interaction (Filter)**
    *   *Plan*: Make the legend chips interactive. Tapping a species (e.g., "Adelie") acts as a filter or focus mechanism, dimming the other species to reduce "Overplotting" on the small screen.

### L3/L4: Coordinate System (Axes)
*   **Action: Decimate Ticks (Adjust Ticks)**
    *   *Reason*: High density of tick labels on the X-axis will lead to overlapping text on narrow screens.
    *   *Plan*: Reduce `tickCount` for the X-axis (e.g., max 5 ticks).
*   **Action: Simplify Label**
    *   *Reason*: "Flipper Length (mm)" is long.
    *   *Plan*: Keep the unit but ensure font size is readable (min 12px). If space is tight, move units to the subtitle or a corner label.

### L2: Data Marks (Scatter & Ellipses)
*   **Action: Rescale (Mark Size)**
    *   *Reason*: Small dots are hard to see and tap.
    *   *Plan*: Increase the base size of the scatter circles.
*   **Action: Recompose (Handling Ellipses in Recharts)**
    *   *Constraint*: Recharts standard `Scatter` doesn't support arbitrary filled polygons easily.
    *   *Plan*: Use the `Customized` component or SVG `path` overlays within the Recharts container to render the ellipse data using the extracted coordinates. This ensures the "Confidence/Deviation" narrative is preserved.

### L5: Interaction & Feedback
*   **Action: Reposition (Fix Tooltip Position)**
    *   *Reason*: Standard tooltips follow the cursor. On mobile, the finger obscures the tooltip.
    *   *Plan*: Implement a **"Selected State"**. When a user taps a dot, display the specific data details (Sex, Island, exact mass) in a fixed card at the bottom of the visualization or in a dedicated "Active Data" header space.
*   **Action: Disable Hover / Enable Tap**
    *   *Reason*: Touch interface.

### Premium Aesthetics (UI Layer)
*   **Theme**: Glassmorphism.
    *   Background: Semi-transparent blurred cards for the legend and tooltip area.
    *   Colors: Vivid, accessible palette for the three species (Blue, Orange, Red) ensuring high contrast against the background.
    *   Animation: Smooth transitions when filtering species.

## 3. Data Extraction Strategy

I will extract the data directly from the HTML source `spec` variable.

1.  **Ellipse Data**: Located in `spec.datasets["data-cb82d8ff5c0aec46ce272db75233113e"]`.
    *   *Fields*: `order`, `Flipper Length (mm)`, `Body Mass (g)`, `Species`.
    *   *Usage*: This will be converted into three separate arrays (one per species) to draw the SVG paths.
2.  **Scatter Data**: Located in `spec.datasets["data-300f0a3d0d4c94aa773629def4db880e"]`.
    *   *Fields*: `Species`, `Island`, `Beak Length (mm)`, `Beak Depth (mm)`, `Flipper Length (mm)`, `Body Mass (g)`, `Sex`.
    *   *Usage*: Main data source for the scatter plot.

**Note on Data Processing**: The raw ellipse data is a set of points. To render this in Recharts/SVG, I will need to sort them by `order` and construct an SVG path string (`M x1 y1 L x2 y2 ... Z`) for each species.

## 4. Implementation Plan (Step-by-Step)

### Step 1: Data Preparation (`src/data/penguinData.ts`)
*   Create a TS file to export `scatterData` and `ellipseData`.
*   Clean keys (remove spaces/units from keys for easier coding, e.g., `Body Mass (g)` -> `bodyMass`).
*   Group ellipse data by species and sort by `order` to prepare for path generation.

### Step 2: Component Architecture (`src/components/Visualization.tsx`)
*   **Layout Wrapper**: A standard container with padding, utilizing Tailwind for responsive width.
*   **Header**: Title ("Penguin Morphology") and Subtitle ("Body Mass vs Flipper Length").
*   **Controls**: A flex-row of toggle buttons for Species (Legend).
*   **Chart Container**: `ResponsiveContainer` wrapping a `ComposedChart`.

### Step 3: Visualization Implementation (Recharts)
*   **X Axis**: `dataKey="flipperLength"`, type number, domain `['auto', 'auto']` (or specific range based on data to avoid whitespace).
*   **Y Axis**: `dataKey="bodyMass"`, type number.
*   **Ellipses Layer**:
    *   Use Recharts `<Customized />`.
    *   Inside the custom component, iterate through the 3 species.
    *   Use the X and Y scales provided by Recharts to transform data coordinates to pixel coordinates.
    *   Render `<path>` elements with `fillOpacity={0.2}`.
*   **Scatter Layer**:
    *   Use `<Scatter />` component.
    *   Map data to the axes.
    *   Color points based on species.

### Step 4: Mobile Interaction Logic
*   State: `activeSpecies` (for filtering), `selectedPoint` (for tooltip).
*   Interaction:
    *   Tap Scatter Point -> Set `selectedPoint`.
    *   Tap Background -> Clear `selectedPoint`.
*   Feedback:
    *   Render a **"Detail Card"** (Glassmorphism style) floating at the bottom or fixed below the header when a point is selected.

### Step 5: Styling & Polish
*   Apply Tailwind classes for typography (Inter font, legible sizes).
*   Add subtle animations using `framer-motion` (optional) or CSS transitions for the filter chips.
*   Ensure axis lines are minimal (`stroke-gray-200`) and grid lines are dashed and subtle.

This plan moves the visualization from a static, desktop-centric analysis tool to an interactive, mobile-friendly exploration interface.