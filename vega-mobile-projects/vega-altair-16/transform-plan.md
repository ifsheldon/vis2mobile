# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Original)
*   **Type**: Bubble Chart (Scatter plot with size encoding).
*   **Axes**:
    *   **X-Axis**: Temporal (Year 1900–2017).
    *   **Y-Axis**: Nominal (Entity/Disaster Type: Drought, Epidemic, Flood, etc.).
*   **Encodings**:
    *   **Position**: Time (X) vs Type (Y).
    *   **Size**: Quantitative (Deaths).
    *   **Color**: Nominal (Matches Disaster Type).
*   **Information Density**: Moderate. It compares the frequency and severity of different disaster types over a long century.
*   **Key Narrative**: Highlighting the most deadly disaster types (Droughts/Epidemics in early 20th century vs Earthquakes/Extreme weather).

### Mobile Aspect Ratio Issues
*   **Aspect Ratio Mismatch**: The desktop chart is wide (Landscape). Mobile is tall (Portrait).
*   **Squished Time Axis**: Compressing 117 years into a mobile width (~350px) results in ~3px per year. Bubbles will severely overlap, making individual events indistinguishable.
*   **Unreadable Labels**: The Y-axis labels ("Extreme temperature", "Mass movement (dry)") are long. In a standard chart scaling, these would either wrap awkwardly, be tiny, or consume 40% of the screen width.
*   **Visual Clutter**: The "Bubble" size legend takes up space that is not available on mobile.

## 2. High-Level Design Strategy

The core strategy is **Serialize Layout (Vertical Stacking) and Faceting**.

Trying to force the single large chart into a mobile screen via simple resizing (`Rescale`) will fail due to the density of the time axis and the length of Y-axis labels.

Instead, we will break the visualization into **Small Multiples**. We will treat each "Disaster Type" as a separate card/row stacked vertically. This leverages the natural vertical scrolling behavior of mobile devices.

*   **From**: One large X/Y chart.
*   **To**: A vertical list of timeline charts. Each item in the list represents one Disaster Type (e.g., a "Flood" card, a "Drought" card).

## 3. Design Action Space Plan

### L0 & L1: Container & Chart Structure
*   **Action**: `Serialize layout` (L1 - Chart Components).
    *   **Reasoning**: Split the single chart into multiple distinct charts based on the "Entity" field.
    *   **Implementation**: Create a flexible vertical layout (`flex-col`). Each "Entity" gets its own component block.
*   **Action**: `Rescale` (L0 - Container).
    *   **Reasoning**: Ensure the container fits 100% of the mobile viewport width.

### L2: Coordinate System & Data Marks
*   **Action**: `Recompose (Remove)` (L3 - Axes - Y Axis).
    *   **Reasoning**: Since we are splitting into cards, we don't need a Y-axis on the left.
    *   **Alternative**: Use the **L2 Title Block** of each specific card to display the Disaster Type (e.g., "Flood"). This saves horizontal space for the actual data.
*   **Action**: `Rescale` (L5 - Mark Instance).
    *   **Reasoning**: The bubble sizes need to be recalibrated for mobile. The maximum radius must be capped to prevent a single event from obscuring the entire timeline, while still maintaining relative differences.
*   **Action**: `Change Encoding` (L2 - Data Marks).
    *   **Reasoning**: To improve readability on the timeline, we will ensure bubbles have a slight transparency (opacity) and potentially a stroke to define boundaries in overlapping areas.

### L3 & L4: Axes & Legends
*   **Action**: `Recompose (Remove)` (L4 - Legend Title / Items).
    *   **Reasoning**: A global color legend is redundant because each "Card" will be titled with the disaster name and colored accordingly.
    *   **Action**: `Compensate (Toggle)` (L3 - Legend Block) - *Optional*: We can place a size legend (indicating death count scale) at the very bottom of the page or in an info modal, rather than taking up screen space permanently.
