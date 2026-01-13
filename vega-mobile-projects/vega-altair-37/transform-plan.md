# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization
*   **Source**: Vega-Lite Scatter Plot (Penguin Dataset).
*   **Desktop View**: A standard scatter plot correlating Flipper Length (X) vs. Body Mass (Y).
    *   **Color Encoding**: Species (Adelie: Blue, Chinstrap: Orange, Gentoo: Red).
    *   **Size Encoding**: Beak Depth (mm).
    *   **Layout**: Chart on the left, detailed legend (Color & Size) on the right.
*   **Mobile Issues (Simulated)**:
    *   **Aspect Ratio Distortion**: Compressing the X-axis (170-230mm) into a narrow mobile screen causes severe overlap (overplotting), making individual points indistinguishable.
    *   **Legend Space**: The right-side legend consumes ~30% of the horizontal space, leaving the chart tiny.
    *   **Touch Targets**: Small bubbles (representing low Beak Depth) are too small to tap reliably.
    *   **Readability**: Axis labels and titles become microscopic when scaled down directly.
    *   **Context**: The "Size" encoding (Beak Depth) is visually subtle on mobile screens and difficult to interpret without a clear reference.

## 2. High-Level Strategy
To create a premium mobile-first experience, we will move from a "Dashboard" layout to an "App" layout.
1.  **Layout Transformation**: Remove the side legend. Use a **Top Navigation Bar** for high-level filtering (Species) and title.
2.  **Interactive Canvas**: Maximize the width of the chart.
3.  **Detail Interaction**: Replace hover tooltips with a **Bottom Sheet (Drawer)** or a **Fixed Detail Card** that appears upon tapping a dot. This solves the "finger covering tooltip" issue.
4.  **Zoom/Pan**: Since the data density is high, we will implement a "Zoomable" view or ensure the domain is optimized to utilize the full height of the mobile screen (Portrait mode usually has more vertical space). *Correction*: Standard Recharts doesn't support pinch-zoom easily. We will optimize the **Domain** to cut out empty space (start Y at 2500, X at 170) and increase the chart height (`h-96` or `h-[50vh]`) to spread points vertically.
5.  **Aesthetics**: Apply a modern, clean distinct color palette (matching the original logic but refined) and glassmorphism for the detail overlay.

## 3. Vis2Mobile Design Actions

### L0: Visualization Container
*   **Action: Rescale (Resize)**
    *   *Reason*: The fixed pixel width/height from the desktop HTML is invalid. We will use `ResponsiveContainer` (width: 100%) and set a fixed aspect ratio suitable for vertical scrolling (e.g., height 400px-500px).
*   **Action: Reposition (Margins)**
    *   *Reason*: Reduce chart margins. Mobile screens have no room for white space. Labels will be moved inside or closer to axes.

### L1: Data Model
*   **Action: Recompose (Filter/Highlight)**
    *   *Reason*: Overplotting is a major issue. We will add **Interactive Legend Chips** (Species) at the top. Tapping "Adelie" will dim or hide other species. This allows the user to focus on one group at a time on a small screen.

### L2: Coordinate System & Axes
*   **Action: Decimate Ticks (L3)**
    *   *Reason*: Desktop X-axis has ticks every 10mm. On mobile, this crowds the bottom. We will reduce tick count to 3-4 key milestones.
*   **Action: Recompose (Remove Axis Lines)**
    *   *Reason*: Remove outer axis lines (L4), keep only subtle gridlines to reduce visual weight.
*   **Action: Format Tick Label (L5)**
    *   *Reason*: Simplify "2,500" to "2.5k" or keep as is but increase font size slightly for readability.

### L2: Data Marks (Bubbles)
*   **Action: Rescale (Mark Size)**
    *   *Reason*: The original size encoding (Beak Depth) maps to area. On mobile, we must ensure the *minimum* radius is at least 4-5px to be visible, even if it distorts the strict mathematical ratio slightly. This improves accessibility.
*   **Action: Interaction (Click Trigger)**
    *   *Reason*: Hover is impossible. Implement `onClick` to trigger a state change that opens a detail view.

