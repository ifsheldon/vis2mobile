# Vis2Mobile Transformation Plan: US Population Pyramid

## 1. Analysis of Original Visualization

### Source Analysis
- **Type**: Population Pyramid (Bi-directional Bar Chart).
- **Data**: US Population distribution by age and gender over time (1850-2000).
- **Structure**:
    - **Left Side**: Female population (Pink).
    - **Center**: Age labels.
    - **Right Side**: Male population (Blue).
    - **Controls**: A simple slider to filter by `year`.
- **Issues in Mobile Aspect Ratio**:
    - **Density**: The desktop layout (three concatenated views) is rigid. Direct scaling renders the bars too thin and the central text unreadable.
    - **Controls**: The standard HTML range input is too small for touch targets.
    - **Whitespace**: The desktop screenshot shows excessive whitespace; the mobile version must utilize the full viewport height.

### Mobile-Specific Challenges
- **Horizontal Space**: Pyramids require comparing the width of left/right bars. On a ~375px wide screen, placing text in the middle reduces the area for bars.
- **Interaction**: Scrubbing through years (1850-2000) requires a precise, touch-friendly slider.
- **Vertical Height**: With ~90-100 age groups, the chart needs significant vertical space or aggregation.

---

## 2. High-Level Design & Action Plan

Based on the **Vis2Mobile Design Action Space**, here is the transformation strategy:

### L0: Container & Layout
*   **Action: `Rescale (Viewport)`**
    *   **Reason**: The desktop version uses a fixed width (800px). The mobile version must set `width: 100%` and `height: 100vh` to create an immersive app-like experience.
*   **Action: `Reposition (Controls)`**
    *   **Reason**: The top-aligned slider is hard to reach on large phones. I will move the "Year" control to a **bottom glassmorphic control deck** for easy thumb access.

### L1: Data Model
*   **Action: `Recompose (Aggregate)` (Conditional)**
    *   **Reason**: If the raw data has single-year age increments (0, 1, 2...), 100 bars are too many for a mobile screen height without scrolling. I will aggregate age into 5-year bins (0-4, 5-9...) to improve readability and bar touch targets, reducing the number of bars to ~20.

### L2: Coordinate System (Butterfly Layout)
*   **Action: `Transpose (Axes)` (Maintained)**
    *   **Reasoning**: A population pyramid *is* essentially a transposed bar chart (horizontal bars). We will keep this orientation.
*   **Action: `Rescale (Aspect Ratio)`**
    *   **Reason**: Maximize vertical space. The chart will occupy the central area between the header and bottom controls.

### L3: Axes & Reference Lines
*   **Action: `Reposition (Axis Labels)`**
    *   **Reason**: The standard "View A | View B | View C" concatenation wastes space. I will use a **Diverging Bar Chart** strategy where the Y-axis (Age) is centered.
    *   **Detail**: The "Female" data will be treated as negative values for rendering purposes to grow leftwards, but formatted as positive numbers in labels.
*   **Action: `Simplify (Ticks)`**
    *   **Reason**: The X-axis (Population) ticks might crowd the screen. I will reduce `tickCount` to 3 or 4 and use short number formatting (e.g., "2M", "4M") instead of full numbers.

### L4: Data Marks (Bars)
*   **Action: `Rescale (Bar Width/Gap)`**
    *   **Reason**: Adjust `barSize` and `gap` to ensure bars are tappable.
*   **Action: `Emphasize (Color)`**
    *   **Reason**: The original colors are standard Vega defaults. I will upgrade to a premium palette: A soft gradient Blue (Male) and vibrant Rose/Purple (Female) with better contrast against a dark or light mode background.

### L5: Interaction
*   **Action: `Reposition (Fix Tooltip)`**
    *   **Reason**: Hover doesn't work on mobile.
    *   **Strategy**: Touching a bar will trigger a specific "Highlight State". A summary card (Total Population for that age group, M/F split) will appear at the top or inside the tooltip area, rather than a floating box covering the finger.
