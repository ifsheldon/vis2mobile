# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Original Desktop Visualization
- **Type**: Connected Scatterplot.
- **Data Source**: `driving.json` (Year, Miles driven per capita, Price of gas).
- **Encoding**:
    - **X-Axis**: Miles per person (Quantitative).
    - **Y-Axis**: Cost of gas (Quantitative).
    - **Order**: Year (Temporal sequence connecting the points).
    - **Marks**: Points connected by line segments.
- **Narrative**: The chart shows the relationship between driving habits and gas prices over time, revealing correlations and "hysteresis" loops (e.g., prices go up, driving goes down).

### Mobile Issues (Desktop on Mobile)
- **Aspect Ratio Mismatch**: The wide aspect ratio of the desktop chart, when squeezed onto a mobile screen, flattens the loop, making the vertical changes in gas prices harder to distinguish.
- **Readability**: Axis labels (Miles/Gas prices) will likely become microscopic.
- **Lack of Temporal Context**: On a static desktop view, users can often hover to see the year. On mobile, without interaction, the user sees a "spaghetti line" and doesn't know which end is the start (1956) or the end (2010), nor the direction of time.
- **Touch Targets**: Individual points are too small to tap on a phone screen.

## 2. High-Level Design & Action Space

To transform this into a premium mobile experience, we will treat the chart as a **narrative timeline** rather than just a static statistical plot.

### Key Actions from Design Space

1.  **L0 Visualization Container: `Rescale` & `Reposition`**
    *   **Action**: Change the container to a square (1:1) or slightly portrait aspect ratio (e.g., 4:5).
    *   **Reasoning**: A connected scatterplot relies on 2D spatial patterns. A square aspect ratio maximizes the visible area on a mobile width while preserving the slope relationships better than a squashed landscape view.

2.  **L3 Axes / L4 Ticks: `Decimate Ticks` & `Simplify Labels`**
    *   **Action**: Drastically reduce tick counts (e.g., 3-4 ticks per axis) and simplify labels (e.g., "$1.50" instead of "$1.50/gallon").
    *   **Reasoning**: Mobile screens lack horizontal space. We need to reduce visual clutter (L2 "Cluttered text") to focus on the data shape.

3.  **L1 Interaction / L2 Feedback: `Fix Tooltip Position` & `Triggers (Scrub)`**
    *   **Action**: Instead of standard touch tooltips (which get blocked by fingers), implement a **"Dashboard Header"** that displays the data of the *active* year.
    *   **Action**: Implement a **Year Slider** (Scrubber) separate from the chart or allow dragging on the chart area to scrub through time.
    *   **Reasoning**: This solves the "Fat-finger problem" and the lack of temporal context. The user controls "Time" via a slider, and the chart updates to highlight that specific year on the path.

4.  **L2 Data Marks: `Recompose (Change Encoding)` - Visual Hierarchy**
    *   **Action**: Use a gradient line or a "trace" effect. The full path is shown in a subtle color (context), and the path *up to the current selected year* is highlighted (focus).
    *   **Reasoning**: This clarifies the direction of time, which is lost in a static static view.

## 3. Detailed Implementation Steps

### Data Extraction Strategy
1.  **Fetch Data**: We need to perform an HTTP GET request to `https://vega.github.io/editor/data/driving.json` to get the real data.
2.  **Schema**: The data is an array of objects: `{ side: "left" | "right", year: number, miles: number, gas: number }`.
3.  **Processing**: Sort by `year` ascending to ensure the connected line draws correctly.

### Component Architecture

1.  **Container (L0)**
    *   Use a Card-based layout with Glassmorphism effects.
    *   Padding: `p-4` to ensure chart doesn't touch edges.

2.  **Header (L2 Title / L2 Feedback)**
    *   **Top Section**: A dynamic dashboard showing the currently selected **Year**.
    *   **Sub-stats**: Large, readable typography displaying `Gas Price` and `Miles/Capita` for that specific year.
    *   **Style**: Use Lucide icons (`Fuel`, `Car`, `Calendar`) for quick visual recognition.

3.  **Visualization (L1 Chart Components)**
    *   **Library**: `Recharts`.
    *   **Type**: `ScatterChart`.
        *   **XAxis**: `dataKey="miles"`, type="number", domain=['auto', 'auto'].
        *   **YAxis**: `dataKey="gas"`, type="number", domain=['auto', 'auto'].
        *   **ZAxis**: `dataKey="year"`.
    *   **Series 1 (Context)**: A light gray line connecting all points (The full "map").
    *   **Series 2 (Active Trace)**: A colored line connecting points from `Start Year` to `Selected Year`.
    *   **Series 3 (Active Point)**: A large, pulsing dot representing the `Selected Year`.
    *   **Customization**: Custom Tooltip is disabled; we use the Header for feedback.

4.  **Interaction Control (L2 Triggers)**
    *   **Slider**: A range input (`<input type="range" />`) at the bottom of the card.
    *   **Range**: Min Year to Max Year.
    *   **Auto-Play**: A small "Play" button to animate the trajectory automatically, creating a "cinematic" data experience.

5.  **Styling (Premium Aesthetics)**
    *   **Color Palette**: Deep background (Slate/Zinc 900) with neon accents (Cyan/Fuchsia) for the active data trace to contrast against the dark mode.
    *   **Typography**: Monospace font for numbers to prevent layout shift during scrubbing.

## 4. Summary of Actions

| Target Layer | Action | Implementation |
| :--- | :--- | :--- |
| **L0 Container** | `Rescale` | Set Aspect Ratio to 1:1 or 4:5. Use `w-full`. |
| **L3 Axes** | `Decimate Ticks` | Limit X/Y axis ticks to 4 max. |
| **L2 Feedback** | `Fix Tooltip Position` | Move data details to a fixed "Dashboard" header above the chart. |
| **L2 Triggers** | `Recompose (Replace)` | Replace Hover with a global "Year" state controlled by a Slider. |
| **L2 DataMarks** | `Recompose (Emphasis)` | Highlight path from start -> current year to show directionality. |
| **L4 Labels** | `Simplify Labels` | Format currency and large numbers (e.g., "10k") for brevity. |

This plan transforms a static, confusing loop into an interactive journey through history, perfectly suited for a mobile touch interface.