### L2: Auxiliary Components (Legend)
*   **Action: Reposition (Top)**
    *   *Reason*: Move the Legend from Right to Top. Convert it into a horizontal scrollable list or a flex-wrap container of "Chips".
*   **Action: Recompose (Remove/Simplify)**
    *   *Reason*: The "Size" legend (Beak Depth circles) consumes too much space. We will remove the visual size legend and instead explain it in the Detail View (e.g., "Bubble size indicates Beak Depth").

### L5: Feedback (Tooltip)
*   **Action: Reposition (Fix -> Bottom Sheet)**
    *   *Reason*: Standard tooltips are blocked by fingers. We will use a fixed area at the bottom of the screen (or a floating glassmorphic card) that populates with data when a bubble is active.

## 4. Data Extraction Plan

The data is embedded in the HTML script tag within the `spec` JSON object.

1.  **Locate Data Source**: Inside `var spec = { ... }`.
2.  **Target Array**: `spec.datasets["data-783f637a646b8ff8439f6e7d741cecf0"]`.
3.  **Field Mapping**:
    *   `id`: Generate a unique index (0...n).
    *   `species`: "Species" (String) -> Maps to Color.
    *   `island`: "Island" (String) -> Display in Detail View.
    *   `flipperLength`: "Flipper Length (mm)" (Number) -> **X Axis**.
    *   `bodyMass`: "Body Mass (g)" (Number) -> **Y Axis**.
    *   `beakDepth`: "Beak Depth (mm)" (Number) -> **Z Axis (Size)**.
    *   `sex`: "Sex" (String) -> Display in Detail View.
4.  **Cleaning**: Filter out entries where `Flipper Length (mm)` or `Body Mass (g)` is `null` (observed in source: `{"Species": "Adelie", ..., "Flipper Length (mm)": null...}`).

## 5. Implementation Steps

### Step 1: Data Preparation
*   Create a `data.ts` file.
*   Copy the JSON array from the source.
*   Clean the data (remove nulls).
*   Calculate Min/Max for X and Y axes to define the Recharts `domain` dynamically (add ~5% padding).

### Step 2: Component Layout (Next.js)
*   **Header**: Title "Penguin Morphology" + Subtitle "Flipper Length vs. Body Mass".
*   **Filter Bar**: Row of clickable badges: [All] [Adelie (Blue)] [Chinstrap (Orange)] [Gentoo (Red)].
*   **Chart Area**: `ResponsiveContainer` with `ScatterChart`.
*   **Detail Panel**: A placeholder state `selectedPenguin`. When null, show a hint "Tap a bubble for details". When selected, show specific metrics.

### Step 3: Visualization (Recharts)
*   Use `<ScatterChart>`.
*   **XAxis**: Type number, dataKey "flipperLength", domain `['auto', 'auto']` (or specific calculated min/max), hide axis line, simplify ticks.
*   **YAxis**: Type number, dataKey "bodyMass", domain `['auto', 'auto']`, width 40, hide axis line.
*   **ZAxis**: Type number, dataKey "beakDepth", range `[60, 400]` (pixel area) to ensure visibility on mobile.
*   **Tooltip**: `cursor={{ strokeDasharray: '3 3' }}` but disable default content. Use `onClick` on `<Scatter />` to update React state.

### Step 4: Styling & Interactivity (Tailwind)
*   **Colors**: Define a palette object:
    *   Adelie: `#4C78A8` (Blue)
    *   Chinstrap: `#F58518` (Orange)
    *   Gentoo: `#E45756` (Red)
*   **Active State**: When a penguin is selected, increase the opacity of that specific bubble (if possible via cell rendering) or dim others.
*   **Glassmorphism**: Apply `backdrop-blur-md bg-white/30` to the Detail Panel.

### Step 5: Refinement
*   Add animations (`AnimatePresence` or CSS transitions) for the detail panel appearing.
*   Ensure the chart container has enough height (`h-[400px]`) so points don't cluster vertically.