*   **Action**: `Simplify labels` (L5 - Tick Label).
    *   **Reasoning**: The X-axis (Year) on every single card might be repetitive.
    *   **Refinement**: We will add a subtle X-axis (e.g., 1900, 1950, 2000) to the *bottom* of each card to ensure context is maintained as the user scrolls, but keep it minimal to save vertical height.

### L5: Interaction & Feedback
*   **Action**: `Reposition (Fix)` (L2 - Feedback).
    *   **Reasoning**: Tooltips on hover do not work on mobile.
    *   **Action**: `Triggers -> Click`. Tapping a bubble will trigger a **Fixed Bottom Sheet** or a **Highlight Card**.
    *   **Detail**: When a user taps a bubble, a customized detail view appears at the bottom of the screen showing: "Event: Flood", "Year: 1931", "Deaths: 3.7M". This solves the "fat finger" problem by decoupling selection from data display.
*   **Action**: `Recompose (Remove)` (L2 - Features - Zoom/Pan).
    *   **Reasoning**: We will avoid complex zoom interactions on the X-axis to prevent conflict with vertical page scrolling. The vertical layout provides enough clarity.

## 4. Data Extraction Plan

The data is sourced from `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/disasters.csv`.

1.  **Fetch**: I will write a script to fetch the CSV content during the coding phase.
2.  **Parse**: Use a CSV parser (like `d3-dsv` or standard string manipulation) to convert it to JSON.
3.  **Type Definition**:
    ```typescript
    type DisasterEvent = {
      Entity: string; // e.g., "All natural disasters", "Drought", "Earthquake"
      Year: number;
      Deaths: number;
    };
    ```
4.  **Cleaning**:
    *   Filter out `Entity === "All natural disasters"` (as per original spec `transform: [{"filter": "(datum.Entity !== 'All natural disasters')"}]`).
    *   Group data by `Entity` to facilitate the "Small Multiples" layout.
    *   Calculate Max Deaths to normalize the bubble size scale across all charts (global domain).

## 5. Implementation Steps

1.  **Setup Component Structure**:
    *   `Visualization.tsx`: Main container.
    *   `DisasterRow.tsx`: Sub-component for a single disaster type timeline.
    *   `DetailDrawer.tsx`: Component for displaying clicked bubble data.

2.  **Data Processing**:
    *   Fetch and parse the CSV data.
    *   Determine the unique list of Entities.
    *   Determine the global `[min, max]` for the `Deaths` field to ensure bubble sizes are comparable across different rows.

3.  **Layout Implementation (Next.js + Tailwind)**:
    *   Create a vertical scroll container.
    *   Header: "Global Deaths from Natural Disasters" (Modern Typography).
    *   Map through entities to render `DisasterRow` components.

4.  **Chart Implementation (Recharts)**:
    *   Use `ScatterChart` (Recharts' bubble equivalent).
    *   XAxis: Type number (Year), Domain `[1900, 2018]`, Hide axis line/ticks for cleaner look (or use minimal ticks).
    *   YAxis: Hidden (Height fixed per row).
    *   ZAxis: Range `[0, MaxSize]` mapped to Deaths.
    *   Tooltip: Custom trigger (onClick updates React state).

5.  **Styling & Polish**:
    *   **Color Palette**: Map distinct colors to entities (e.g., Drought=Blue, Fire=Red, etc.).
    *   **Typography**: Use system sans-serif with varying weights.
    *   **Glassmorphism**: Apply to the Detail Drawer.
    *   **Animation**: `Recharts` standard animation on load.

6.  **Edge Case Handling**:
    *   **Overplotting**: Use `fillOpacity` to show density.
    *   **Zero Values**: Ensure years with 0 deaths (if any) don't clutter the view (Scatter plot handles sparse data well).

This plan ensures all original data is present but restructured for a vertical, touch-friendly experience, fulfilling the "Premium Aesthetics" and "Mobile-First UX" requirements.