*   **Action: `Features (Animation)`**
    *   **Reason**: The "Wow" factor. Adding a "Play" button next to the year slider to auto-increment the year, smoothly animating the pyramid transitions.

---

## 3. Data Extraction & Processing

### Source
The data is hosted at: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/population.json`.

### Schema
Based on standard Vega datasets, the JSON structure is:
```json
[
  {"year": 1850, "age": 0, "sex": 1, "people": 1483789},
  {"year": 1850, "age": 0, "sex": 2, "people": 1450376},
  ...
]
```
- `year`: integer (1850 - 2000, step 10)
- `age`: integer (0 - 90+)
- `sex`: 1 (Male), 2 (Female)
- `people`: integer (Count)

### Extraction Strategy
1.  **Fetch**: Retrieve the JSON data.
2.  **Filter**: Allow filtering by `year` state.
3.  **Transform**:
    - Convert `sex` 1 -> "Male", 2 -> "Female".
    - Create a unified object for Recharts: `{ age: "0", male: 1483789, female: 1450376 }`.
    - **Logic for Recharts**: Set `female` as negative values `(-1 * people)` so they extend to the left of the Y-axis (0), but format the tooltips/ticks to show absolute values.
4.  **Aggregation (Optimization)**: Group ages into buckets (0-4, 5-9, etc.) if the visual density is too high for the screen height.

---

## 4. Implementation Steps

### Step 1: Project Setup & Components
- Create `Visualization.tsx` using the provided tech stack.
- Install `recharts`, `lucide-react`, `clsx`, `tailwind-merge`.

### Step 2: Data Handling
- Implement a `usePopulationData` hook.
- Download the raw JSON and include it or fetch it on mount.
- Implement the transformation logic:
    - Group by Year.
    - Transform shape to `{ age, male, female, maleDisplay, femaleDisplay }`.
    - Note: Ensure "female" values are negative for the layout, but store positive values for display.

### Step 3: UI Layout (Mobile Shell)
- **Header**: Title "US Population", dynamic subtitle showing the Total Population for the selected year.
- **Main Content**: `ResponsiveContainer` holding the Recharts component.
- **Footer (Controls)**:
    - A slider for the `year` (1850-2000).
    - A "Play/Pause" button (Lucide icons) to animate through history.
    - Previous/Next chevron buttons for fine-tuning.

### Step 4: Recharts Implementation
- Component: `BarChart` with `layout="vertical"` and `stackOffset="sign"`.
- **Y Axis**:
    - `type="category"`, `dataKey="age"`.
    - Position: center? *Correction*: Recharts doesn't easily do a center axis labels column.
    - *Workaround*: Hide the Y-axis lines. Render the bars. Use a custom absolute-positioned `div` or SVG layer in the center of the chart to render the Age labels (0, 10, 20...) so they sit *on top* of the spine.
- **X Axis**:
    - Two X Axes? No, one X axis centered at 0.
    - `type="number"`.
    - `tickFormatter`: `Math.abs(value)` to hide the negative sign for females.
- **Bars**:
    - `Bar` (Female): dataKey `female` (negative values), Color: Pink/Purple.
    - `Bar` (Male): dataKey `male` (positive values), Color: Blue.
- **Tooltip**: Custom `Cursor` or externalize the state to a card.

### Step 5: Styling & Polish
- Apply **Tailwind** classes for typography (Inter/Sans).
- Use **Glassmorphism** (backdrop-blur, translucent white/black) for the control panel to ensure the chart is visible behind it.
- Ensure transitions between years are smooth (Recharts `isAnimationActive`).

### Step 6: Readability Check
- Ensure font sizes for axes are at least 10-12px.
- Ensure bar colors have sufficient contrast.
- Verify that the "Age" text in the center doesn't get obscured by the bars (add a text-shadow or background pill).