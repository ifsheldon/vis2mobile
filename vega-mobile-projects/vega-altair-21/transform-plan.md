# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### **Source Characteristics**
- **Type**: Faceted Density Plot (Ridge Plot variant).
- **Data Source**: `spec.datasets` contains raw data for Penguin species (Adelie, Chinstrap, Gentoo) with measurements: Beak Length, Beak Depth, Flipper Length, Body Mass.
- **Vega-Lite Transforms**:
    1.  **Fold**: Collapses columns ("Beak Length", "Beak Depth", "Flipper Length") into two columns: `Measurement Type` (key) and `value`.
    2.  **Density**: Calculates Kernel Density Estimation (KDE) for the `value` grouped by `Measurement Type`.
- **Layout**: Three vertically stacked rows (Facet).
- **Scales**:
    - **X-Axis**: **Shared Global Scale** (0 to ~240). This results in "Beak Depth" (values ~15-20) being squeezed to the far left, and "Flipper Length" (values ~170-230) being at the far right. There is significant wasted whitespace in the middle of each row.
    - **Y-Axis**: Density value (independent range per row).

### **Mobile & Design Issues (`desktop_on_mobile.png`)**
- **Illegible Text**: Axis labels and headers are too small.
- **Wasted Space**: The global X-axis scale is inefficient for mobile. A 15mm beak depth plotted on a 0-240mm scale occupies <10% of the screen width. On a mobile device (e.g., 375px wide), the data curve would be less than 40px wide.
- **Interaction**: No touch-friendly way to read specific values.
- **Layout**: The left-side Y-axis labels ("Measurement Type") consume ~25% of the horizontal space, further compressing the charts.

## 2. High-Level Design Strategy

My strategy focuses on **maximizing data visibility** and **readability** on a narrow screen.

1.  **Layout Topology**: Convert the "Small Multiples" grid into a **Vertical Card Stack**.
2.  **Space Reclamation**: Move row labels (e.g., "Beak Depth") from the left axis to a **Header** above each chart. This allows the chart to span the full width (100%) of the container.
3.  **Scale Optimization (Crucial Change)**: I will abandon the shared global X-axis. Instead, I will use **Independent Domains** for each measurement type.
    - *Reasoning*: On mobile, we cannot afford 80% whitespace. "Beak Depth" needs to span the full width to show the distribution shape clearly. I will add clear X-axis ticks to indicate the range change.
4.  **Premium Aesthetics**: Use **Glassmorphism** cards, smooth **Gradient Fills** for the density areas, and **Lucide Icons** to represent the measurements visually.

## 3. Design Action Space & Justification

### **L0: Visualization Container**
-   **Action: `Rescale`**
    -   Set `width: 100%` and `height: auto`. The container will flow vertically.

### **L1: Data Model (Crucial Step)**
-   **Action: `Recompose (Aggregate/Transform)`**
    -   **Context**: The raw data is points. The visualization is density (Area).
    -   **Plan**: I must implement a **Kernel Density Estimation (KDE)** function in the React component (or utility) to process the raw data into smooth curves `[{value: x, density: y}]`. This mimics the Vega-Lite `density` transform.

### **L1: Chart Components**
-   **Action: `Serialize Layout`**
    -   Stack the three density charts vertically with consistent spacing (`gap-6`).

### **L2: Title Block**
-   **Action: `Reposition` (Headers)**
    -   Move specific measurement labels ("Beak Length") from the Y-Axis to the top-left of each chart panel.
    -   Style: Bold, readable typography (Tailwind `text-lg font-semibold`).

### **L3: Axes (X-Axis)**
-   **Action: `Change Domain` (Action Space: Axis)**
    -   **Original**: Global [0, 240].
    -   **Mobile**: Independent domains (e.g., Beak Depth [10, 25], Flipper [170, 240]).
    -   **Justification**: Essential for mobile visibility.
-   **Action: `Decimate Ticks`**
    -   Limit X-axis ticks to 3-5 items to prevent overlapping text.

### **L3: Axes (Y-Axis)**
-   **Action: `Recompose (Remove)`**
    -   Remove visual Y-axis lines and ticks. The absolute "density" value (e.g., 0.15 vs 0.20) is less important than the *shape* of the distribution.
    -   **Compensate**: If exact density matters, show it in a Tooltip.

### **L1: Interaction Layer**
-   **Action: `Trigger (Click/Touch)` instead of Hover**
    -   Implement a **Custom Cursor** that snaps to the finger's position.
-   **Action: `Feedback (Fix Tooltip Position)`**
    -   Display the selected value (e.g., "18.5 mm") in a fixed overlay or a dynamic header label rather than a floating tooltip that might be obscured by the finger.

## 4. Data Extraction Plan

I will not use fake data. I will extract the raw array from the source HTML's `datasets['data-783f637a646b8ff8439f6e7d741cecf0']`.

**Steps:**
1.  Copy the `datasets` object into a constant `RAW_DATA`.
2.  Create a utility function `processData(data)`:
    -   Filter out `null` values for the relevant fields.
    -   Extract arrays for: `Beak Length (mm)`, `Beak Depth (mm)`, `Flipper Length (mm)`.
    -   Implement a generic **KDE (Kernel Density Estimation)** function.
        -   *Input*: Array of numbers.
        -   *Output*: Array of objects `{ value: number, density: number }` suitable for Recharts `Area`.
    -   The KDE function will need a bandwidth parameter (can be estimated using "Silverman's rule of thumb").

## 5. Implementation Steps

1.  **Setup**: Initialize basic card structure using Tailwind.
2.  **Data Processing**:
    -   Write the KDE algorithm in TypeScript.
    -   Process `RAW_DATA` into three separate datasets: `beakLengthData`, `beakDepthData`, `flipperLengthData`.
3.  **Component Construction (`DensityChart`)**:
    -   Create a reusable component receiving `data`, `color`, `title`, and `unit`.
    -   Use `Recharts` -> `AreaChart`.
    -   Configure `XAxis`: `type="number"`, `domain={['auto', 'auto']}`, `tickCount={5}`.
    -   Configure `YAxis`: Hidden.
    -   Configure `Area`: Use `monotone` curve, gradient fill (using `defs`).
    -   Add `CartesianGrid` (vertical only, subtle).
4.  **Styling**:
    -   Use a dark/vibrant theme ("Premium"). Dark background, bright distinct colors for the three metrics (e.g., Cyan for Flipper, Pink for Beak Length, Purple for Beak Depth) to differentiate them since they are now separate charts.
    -   Add `Tooltip` (custom cursor) that updates a state to show the active value prominently.
5.  **Refinement**: Ensure fonts are legible (>14px for body, >18px for headers) and touch targets are adequate.

This plan ensures the original statistical insight (distribution of measurements) is preserved while drastically improving readability and usability on mobile devices.