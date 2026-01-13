# Mobile Visualization Plan: US Electricity Generation Trends

## 1. Analysis of Original Visualization
*   **Source**: A Stacked Area Chart created with Vega-Lite showing Net Generation of electricity by source (Fossil Fuels, Nuclear Energy, Renewables) from 2001 to 2017.
*   **Desktop Features**: 
    *   Time-series X-axis (Year).
    *   Quantitative Y-axis (Net Generation).
    *   Color encoding for energy source.
    *   Legend positioned on the right side.
    *   Gridlines on both axes.
*   **Mobile Issues (Observed in `desktop_on_mobile.png`)**:
    *   **Layout Distortion**: The right-sided legend consumes ~25-30% of the screen width, compressing the actual chart into a narrow vertical strip. This makes the time trends difficult to read.
    *   **Touch Targets**: Hover-based tooltips in Vega-Lite are not optimized for mobile touch interactions.
    *   **Label Readability**: Axis labels and legend text are too small when scaled down.
    *   **Information Density**: Showing every even year on the X-axis might crowd the screen on narrow devices.

## 2. High-Level Design Strategy & Action Space

My strategy focuses on maximizing the horizontal space for the time-series trend by relocating auxiliary elements (legend, titles) and optimizing the interaction model for touch.

### **Planned Actions & Reasoning**

#### **L0 Visualization Container**
*   **Action: `Rescale`**: Use a responsive container (`width: 100%`) with a fixed height (e.g., `350px`) suitable for mobile vertical scrolling. The aspect ratio will shift from landscape (desktop) to roughly square or slightly portrait to accommodate the legend stacking.
*   **Action: `Reposition`**: Remove the large default padding and maximize the chart area.

#### **L3 Legend Block**
*   **Action: `Reposition`**: Move the legend from the **Right** to the **Top** (below title) or **Bottom**.
    *   *Reasoning*: The "right-side legend" is the primary cause of the horizontal compression seen in `desktop_on_mobile.png`. Moving it vertically frees up width.
*   **Action: `Transpose`**: Change the legend layout from a vertical list to a horizontal flex row.
    *   *Reasoning*: Fits better in the vertical layout flow of a mobile app.

#### **L3/L4 Axes & Ticks**
*   **Action: `Decimate Ticks` (X-Axis)**: Instead of showing every 2 years (2002, 2004...), show fewer ticks (e.g., 2001, 2005, 2010, 2015).
    *   *Reasoning*: Prevents label overlap and reduces cognitive load on narrow screens.
*   **Action: `Simplify Labels` (Y-Axis)**: Format numbers (e.g., `45,000` -> `45k`).
    *   *Reasoning*: Saves horizontal space for the chart canvas.
*   **Action: `Recompose (Remove)` (Axis Lines)**: Remove the solid axis lines, keeping only subtle gridlines.
    *   *Reasoning*: Reduces visual noise (Ink-to-Data ratio).

#### **L5 Interaction & Feedback**
*   **Action: `Triggers (Replace)`**: Replace `hover` with `touch/drag` (Scrubbing).
*   **Action: `Reposition (Fix Tooltip)`**: Instead of a floating tooltip that might be covered by a finger, use a **fixed summary header** or a "Sticky Tooltip" area that updates dynamically as the user scrubs across the chart.
    *   *Reasoning*: Solves the "Fat-finger problem" mentioned in the Design Space.

#### **L2 Data Marks (Area)**
*   **Action: `Recompose (Change Encoding)` (Colors)**: The original colors are somewhat washed out. I will map them to a modern, semantic palette (e.g., Renewables = Emerald/Green, Fossil = Slate/Gray or Amber/Orange, Nuclear = Blue/Purple) to improve contrast and "Premium Aesthetics."

## 3. Data Extraction Plan

The data is embedded in the HTML `script` tag as a JSON object within `datasets`.

1.  **Source**: `datasets["data-7fb5cba8489b31900f8ac51a35bf2f48"]`
2.  **Original Format (Long/Tidy)**:
    ```json
    [
      {"year": "2001-01-01T00:00:00", "source": "Fossil Fuels", "net_generation": 35361},
      ...
    ]
    ```
3.  **Transformation for Recharts (Wide)**:
    Recharts `AreaChart` works best when all categories for a single time point are in one object.
    *   **Step 1**: Parse the `year` string to a simple year (e.g., 2001).
    *   **Step 2**: Group by `year`.
    *   **Step 3**: Pivot the `source` field into keys.
    *   **Result**:
        ```json
        [
          { "year": 2001, "Fossil Fuels": 35361, "Nuclear Energy": 3853, "Renewables": 1437 },
          { "year": 2002, "Fossil Fuels": 35991, "Nuclear Energy": 4574, "Renewables": 1963 },
          ...
        ]
        ```
    *   **Total Calculation**: I will also calculate the `Total` for each year during transformation to display in the fixed tooltip/header for context.

## 4. Detailed Implementation Steps

### Step 1: Component Structure
*   Create a Card-based container using Tailwind (glassmorphism effect: `bg-white/90 backdrop-blur-md`).
*   **Header**: Title ("US Electricity Generation") + Subtitle ("Net generation by source 2001-2017").
*   **Summary Block (Dynamic)**: A specialized area that shows the data for the *currently selected year* (or the latest year by default). This replaces the floating tooltip.
    *   Displays Year.
    *   Displays values for all 3 categories in a grid or flex row with their respective color indicators.
*   **Chart Area**: The `ResponsiveContainer` housing the `AreaChart`.
*   **Footer**: Source citation.

### Step 2: Visual Styling (Tailwind)
*   **Color Palette**:
    *   Fossil Fuels: `fill-slate-500`, `stroke-slate-600` (representing carbon/industrial).
    *   Nuclear Energy: `fill-rose-400`, `stroke-rose-500` (representing high energy/atom).
    *   Renewables: `fill-emerald-400`, `stroke-emerald-500` (representing nature/green).
*   **Typography**: `font-sans`, bold headers, distinct numeric fonts (`tabular-nums`) for values to prevent jitter during interaction.

### Step 3: Interaction Logic (React/Recharts)
*   State: `activeDataPoint` (defaults to the last data point: 2017).
*   Event Handler: `onMouseMove` / `onTouchMove` on the Chart to update `activeDataPoint`.
*   Feedback: A vertical `ReferenceLine` (Cursor) will follow the touch input.

### Step 4: Recharts Configuration
*   `<AreaChart>` with `stackOffset="expand"`? No, the original is absolute values, not percentage. We keep absolute values to show total growth.
*   `<XAxis>`: `dataKey="year"`, `tick={{fontSize: 12}}`, `tickMargin={10}`, `minTickGap={30}`.
*   `<YAxis>`: `tickFormatter={(value) => value >= 1000 ? '${value/1000}k' : value}`, `width={40}` (compact).
*   `<CartesianGrid>`: `vertical={false}`, `strokeDasharray="3 3"`, `opacity={0.3}`.
*   `<Tooltip>`: Use a custom `cursor` but **hide the content** (`content={<></>}`) because we are using the "Fixed Summary Block" strategy (L2: Reposition Tooltip).

This plan ensures the visualization is readable on mobile (via layout changes), usable (via touch interaction updates), and visually premium (via modern styling).