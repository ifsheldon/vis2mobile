# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

- **Source**: The original is a Vega-Lite visualization consisting of a **Horizontal Concatenation (`hconcat`)**.
- **Left View**: A Scatter Plot correlating `Horsepower` (X-axis) vs `Miles_per_Gallon` (Y-axis). It has an interval selection (brush) feature.
- **Right View**: A text-based "Table" constructed using Vega marks, displaying `Horsepower`, `MPG`, and `Origin`. It is filtered dynamically based on the brush selection on the left.
- **Data**: Real automotive dataset embedded in the HTML (`datasets` object), containing fields: `Name`, `Miles_per_Gallon`, `Cylinders`, `Displacement`, `Horsepower`, `Weight_in_lbs`, `Acceleration`, `Year`, `Origin`.
- **Desktop vs. Mobile Issues**:
    - **Layout**: The side-by-side (`hconcat`) layout fails completely on mobile (as seen in `desktop_on_mobile.png`). The scatter plot becomes extremely narrow, and the text table on the right overlaps or becomes unreadable.
    - **Interaction**: The "Brush" interaction (drag to select an area) is notoriously poor on mobile devices due to conflict with page scrolling and the "fat-finger" problem.
    - **Typography**: The text marks in the right-hand view are static and not responsive.

## 2. Transformation Plan (Based on Design Action Space)

### High-Level Strategy
I will transform the layout from a horizontal split to a **Vertical Stack (Serialize Layout)**. The Scatter Plot will take the prominent top position, and the Data Table will be transformed into a list of cards below the chart. The complex "Brushing" interaction will be replaced with a simplified "Click/Touch" interaction or simply presenting the data in a readable list format to ensure mobile usability.

### Detailed Actions

#### **L0: Visualization Container**
- **Action**: `Transpose (Serialize layout)`
    - **Reason**: The original side-by-side layout compresses the X-axis of the scatter plot into uselessness on mobile.
    - **Plan**: Stack the components vertically.
        1.  **Top**: Interactive Scatter Plot (Height ~300-400px).
        2.  **Bottom**: Scrollable Data List (replacing the Vega text view).
- **Action**: `Rescale`
    - **Reason**: Fit the width to 100% of the mobile device width (`w-full`) while maintaining a readable aspect ratio (e.g., 1:1 or 4:3) for the scatter plot.

#### **L1: Chart Components (Scatter Plot)**
- **Action**: `Decimate Ticks` (L3 Axis)
    - **Reason**: On mobile, showing every tick for Horsepower (0-240) creates clutter.
    - **Plan**: Reduce tick count on X-axis to ~4-5 items. Simplify Y-axis ticks.
- **Action**: `Reposition` (L3 Legend/Axis Titles)
    - **Reason**: Axis titles take up valuable screen space.
    - **Plan**: Move unit labels (e.g., "MPG", "HP") to the top-left of the chart or inline with the first tick to save vertical/horizontal space.
- **Action**: `Rescale` (L4 Data Marks)
    - **Reason**: Small dots are hard to tap on touchscreens.
    - **Plan**: Increase the radius of the scatter points (`r`) slightly. Add a transparent "halo" or increased hit area for better touch interactions.

#### **L2: Narrative / Data Presentation (The "Table")**
- **Action**: `Recompose (Replace)`
    - **Reason**: The original used SVG Text marks to simulate a table. This is not semantic or responsive.
    - **Plan**: Replace the Vega text view with a **Native React List** using Tailwind. Each car will be a "Card" displaying Name, Origin, HP, and MPG.
- **Action**: `Reposition`
    - **Plan**: Place this list *below* the chart. This preserves the "Detail View" intention of the original visualization without cramping the screen.

#### **L4: Interaction**
- **Action**: `Recompose (Remove)` Brushing
    - **Reason**: Brushing (Interval selection) is poor UX on mobile web (conflicts with scroll).
    - **Plan**: Remove the brush requirement.
- **Action**: `Recompose (Replace)` Trigger -> Click/Touch
    - **Reason**: To see specific values.
    - **Plan**: Implement a **Custom Tooltip** that appears on touch. When a user taps a point, a premium-styled tooltip (Glassmorphism) appears showing the specific car's name and stats.

### Data Extraction Strategy
1.  **Source**: I will parse the `datasets['data-ad3a0dd023cd6593db8ec56326f31fcb']` JSON array from the source HTML.
2.  **Validation**: I will filter out invalid data points (e.g., where `Miles_per_Gallon` or `Horsepower` is `null`, as seen in the data: `citroen ds-21 pallas` has `null` MPG).
3.  **Formatting**:
    - `Horsepower`: X-axis (Quantitative).
    - `Miles_per_Gallon`: Y-axis (Quantitative).
    - `Origin`: Nominal (Used for tooltip context).
    - `Name`: Nominal (Used for tooltip title).

## 3. Implementation Steps

1.  **Extract Data**: Copy the JSON array from the HTML source into a constant variable `CAR_DATA` in the component. Filter out null values for HP or MPG.
2.  **Setup Layout**: Create a main container with `flex flex-col gap-6 p-4`.
3.  **Build Scatter Plot**:
    - Use `Recharts` `<ScatterChart>`.
    - Map `Horsepower` to X Axis (Type: number).
    - Map `Miles_per_Gallon` to Y Axis (Type: number).
    - Style axis lines to be subtle (`stroke-gray-200`).
    - Style dots with a premium color palette (e.g., Indigo/Violet gradient or solid Steelblue with opacity).
4.  **Implement Tooltip**:
    - Create a `CustomTooltip` component.
    - Show `Name` (Bold), `HP`, `MPG`, and `Origin`.
    - Apply Glassmorphism (`backdrop-blur`, `bg-white/90`, `shadow-xl`).
5.  **Build Detail List (The "Table" Replacement)**:
    - Render a `<div>` below the chart.
    - Header: "Top Performing Models" or "Vehicle Data".
    - Content: A list of the top 5-10 cars (sorted by MPG descending) to simulate the "Table" view, or a scrollable container for all cars. Given the mobile constraint, showing the *Top 10* most efficient cars is a good default view to preserve the "detailed data" intention.
6.  **Styling**: Use Tailwind for responsive typography (large numbers, readable labels) and spacing.