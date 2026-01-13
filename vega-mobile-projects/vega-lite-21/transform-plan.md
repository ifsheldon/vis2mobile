# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Analysis
- **Type**: Tick Plot / Strip Plot (1D Scatterplot stratified by a categorical variable).
- **Data**: `cars.json` containing automotive data.
- **Encoding**:
    - **X-axis**: Horsepower (Quantitative, linear scale).
    - **Y-axis**: Cylinders (Ordinal/Categorical, discrete steps: 3, 4, 5, 6, 8).
    - **Mark**: "Tick" (vertical line segments).
- **Purpose**: To show the distribution and density of horsepower values within each cylinder category. It allows comparison of ranges and clusters (e.g., 8 cylinders have generally higher HP).

### Mobile Issues (Desktop on Mobile)
1.  **Overplotting/Density**: The desktop version relies on horizontal width to spread out the Horsepower values. On a narrow mobile screen, the X-axis (Horsepower) will be compressed, causing the ticks to overlap heavily, obscuring the density patterns.
2.  **Interaction**: The individual tick marks are extremely thin (1px lines). They are impossible to tap accurately with a finger ("Fat-finger problem").
3.  **Readability**: The axis labels for Horsepower will likely be too small or decimated too aggressively if simple scaling is used.
4.  **Whitespace**: The aspect ratio of the original (wide and short) creates significant unused whitespace on a portrait mobile screen if preserved directly.

---

## 2. Transformation Reasoning & Plan (Vis2Mobile Action Space)

To create a premium, mobile-first experience, I will apply the following actions from the design space:

### **L2 Coordinate System: Transpose (Axis-Transpose)**
*   **Action**: Swap the X and Y axes.
    *   **New Y-axis**: Horsepower (Quantitative).
    *   **New X-axis**: Cylinders (Ordinal).
*   **Reasoning**: Mobile devices have limited horizontal width but "infinite" vertical scrolling.
    *   Original: HP on X (Horizontal). Squeezes ~200 data points into ~350px width.
    *   Mobile: HP on Y (Vertical). We can set a tall height (e.g., 600px or 80vh), giving the distribution room to breathe. The "Tick" marks become horizontal lines stacked vertically.

### **L2 Data Marks: Recompose (Change Encoding/Style)**
*   **Action**: Enhance Mark Styling & Custom Shape.
*   **Reasoning**:
    *   **Shape**: The original uses vertical ticks. Since we are transposing, I will use **horizontal markers** (custom SVG shape in Recharts).
    *   **Style**: I will apply **Color Encoding** based on Cylinder count (e.g., 4 Cylinders = Blue, 8 Cylinders = Red). This is an addition (not in original) but crucial for mobile aesthetics and quick visual differentiation in a vertical layout.
    *   **Opacity**: Use opacity/transparency to handle overlapping marks, ensuring density is still visible.

### **L0 Visualization Container: Rescale**
*   **Action**: `width: 100%`, `height: 65vh`.
*   **Reasoning**: Instead of the fixed desktop aspect ratio, the component will take up a significant portion of the vertical screen real estate to maximize resolution for the quantitative axis (Horsepower).

### **L5 Interaction & Labels: Fix Tooltip Position**
*   **Action**: `Reposition (Fix)` to a Bottom Sheet / Data Card.
*   **Reasoning**: Traditional tooltips are blocked by fingers on mobile.
    *   I will implement a **Sticky Data Card** at the bottom of the component.
    *   **Trigger**: Since individual ticks are hard to tap, I will use a **Voronoi** or "closest point" strategy. Tapping anywhere in a "Cylinder Lane" will highlight the closest data point and update the Data Card with details (Name, HP, Cylinders).

### **L3/L4 Axes: Decimate Ticks & Simplify**
*   **Action**: `Decimate Ticks` & `Remove Axis Line`.
*   **Reasoning**:
    *   Y-Axis (Horsepower): Show gridlines for reference but remove the solid axis line to reduce visual noise. Use fewer ticks (e.g., every 50 HP).
    *   X-Axis (Cylinders): Display distinct labels (3, 4, 5, 6, 8) at the bottom.

### **L1 Narrative: Emphases (Add Summary)**
*   **Action**: Add statistical summary overlay (Optional but Premium).
*   **Reasoning**: Since raw ticks can be messy, adding a faint "Average" line or median marker for each cylinder group helps interpret the distribution instantly. *Decision: I will focus on the raw ticks first to respect the original "Tick Plot" mark, but add a subtle background band or average indicator if it aids clarity.*

---

## 3. Data Extraction Plan

The data is external, hosted at a specific URL provided in the HTML source. I will not fake data; I will fetch it dynamically or include the raw JSON structure if static import is preferred for reliability.

**Source**: `https://vega.github.io/editor/data/cars.json`

**Processing Strategy**:
1.  **Fetch**: Retrieve the JSON array.
2.  **Filter/Map**:
    *   Extract fields: `Name` (for tooltip context), `Horsepower`, `Cylinders`.
    *   Filter out null/undefined `Horsepower` or `Cylinders`.
3.  **Grouping**: No aggregation needed for the plot itself (it's a strip plot showing raw data), but I may calculate `min`, `max`, and `avg` HP per cylinder group for the "Premium" summary card.

---

## 4. Implementation Steps

### Step 1: Component Structure (Next.js)
*   Create `src/components/Visualization.tsx`.
*   Use `useClient` pattern for Recharts interaction.
*   State Management: `selectedCar` (object) to control the interactive data card.

### Step 2: Data Loading & Processing
*   Create a utility function to fetch the `cars.json` data.
*   Process data into a format suitable for Recharts ScatterPlot.
    *   *Note*: Recharts doesn't have a "Strip Plot". I will use `ScatterChart`.
    *   X-Axis = `Cylinders` (Type: Category/Number). I will map categorical values (3,4,5,6,8) to specific integer coordinates on the X-axis domain to control spacing.
    *   Y-Axis = `Horsepower`.

### Step 3: The Chart Implementation (Recharts)
*   **Chart**: `ScatterChart` with `margin={{ top: 20, right: 20, bottom: 20, left: 0 }}`.
*   **XAxis**: Type `category`, dataKey `Cylinders`, allowDuplicatedCategory={false}.
*   **YAxis**: Type `number`, dataKey `Horsepower`, unit " hp", hide axis line, keep tick labels light.
*   **Custom Shape**: Create a `renderShape` function for `<Scatter />`. Instead of a circle, render a rectangle or line: `<rect x={cx - width/2} y={cy - 2} width={width} height={4} rx={2} />`.
    *   This mimics the "tick" but makes it premium (rounded caps, slight height).

### Step 4: Premium UI Wrapper (Tailwind)
*   **Card**: Wrap the chart in a `div` with `bg-white/10 backdrop-blur-md` (Glassmorphism) and a subtle border.
*   **Typography**: Use a modern font stack. Title: "Horsepower Distribution". Subtitle: "By Cylinder Count".
*   **Color Palette**: Define a map: `{ 3: 'bg-emerald-400', 4: 'bg-blue-400', 5: 'bg-violet-400', ... }`.

### Step 5: Mobile Interaction
*   **Tooltip**: Disable default Recharts tooltip.
*   **On Click**: Use `onClick` on the Scatter points (or cell) to set `selectedCar` state.
*   **Feedback**: Render a "Details Panel" below the chart when a car is selected, showing the specific car model and its specs.

### Step 6: Refinement
*   Add animation (`framer-motion` or Recharts default) for initial load.
*   Ensure dark mode compatibility (using Tailwind `dark:` classes).