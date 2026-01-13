# Vis2Mobile Plan: Horsepower vs. Cylinders Distribution

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Tick Plot (or Strip Plot).
- **Axes**:
  - X-Axis: Horsepower (Quantitative, ~0 to 230).
  - Y-Axis: Cylinders (Ordinal, Categories: 3, 4, 5, 6, 8).
- **Marks**: Vertical tick lines representing individual cars.
- **Insight**: Shows the density and distribution of horsepower within specific cylinder counts.
- **Interaction**: Likely hover-based tooltips (inferred from Vega-Lite defaults).

### Mobile Issues (Desktop on Mobile)
- **Overplotting**: The aspect ratio squishes the X-axis. High-density areas (like 4-cylinder cars between 50-100 HP) become solid blocks of color, making it impossible to distinguish individual data points or true density.
- **Touch Targets**: Vertical ticks (1px wide) are impossible to accurately tap with a finger.
- **Vertical Space**: The Y-axis labels take up horizontal space to the left, compressing the chart width further.
- **Context**: Axis titles and labels are small and hard to read.

## 2. Design Action Space & Strategy

To transform this into a premium mobile experience, I will apply the following actions from the Vis2Mobile Design Action Space:

### **L0: Visualization Container**
- **Action: `Rescale` (Width: 100%, Height: Auto)**
    - **Reasoning**: The chart must adapt to full screen width. Instead of a fixed aspect ratio, we will allow the container to grow vertically based on the content (number of cylinder categories).
- **Action: `Reposition` (Global Padding)**
    - **Reasoning**: Add `p-4` or similar to ensure content doesn't touch screen edges.

### **L1: Data Model**
- **Action: `Recompose (Jitter)` (Simulated)**
    - *Note: This is a specific type of Data Transformation not explicitly listed as a high-level category but falls under managing "Overplotting".*
    - **Reasoning**: To solve the "solid block" issue without aggregating data (which would lose the granularity of the desktop view), I will add a randomized Y-offset ("Jitter") to the points within their cylinder category. This spreads points out, revealing density.

### **L2: Coordinate System**
- **Action: `Serialize layout` (L1/L2)**
    - **Reasoning**: Instead of one compressed chart, I will treat each Cylinder category as a "Lane" or "Track". Visually, this separates the data into distinct horizontal bands, giving them more vertical breathing room.

### **L2: Data Marks**
- **Action: `Recompose (Change Encoding)` (Tick → Scatter Dot)**
    - **Reasoning**: Vertical ticks are for density viewing on wide screens. On mobile, **Dots (Circles)** are better because:
        1. They are friendlier touch targets.
        2. With opacity (alpha channel), overlapping dots show density better than solid lines.
- **Action: `Rescale` (Mark Size)**
    - **Reasoning**: Set dot radius to a tappable size (e.g., ~4-6px visually, with larger invisible hit area) or purely visual dots with a larger touch handler.

### **L3: Axes**
- **Action: `Reposition` (Y-Axis Labels)**
    - **Reasoning**: Move Cylinder labels (e.g., "8 Cylinders") from the left of the chart to **above** each data track (Inline headers). This recovers horizontal space for the actual data.
- **Action: `Recompose (Remove)` (X-Axis Gridlines)**
    - **Reasoning**: Reduce visual clutter. We will use a subtle background track for the lanes instead.

### **L5: Interaction & Feedback**
- **Action: `Reposition (Fix)` (Tooltip -> Bottom Sheet)**
    - **Reasoning**: Hover is unavailable. Tapping a specific dot in a dense cluster is hard. I will implement a "Nearest Neighbor" interaction or simply highlight the selected car and show its details in a **Fixed Bottom Sheet** or a card below the chart, preventing occlusion.
- **Action: `Compensate (Toggle)` (Details)**
    - **Reasoning**: Since tapping small dots is hard, tapping anywhere in the "Lane" could potentially show summary stats (Avg Horsepower), while scrubbing (pan) could highlight specific cars. *Decision: Tap to select specific car (using nearest neighbor resolution).*

## 3. Data Extraction Plan

The source code explicitly provides the data URL.

1.  **Source**: `https://vega.github.io/editor/data/cars.json`
2.  **Fields Needed**:
    -   `Horsepower` (Quantitative, X-axis)
    -   `Cylinders` (Ordinal, Grouping)
    -   `Name` (For Tooltip/Details)
    -   `Origin` / `Year` (For extra context in the mobile detail view)
3.  **Preprocessing**:
    -   Fetch JSON.
    -   Filter out entries where `Horsepower` or `Cylinders` is `null`.
    -   Group data by `Cylinders` to render separate "Lanes".
    -   Calculate `min` and `max` Horsepower for the global X-axis domain to ensure all lanes share the same scale.

## 4. Implementation Steps

### Step 1: Data Acquisition & Processing
- Create a utility function to fetch `cars.json`.
- Process data:
    - Determine global X-domain (0 to Max HP).
    - Sort unique Cylinder values.
    - Generate a "jitter" value for each data point (random value between -0.2 and 0.2) to offset it vertically within its lane.

### Step 2: Component Structure (Mobile First)
- **Container**: Use a `flex-col` layout.
- **Header**: Title "Horsepower Distribution", Subtitle "By Cylinder Count".
- **Lanes (The Chart)**:
    - Instead of one single Recharts instance, use **Separate Recharts Instances** (or one composed chart with custom SVG elements) for each Cylinder group?
    - *Better Approach*: Use a single `<ComposedChart>` with `layout="vertical"`? No, Recharts `ScatterChart` is best.
    - We will use **One single ScatterChart** but map the Y-axis to the Cylinder values (3, 4, 5, 6, 8).
    - We will use a **Custom Shape** for the scatter point to render the dots with specific styling (glassmorphism glow).
- **X-Axis**: Only render one X-axis at the bottom.
- **Y-Axis**: Hidden. We will render custom HTML/Text labels *inside* the chart area to label the lanes (e.g., "8 Cylinders").

### Step 3: Visual Styling (Premium Aesthetics)
- **Palette**: Dark/Glass background.
- **Dots**: Use a vibrant color (e.g., Cyan or Electric Blue) with `fillOpacity={0.6}` to show density.
- **Typography**: Sans-serif, large readable numbers.
- **Animation**: Smooth entry animation for the dots.

### Step 4: Interaction
- Implement a `Tooltip` that is **custom and fixed**.
- When a user taps or drags over the chart:
    - Use `Recharts` `Tooltip` with a custom `content` prop.
    - Instead of rendering a floating tooltip, the `content` component will render `null` but utilize a callback/state to update a **Detail Card** fixed at the bottom of the screen.
    - This "Detail Card" displays the specific Car Name and HP.

### Step 5: Refinement
- Ensure text sizes are `text-sm` or `text-base` (no tiny 10px text).
- Check contrast ratios.